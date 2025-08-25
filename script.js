const apiKey = "3a58d57be667e419d11430ebc8ac6896";

// DOM elements
const cityInput = document.querySelector('.search-city');
const getForecastBtn = document.querySelector('.get-forecast');
const cityContainer = document.querySelector('.city-container');
const countryContainer = document.querySelector('.country-container');
const mainPanel = document.querySelector('.main-panel-container');
const currentWeatherContainer = document.querySelector('.current-weather-container');
const todayForecastContainer = document.querySelector('.today-forecasts-container');
const todayForecast = document.querySelector('.today-forecast');
const iconContainer = document.querySelector('.icon-container');
const airConditionsContainer = document.querySelector('.air-conditions-container');
const seeMoreBtn = document.querySelector('.see-more');
const airConditionsHeader = document.querySelector('.air-conditions-header');
const fiveDayForecastContainer = document.querySelector('.five-day-forecast-container');
const weatherDiv = document.querySelector('.weather');
const citiesDiv = document.querySelector('.cities');
const settingsDiv = document.querySelector('.settings');
const airConditions = document.querySelector('.air-conditions');

const settings = {
  celsius: document.querySelector('#celsius'),
  fahrenheit: document.querySelector('#fahrenheit'),
  mps: document.querySelector('#mps'),
  kph: document.querySelector('#kph'),
  hpa: document.querySelector('#hpa'),
  kpa: document.querySelector('#kpa'),
  mmHg: document.querySelector('#mmHg'),
  metres: document.querySelector('#metres'),
  kilometres: document.querySelector('#kilometres'),
  time12h: document.querySelector('#twelve-hour'),
  time24h: document.querySelector('#twenty-four-hour'),
  lightmode: document.querySelector('#light-mode'),
  darkmode: document.querySelector('#dark-mode')
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
  visibility: 'm',
  mode: 'dark'
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
  console.log(data);
  const icon = data.weather[0].icon;
  currentWeatherContainer.innerHTML = `${convertTemperature(data.main.temp)}`;
  iconContainer.innerHTML = `<img class="icon" src="http://openweathermap.org/img/wn/${icon}@2x.png">`;
  airConditions.innerHTML = `
    <p class="air-conditions-item">Real feel <span>${convertTemperature(data.main.feels_like)}</span></p>
    <p class="air-conditions-item">Wind <span>${convertWindSpeed(data.wind.speed)}</span></p>
    <p class="air-conditions-item">Humidity <span>${data.main.humidity}%</span></p>
    <p class="air-conditions-item">Visibility <span>${convertVisibility(data.visibility)}</span></p>`;
}

function renderTodayForecast(forecasts) {
  const fragment = document.createDocumentFragment();
  forecasts.forEach(forecast => {
    const div = document.createElement('div');
    div.className = 'today-forecast-item';
    div.innerHTML = `
      <p class="time">${convertTime(forecast.date.split(" ")[1])}</p>
      <img src="http://openweathermap.org/img/wn/${forecast.icon}@2x.png">
      <p class="temperature">${convertTemperature(forecast.temp)}</p>
    `;
    fragment.appendChild(div);
  });
  todayForecast.innerHTML = '';
  todayForecast.appendChild(fragment);
}


function renderAirConditions(data) {
  airConditions.innerHTML = `
    <p class="air-conditions-item">Real feel <span> ${convertTemperature(data.main.feels_like)}</span></p>
    <p class="air-conditions-item">Wind Speed <span> ${convertWindSpeed(data.wind.speed)}</span></p>
    <p class="air-conditions-item">Visibility <span> ${convertVisibility(data.visibility)}</span></p>
    <p class="air-conditions-item">Pressure <span> ${convertPressure(data.main.pressure)}</span></p>
    <p class="air-conditions-item">Maximum Temperature <span> ${convertTemperature(data.main.temp_max)}</span></p>
    <p class="air-conditions-item">Minimum Temperature <span> ${convertTemperature(data.main.temp_min)}</span></p>
    <p class="air-conditions-item">Humidity <span> ${data.main.humidity}%</span></p>
    <p class="air-conditions-item">Sunrise <span> ${convertTime(data.sys.sunrise * 1000)}</span></p>
    <p class="air-conditions-item">Sunset <span> ${convertTime(data.sys.sunset * 1000)}</span></p>
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
      <div class="search-result-content">
        <div class="search-result-left">
          <span class="search-result-city">${city.name}</span>
          ${city.state ? `<span class="search-result-state">${city.state}</span>` : ""}
        </div>
        <div class="search-result-right">
          <span class="search-result-country">${city.country}</span>
        </div>
      </div>
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
// async function loadWeatherByCity(city) {
//   currentCityGlobal = city;
//   const currentData = await fetchCurrentWeather(city);
//   renderCurrentWeather(currentData);
//   currentDataGlobal = currentData;

//   const forecastData = await fetchForecast(city);
//   const country = forecastData.city.country;
//   const cityName = forecastData.city.name;
//   const forecasts = forecastData.list.map(f => ({
//     date: f.dt_txt,
//     main: f.weather[0].main,
//     description: f.weather[0].description,
//     feels_like: f.main.feels_like,
//     humidity: f.main.humidity,
//     temp: f.main.temp,
//     temp_max: f.main.temp_max,
//     temp_min: f.main.temp_min,
//     chanceOfRain: f.pop * 100,
//     windSpeed: f.wind.speed,
//     visibility: f.visibility,
//     pressure: f.main.pressure,
//     icon: f.weather[0].icon
//   }));

//   const today = new Date().toISOString().split('T')[0];
//   const todayForecasts = forecasts.filter(f => f.date.includes(today));
//   todayForecastsGlobal = todayForecasts;
//   renderTodayForecast(todayForecasts);
//   renderLocation(cityName, country);
//   let lastDate = "";
//   const fiveDayForecasts = forecasts.filter(f => {
//     const forecastDate = f.date.split(" ")[0];
//     if (forecastDate !== lastDate) {
//       lastDate = forecastDate;
//       return true;
//     }
//     return false;
//   });
//   renderFiveDayForecast(fiveDayForecasts);
// }

let cache = {}; // key: city name, value: { data: {current, forecast}, timestamp }

async function loadWeatherByCity(city) {
  const now = Date.now();
  
  // Check cache
  if (cache[city] && now - cache[city].timestamp < 10 * 60 * 1000) {
    const cached = cache[city].data;
    renderWeatherData(cached);
    return;
  }

  // Fetch current + forecast together
  const [currentData, forecastData] = await Promise.all([
    fetchCurrentWeather(city),
    fetchForecast(city)
  ]);

  const data = { currentData, forecastData };
  
  // Cache it
  cache[city] = { data, timestamp: now };

  renderWeatherData(data);
}

function renderWeatherData({currentData, forecastData}) {
  currentDataGlobal = currentData;
  renderCurrentWeather(currentData);

  const forecasts = forecastData.list.map(f => ({
    date: f.dt_txt,
    main: f.weather[0].main,
    description: f.weather[0].description,
    temp: f.main.temp,
    temp_max: f.main.temp_max,
    temp_min: f.main.temp_min,
    icon: f.weather[0].icon,
    windSpeed: f.wind.speed,
    visibility: f.visibility,
    pressure: f.main.pressure,
    feels_like: f.main.feels_like,
    humidity: f.main.humidity
  }));

  const today = new Date().toISOString().split('T')[0];
  const todayForecasts = forecasts.filter(f => f.date.includes(today));
  todayForecastsGlobal = todayForecasts;
  renderTodayForecast(todayForecasts);

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

  renderLocation(forecastData.city.name, forecastData.city.country);
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
    return `${Math.round(temp)}&deg;C`;
  } else {
    return `${Math.round((temp * 9/5) + 32)}&deg;F`;
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

function convertTime(time) {
  if (typeof time === "number") {
    const date = new Date(time * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    time = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  if (preferences.time === "12h") {
    let [hours, minutes, seconds] = time.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  return time.slice(0, 5); 
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
    todayForecastContainer.style.display = 'none';
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
      else if (key === 'lightmode' || key === 'darkmode') {
        category = 'mode';
        value = key === 'lightmode' ? 'light' : 'dark';
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

  // Re-render using cached data instead of fetching again
  if(currentDataGlobal && todayForecastsGlobal) {
    renderCurrentWeather(currentDataGlobal);
    renderTodayForecast(todayForecastsGlobal);
    renderAirConditions(currentDataGlobal);
    let lastDate = "";
    const forecasts = todayForecastsGlobal.concat(fiveDayForecastContainer.dataset.allForecasts || []);
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
}

settings.lightmode.addEventListener('click', () => {
  document.body.classList.add('light-mode');
});

settings.darkmode.addEventListener('click', () => {
  document.body.classList.remove('light-mode');
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
  showSection('weather');
  addSettingsEventListeners();
  console.log(preferences);
  if(preferences.mode === 'light') {
    document.body.classList.add('light-mode');
  }
};
