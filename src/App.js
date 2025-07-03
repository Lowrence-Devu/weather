import React, { useState } from 'react';
import './App.css';

const API_KEY = '1ce8663a4b53892b745d638096d9fcee'; // <-- replace with your key

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
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message || 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClass = () => {
    if (!weather) return 'default-bg';
    const main = weather.weather[0].main;
    return weatherBackgrounds[main] || 'default-bg';
  };

  return (
    <div className={`app-container ${getBackgroundClass()}`}>
      <div className="weather-card">
        <h2>🌤️ Enhanced Weather App</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
          />
          <button onClick={fetchWeather} disabled={loading || !city}>
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {weather && (
          <div className="weather-info">
            <h3>
              {weather.name}, {weather.sys.country}
            </h3>
            <div className="weather-main">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
              <div>
                <div className="temp">{Math.round(weather.main.temp)}°C</div>
                <div className="desc">{weather.weather[0].description}</div>
              </div>
            </div>
            <div className="weather-details">
              <div>💧 Humidity: {weather.main.humidity}%</div>
              <div>🌬️ Wind: {weather.wind.speed} m/s</div>
              <div>🔽 Pressure: {weather.main.pressure} hPa</div>
              <div>🌡️ Feels like: {Math.round(weather.main.feels_like)}°C</div>
              <div>🕒 Time: {new Date(weather.dt * 1000).toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>
      {/* Animated background elements */}
      <div className="animated-bg">
        {/* Clouds */}
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        {/* Rain */}
        <div className="rain"></div>
        {/* Snow */}
        <div className="snow"></div>
        {/* Sun */}
        <div className="sun"></div>
        {/* Thunder */}
        <div className="thunder"></div>
      </div>
    </div>
  );
}

export default App;
