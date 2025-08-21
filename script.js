const apiKey = "3a58d57be667e419d11430ebc8ac6896";

// DOM elements
const cityInput = document.querySelector('.search-city');
const getForecastBtn = document.querySelector('.get-forecast');
const cityContainer = document.querySelector('.city-container');
const countryContainer = document.querySelector('.country-container');
const mainPanel = document.querySelector('.main-panel-container');
const currentWeatherContainer = document.querySelector('.current-weather-container');
const todayForecastContainer = document.querySelector('.today-forecasts-container');
const iconContainer = document.querySelector('.icon-container');
const airConditionsContainer = document.querySelector('.air-conditions-container');
const seeMoreBtn = document.querySelector('.see-more');
const todayForecastsHeader = document.querySelector('.today-forecasts-header');
const airConditionsHeader = document.querySelector('.air-conditions-header');
const fiveDayForecastContainer = document.querySelector('.five-day-forecast-container');
const weatherDiv = document.querySelector('.weather');
const citiesDiv = document.querySelector('.cities');
const settingsDiv = document.querySelector('.settings');

const settings = {
  celsius: document.querySelector('.celsius'),
  fahrenheit: document.querySelector('.fahrenheit'),
  mps: document.querySelector('.mps'),
  kph: document.querySelector('.kph'),
  hpa: document.querySelector('.hpa'),
  kpa: document.querySelector('.kpa'),
  mmHg: document.querySelector('.mmHg'),
  metres: document.querySelector('.metres'),
  kilometres: document.querySelector('.kilometres'),
  time12h: document.querySelector('.twelve-hour'),
  time24h: document.querySelector('.twenty-four-hour')
};

const sections = {
  cities: document.querySelector('.cities-section'),
  weather: document.querySelector('.weather-section'),
  settings: document.querySelector('.settings-section')
};

const searchResults = document.querySelector('.search-results');
let searchResultItems;

let currentDataGlobal;
let cityDataGlobal;
let currentCityGlobal;
let todayForecastsGlobal;

let preferences = JSON.parse(localStorage.getItem('preferences')) || {
  temperature: 'celsius',
  windSpeed: 'mps',
  pressure: 'hpa',
  time: '24h',
  visibility: 'm'
}; 

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

// Fetch cities by the same name for city search
async function fetchCities(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${apiKey}`;
  const res = await fetch(url);
  return res.json();
}

/* -------------------- 2. RENDERING LAYER -------------------- */

function showSection(name) {
  Object.values(sections).forEach(section => {
    section.style.display = 'none';
  });
  sections[name].style.display = 'block';
  if(name === 'settings')
  {
    cityInput.style.display = 'none';
    getForecastBtn.style.display = 'none';
  }
  else {
    cityInput.style.display = 'inline-block';
    getForecastBtn.style.display = 'inline-block';
    cityInput.value = '';
    name === 'weather' ? getForecastBtn.innerHTML = 'Get forecast' : getForecastBtn.innerHTML = 'Search cities';
  }
}

function renderLocation(city, country) {
  cityContainer.innerHTML = `${city}`;
  countryContainer.innerHTML = `${country}`;
}

function renderCurrentWeather(data) {
  const icon = data.weather[0].icon;
  currentWeatherContainer.innerHTML = `${convertTemperature(data.main.temp)}`;
  iconContainer.innerHTML = `<img class="icon" src="http://openweathermap.org/img/wn/${icon}@2x.png">`;
  airConditionsContainer.innerHTML = `
    <br> Real feel: ${convertTemperature(data.main.feels_like)}
    <br> Wind: ${convertWindSpeed(data.wind.speed)}
    <br> Humidity: ${data.main.humidity}%`;
}

function renderTodayForecast(forecasts) {
  todayForecastsHeader.style.display = 'block';
  todayForecastContainer.innerHTML = forecasts.map(forecast => `
    <div>  
      ${forecast.date.split(" ")[1]} <br>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png"> <br>
      ${convertTemperature(forecast.temp)} <br>
    </div>
  `).join('');
}

function renderAirConditions(data) {
  todayForecastsHeader.style.display = 'none';
  todayForecastContainer.style.display = 'none';
  airConditionsContainer.innerHTML = `
    <div>
      <p>Real feel: ${convertTemperature(data.main.feels_like)}</p>
      <p>Wind Speed: ${convertWindSpeed(data.wind.speed)}</p>
      <p>Visibility: ${convertVisibility(data.visibility)}</p>
      <p>Pressure: ${convertPressure(data.main.pressure)}</p>
      <p>Maximum Temperature: ${convertTemperature(data.main.temp_max)}</p>
      <p>Minimum Temperature: ${convertTemperature(data.main.temp_min)}</p>
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
      <p>${convertTemperature(forecast.temp_max)} / ${convertTemperature(forecast.temp_min)}</p>
    </div>`).join('');
}

function renderCities(cities) {
  searchResults.innerHTML = cities.map(city => `
    <div class="search-result-item" 
         data-lat="${city.lat}" 
         data-lon="${city.lon}" 
         data-name="${city.name}" 
         data-country="${city.country}" 
         data-state="${city.state || ''}">
      <p>${city.name}${city.state ? ", " + city.state : ""}, ${city.country}</p>
    </div>
  `).join('');

  searchResultItems = document.querySelectorAll('.search-result-item');

  searchResultItems.forEach(node => {
    node.addEventListener('click', async function() {
      const lat = this.getAttribute('data-lat');
      const lon = this.getAttribute('data-lon');
      const name = this.getAttribute('data-name');
      const country = this.getAttribute('data-country');

      weatherDiv.click();
      await loadWeatherByLocation(lat, lon);
      renderLocation(name, country);
    });
  });
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

async function loadCities(city) {
  const cities = await fetchCities(city);
  renderCities(cities);
}

/* ------------------- 4. CONVERSIONS -------------------- */

function convertTemperature(temp) {
  if(preferences.temperature === 'celsius') {
    return `${temp}&deg;C`;
  } else {
    return `${Math.round(((temp * 9/5) + 32) * 100) / 100}&deg;F`;
  }
}

function convertWindSpeed(speed) {
  if(preferences.windSpeed === 'mps') {
    return `${speed} m/s`;
  } else {
    return `${Math.round((speed * 3.6) * 100) / 100} km/h`;
  }
}

function convertPressure(pressure) {
  if(preferences.pressure === 'hpa') {
    return `${pressure} hPa`;
  } else if(preferences.pressure === 'mmHg') {
    return `${Math.round((pressure * 0.750062) * 100) / 100} mmHg`;
  } else if(preferences.pressure === 'kpa') {
    return `${Math.round((pressure / 10) * 100) / 100} kPa`;
  }
}

function convertVisibility(visibility) {
  if(preferences.visibility === 'm') {
    return `${visibility} m`;
  } else {
    return `${Math.round((visibility / 1000) * 100) / 100} km`;
  }
}

/* ------------------- 5. EVENTS -------------------- */

getForecastBtn.addEventListener('click', function(){
  if(this.innerHTML === 'Get forecast') {
    const city = cityInput.value.trim();
    if (city) {
      loadWeatherByCity(city);
    }
  }
  else if(this.innerHTML === 'Search cities') {
    const city = cityInput.value.trim();
    if (city) {
      loadCities(city);
    }
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

weatherDiv.addEventListener('click', (event) => {
  showSection('weather');
});

citiesDiv.addEventListener('click', (event) => {
  showSection('cities');
  searchResults.innerHTML = '';
});

settingsDiv.addEventListener('click', (event) => {
  showSection('settings');
});

function addSettingsEventListeners() {
  Object.entries(settings).forEach(([key, element]) => {
    element.addEventListener('click', async () => {
      let category;
      let value;

      if (key === 'celsius' || key === 'fahrenheit') {
        category = 'temperature';
        value = key; 
      } 
      else if (key === 'mps' || key === 'kph') {
        category = 'windSpeed';
        value = key;
      }
      else if (key === 'hpa' || key === 'kpa' || key === 'mmHg') {
        category = 'pressure';
        value = key;
      }
      else if (key === 'metres' || key === 'kilometres') {
        category = 'visibility';
        value = key === 'metres' ? 'm' : 'km';
      }
      else if (key === 'time12h' || key === 'time24h') {
        category = 'time';
        value = key === 'time12h' ? '12h' : '24h';
      }

      if (category && value) {
        await set(category, value);
      }
    });
  });
}

async function set(setting, value) {
  preferences[setting] = value;
  localStorage.setItem('preferences', JSON.stringify(preferences));
  await loadWeatherByCity(currentCityGlobal);
}

window.onload = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      () => locationContainer.innerHTML = 'Location access denied'
    );
  } else {
    locationContainer.innerHTML = 'Browser does not support geolocation';
  }
  showSection('weather');
  addSettingsEventListeners();
  console.log(preferences);
};
