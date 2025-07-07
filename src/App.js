// Enhanced Weather App Code with: Unit Toggle, Multi-language, Autocomplete, Weekly Aggregation, Sound Effects, Realistic Backgrounds

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const API_KEY = '1ce8663a4b53892b745d638096d9fcee';

const weatherBackgrounds = {
  Clear: 'clear-bg',
  Clouds: 'clouds-bg',
  Rain: 'rain-bg',
  Drizzle: 'rain-bg',
  Thunderstorm: 'thunder-bg',
  Snow: 'snow-bg',
  Mist: 'mist-bg',
  Smoke: 'mist-bg',
  Haze: 'mist-bg',
  Dust: 'mist-bg',
  Fog: 'mist-bg',
  Sand: 'mist-bg',
  Ash: 'mist-bg',
  Squall: 'mist-bg',
  Tornado: 'mist-bg',
};

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('weatherHistory')) || []);
  const [unit, setUnit] = useState('metric');
  const [lang, setLang] = useState('en');
  const [showWelcome, setShowWelcome] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('weatherHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    });
  }, []);

  const playWeatherSound = (weatherMain) => {
    const soundMap = {
      Clear: 'sunny.mp3',
      Clouds: 'cloudy.mp3',
      Rain: 'rain.mp3',
      Drizzle: 'rain.mp3',
      Thunderstorm: 'thunder.mp3',
      Snow: 'snow.mp3',
      Mist: 'mist.mp3',
    };

    const sound = soundMap[weatherMain];
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(`/sounds/${sound}`);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Autoplay blocked:', err));
    audioRef.current = audio;
  };

  const fetchSuggestions = async (query) => {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
    const data = await res.json();
    setSuggestions(data);
  };

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}&lang=${lang}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}&lang=${lang}`)
      ]);
      if (!currentRes.ok) throw new Error('City not found');
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setWeather(currentData);
      const forecastList = forecastData.list.filter((_, index) => index % 8 === 0);
      setForecast(forecastList);
      setWeekly(getWeeklyStats(forecastData.list));

      const newEntry = {
        city: currentData.name,
        country: currentData.sys.country,
        temp: Math.round(currentData.main.temp),
        time: new Date().toLocaleString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
      playWeatherSound(currentData.weather[0].main);
    } catch (err) {
      setError(err.message || 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`)
      ]);
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setWeather(currentData);
      const forecastList = forecastData.list.filter((_, index) => index % 8 === 0);
      setForecast(forecastList);
      setWeekly(getWeeklyStats(forecastData.list));

      const newEntry = {
        city: currentData.name,
        country: currentData.sys.country,
        temp: Math.round(currentData.main.temp),
        time: new Date().toLocaleString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 4000);

      playWeatherSound(currentData.weather[0].main);
    } catch (err) {
      setError(err.message || 'Error fetching location weather');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyStats = (list) => {
    const daily = {};
    list.forEach(item => {
      const day = new Date(item.dt_txt).toLocaleDateString();
      if (!daily[day]) daily[day] = [];
      daily[day].push(item.main.temp);
    });
    return Object.entries(daily).map(([day, temps]) => ({
      day,
      min: Math.min(...temps),
      max: Math.max(...temps),
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
    }));
  };

  const getBackgroundClass = () => {
    if (!weather) return 'default-bg';
    const main = weather.weather[0].main;
    return weatherBackgrounds[main] || 'default-bg';
  };

  const chartData = {
    labels: forecast.map(item => new Date(item.dt_txt).toLocaleDateString()),
    datasets: [{
      label: `Temp (${unit === 'metric' ? '°C' : '°F'})`,
      data: forecast.map(item => item.main.temp),
      fill: false,
      borderColor: '#00c6ff',
      backgroundColor: '#00c6ff',
      tension: 0.3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#fff' }
      }
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' } }
    }
  };

  return (
    <div className={`app-container ${getBackgroundClass()}`}>
      <div className="weather-card">
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={e => {
              setCity(e.target.value);
              if (e.target.value.length >= 2) fetchSuggestions(e.target.value);
            }}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
          />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => {
                setCity(`${s.name}, ${s.country}`);
                setSuggestions([]);
              }}>{s.name}, {s.country}</li>
            ))}
          </ul>
        )}

        <div className="input-row">
          <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>Unit: {unit === 'metric' ? '°C' : '°F'}</button>
          <select value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 French</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="de">🇩🇪 German</option>
          </select>
        </div>

        {showWelcome && <div className="welcome-message">👋 Welcome! Showing weather for your location.</div>}
        {loading && <div className="spinner"></div>}
        {error && <div className="error">{error}</div>}

        {weather && (
          <div className="weather-info">
            <h3>{weather.name}, {weather.sys.country}</h3>
            <div className="weather-main">
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="weather icon" className="weather-icon" />
              <div>
                <div className="temp">{Math.round(weather.main.temp)}°</div>
                <div className="desc">{weather.weather[0].description}</div>
              </div>
            </div>
            <div className="weather-details">
              <div>💧 {weather.main.humidity}%</div>
              <div>🌬️ {weather.wind.speed} m/s</div>
              <div>🔽 {weather.main.pressure} hPa</div>
              <div>🌡️ Feels like: {Math.round(weather.main.feels_like)}°</div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <>
            <div className="forecast">
              <h4>📅 5-Day Forecast</h4>
              <div className="forecast-row">
                {forecast.map((item, i) => (
                  <div key={i} className="forecast-card">
                    <div>{new Date(item.dt_txt).toLocaleDateString()}</div>
                    <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="" />
                    <div>{Math.round(item.main.temp)}°</div>
                    <div>{item.weather[0].main}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </>
        )}

        {weekly.length > 0 && (
          <div className="history">
            <h4>📊 Weekly Stats</h4>
            <ul>
              {weekly.map((w, i) => (
                <li key={i}>{w.day}: Min {w.min}°, Max {w.max}°, Avg {w.avg}°</li>
              ))}
            </ul>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h4>🕓 Recent Searches</h4>
            <ul>
              {history.map((h, i) => (
                <li key={i}>{h.city}, {h.country} - {h.temp}° at {h.time}</li>
              ))}
            </ul>
          </div>
        )}

        <footer>© 2025 Weatherly | Built by Lowrence Devu</footer>
      </div>

      <div className="animated-bg">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="rain"></div>
        <div className="snow"></div>
        <div className="sun"></div>
        <div className="thunder"></div>
      </div>
    </div>
  );
}

export default App;
