const apiKey = "3a58d57be667e419d11430ebc8ac6896";

// DOM elements
const cityInput = document.querySelector('.search-city');
const getForecastBtn = document.querySelector('.get-forecast');
const locationContainer = document.querySelector('.location-container');
const currentWeatherContainer = document.querySelector('.current-weather-container');
const todayForecastContainer = document.querySelector('.today-forecasts-container');
const iconContainer = document.querySelector('.icon-container');
const airConditionsContainer = document.querySelector('.air-conditions-container');
const seeMoreBtn = document.querySelector('.see-more');

/* -------------------- 1. DATA LAYER -------------------- */

// Fetch current weather by city name
async function fetchCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

// Fetch 5-day forecast by city name
async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

// Reverse geocode lat/lon to get city info
async function fetchCityFromCoords(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

/* -------------------- 2. RENDERING LAYER -------------------- */

function renderLocation(city) {
  locationContainer.innerHTML = `
    <p>${city}</p>`;
}

function renderCurrentWeather(data) {
  const icon = data.weather[0].icon;
  currentWeatherContainer.innerHTML = `${data.main.temp}&deg;C`;
  iconContainer.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png">`;
  airConditionsContainer.innerHTML = `
    <br> Real feel: ${data.main.feels_like}
    <br> Wind: ${data.wind.speed}
    <br> Humidity: ${data.main.humidity}`;
}

function renderTodayForecast(forecasts) {
  todayForecastContainer.innerHTML = forecasts.map(forecast => `
    <div>
      ${forecast.date} <br>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png">
      ${forecast.temp} <br>
    </div>
  `).join('');
}

/* -------------------- 3. CONTROLLER LAYER -------------------- */

async function loadWeatherByCity(city) {
  const currentData = await fetchCurrentWeather(city);
  renderCurrentWeather(currentData);

  const forecastData = await fetchForecast(city);
  const forecasts = forecastData.list.map(f => ({
    date: f.dt_txt,
    main: f.weather[0].main,
    description: f.weather[0].description,
    feels_like: f.main.feels_like,
    humidity: f.main.humidity,
    temp: f.main.temp,
    temp_max: f.main.temp_max,
    temp_min: f.main.temp_min,
    icon: f.weather[0].icon
  }));

  const today = new Date().toISOString().split('T')[0];
  const todayForecasts = forecasts.filter(f => f.date.includes(today));
  renderTodayForecast(todayForecasts);
}

async function loadWeatherByLocation(lat, lon) {
  const cityData = await fetchCityFromCoords(lat, lon);
  const cityName = cityData[0].name;
  const state = cityData[0].state;
  renderLocation(cityName);
  await loadWeatherByCity(cityName);
}

/* -------------------- 4. EVENTS -------------------- */

getForecastBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    loadWeatherByCity(city);
    renderLocation(city);
  }
});

window.onload = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      () => locationContainer.innerHTML = 'Location access denied'
    );
  } else {
    locationContainer.innerHTML = 'Browser does not support geolocation';
  }
};
