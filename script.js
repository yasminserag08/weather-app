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
const todayForecastsHeader = document.querySelector('.today-forecasts-header');
const fiveDayForecastContainer = document.querySelector('.five-day-forecast-container');

let currentDataGlobal;
let cityDataGlobal;
let todayForecastsGlobal;

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

function renderLocation(city, country) {
  locationContainer.innerHTML = `
    <p>${city}</p>
    <p>${country}</p>`;
}

function renderCurrentWeather(data) {
  const icon = data.weather[0].icon;
  currentWeatherContainer.innerHTML = `${data.main.temp}&deg;C`;
  iconContainer.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png">`;
  airConditionsContainer.innerHTML = `
    <br> Real feel: ${data.main.feels_like} &deg;C
    <br> Wind: ${data.wind.speed} m/s
    <br> Humidity: ${data.main.humidity}%`;
}

function renderTodayForecast(forecasts) {
  todayForecastsHeader.style.display = 'block';
  todayForecastContainer.innerHTML = forecasts.map(forecast => `
    <div>
      ${forecast.date} <br>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png">
      ${forecast.temp} <br>
    </div>
  `).join('');
}

function renderAirConditions(data) {
  todayForecastsHeader.style.display = 'none';
  todayForecastContainer.style.display = 'none';
  airConditionsContainer.innerHTML = `
    <div>
      <p>Real feel: ${data.main.feels_like} &deg;C</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
      <p>Visibility: ${data.visibility} m</p>
      <p>Pressure: ${data.main.pressure} hPa</p>
      <p>Maximum Temperature: ${data.main.temp_max} &deg;C</p>
      <p>Minimum Temperature: ${data.main.temp_min} &deg;C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
      <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
    </div>
  `;
}

function renderFiveDayForecast(forecasts) {
  fiveDayForecastContainer.innerHTML = '<h3>5-DAY FORECAST</h3>';
  fiveDayForecastContainer.innerHTML += forecasts.map(forecast => `
    <div class="five-day-forecast-item">
      <p>${forecast.date.split(" ")[0]}</p>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png">
      <p>${forecast.description}</p>
      <p>${forecast.temp_max} / ${forecast.temp_min}</p>
    </div>`).join('');
}

/* -------------------- 3. CONTROLLER LAYER -------------------- */

async function loadWeatherByCity(city) {
  currentCityGlobal = city;
  const currentData = await fetchCurrentWeather(city);
  renderCurrentWeather(currentData);
  currentDataGlobal = currentData;

  const forecastData = await fetchForecast(city);
  const country = forecastData.city.country;
  const cityName = forecastData.city.name;
  const forecasts = forecastData.list.map(f => ({
    date: f.dt_txt,
    main: f.weather[0].main,
    description: f.weather[0].description,
    feels_like: f.main.feels_like,
    humidity: f.main.humidity,
    temp: f.main.temp,
    temp_max: f.main.temp_max,
    temp_min: f.main.temp_min,
    chanceOfRain: f.pop * 100,
    windSpeed: f.wind.speed,
    visibility: f.visibility,
    pressure: f.main.pressure,
    icon: f.weather[0].icon
  }));

  const today = new Date().toISOString().split('T')[0];
  const todayForecasts = forecasts.filter(f => f.date.includes(today));
  todayForecastsGlobal = todayForecasts;
  renderTodayForecast(todayForecasts);
  renderLocation(cityName, country);
  let lastDate = "";
  const fiveDayForecasts = forecasts.filter(f => {
    const forecastDate = f.date.split(" ")[0];
    if (forecastDate !== lastDate) {
      lastDate = forecastDate;
      return true;
    }
    return false;
  });
  renderFiveDayForecast(fiveDayForecasts);
}

async function loadWeatherByLocation(lat, lon) {
  const cityData = await fetchCityFromCoords(lat, lon);
  const city = cityData[0].name;
  const country = cityData[0].country;
  renderLocation(city, country);
  await loadWeatherByCity(city);
}

/* ------------------- 4. EVENTS -------------------- */

getForecastBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    loadWeatherByCity(city);
  }
});

seeMoreBtn.addEventListener('click', function() {
  if(this.innerHTML === "See more") {
    renderAirConditions(currentDataGlobal);
    this.innerHTML = "See less";
  }
  else if(this.innerHTML === "See less") {
    todayForecastContainer.style.display = 'flex'; 
    renderTodayForecast(todayForecastsGlobal); 
    renderCurrentWeather(currentDataGlobal);
    this.innerHTML = "See more";
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
