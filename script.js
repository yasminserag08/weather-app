const apiKey = "3a58d57be667e419d11430ebc8ac6896";

const iconContainer = document.querySelector('.icon-container');
const getForecastBtn = document.querySelector('#get-forecast');
const cityInput = document.querySelector('#search-city');
const locationContainer = document.querySelector('.location-container');
const forecastsContainer = document.querySelector('.forecasts-container');
const currentWeatherContainer = document.querySelector('.current-weather-container');

window.onload = function() 
{
  getLocation();
};

getForecastBtn.addEventListener('click', async function(event) {
  event.preventDefault();
  const forecasts = await getForecasts(cityInput.value)
  forecasts.forEach(forecast => {
    renderForecast(forecast);
  });
});

async function getCurrentWeather(city)
{
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);;
  currentWeatherContainer.innerHTML = `
    Main: ${data.weather[0].main} <br>
    Description: ${data.weather[0].description} <br>
    Temperature: ${data.main.temp} <br>
    Feels like: ${data.main.feels_like} <br>
    Humidity: ${data.main.humidity} <br>
    Minimum temperature: ${data.main.temp_min} <br>
    Maximum temperature: ${data.main.temp_max} <br>
    Icon: ${data.weather[0].icon}`;
  const icon = data.weather[0].icon; 
  if(icon === '01d')
  {
    iconContainer.innerHTML = '<div class="sun"></div>';
  }
  else if(icon === '01n')
  {
    iconContainer.innerHTML = '<div class="moon"></div>';
  }
  else if(icon === '03d')
  {
    iconContainer.innerHTML = '<div class="cloud radiant"></div>';
  }
}

async function getForecasts(city)
{
  const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  const lat = geoData.coord.lat;
  const lon = geoData.coord.lon;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const forecastRes = await fetch(forecastUrl);
  const forecastData = await forecastRes.json();
  const forecastDataList = forecastData.list;
  console.log(forecastDataList);
  const forecasts = forecastDataList.map(forecast => ({
    date: forecast.dt_txt,
    main: forecast.weather[0].main,
    description: forecast.weather[0].description,
    feels_like: forecast.main.feels_like,
    humidity: forecast.main.humidity,
    temp: forecast.main.temp,
    temp_max: forecast.main.temp_max,
    temp_min: forecast.main.temp_min,
  }));
  console.log(forecasts);
  return forecasts;
}

function renderForecast(forecast)
{
  forecastsContainer.innerHTML += `
    <ul>
      <li>Date: ${forecast.date}</li>
      <li>Temperature: ${forecast.temp}</li>
      <li>Feels like: ${forecast.feels_like}</li> 
      <li>Main: ${forecast.main}</li> 
      <li>Description: ${forecast.description}</li>
    </ul>`;
}

async function getLocation()
{
  if('geolocation' in navigator)
  {
    navigator.geolocation.getCurrentPosition(success, error);
  }
  else
  {
    locationContainer.innerHTML = 'Browser does not support geolocation';
  }
}

async function success(position)
{
  const crd = position.coords;
  const lat = crd.latitude;
  const lon = crd.longitude;
  const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  const name = geoData[0].name;
  const state = geoData[0].state;
  locationContainer.innerHTML = `
    <p>${state}</p>
    <p>${name}</p>`;
  getCurrentWeather(name);
}

function error(err)
{
  locationContainer.innerHTML = 'Location access denied';
}

