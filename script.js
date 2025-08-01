const apiKey = "3a58d57be667e419d11430ebc8ac6896";

const getForecastBtn = document.querySelector('#get-forecast');
const cityInput = document.querySelector('#search-city');

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
    feels_like: forecast.main.feels_like,
    humidity: forecast.main.humidity,
    temp: forecast.main.temp,
    temp_max: forecast.main.temp_max,
    temp_min: forecast.main.temp_min
  }));
  console.log(forecasts);
  return forecasts;
}

function renderForecast(forecast)
{
  document.body.innerHTML = `
    <div>
      <ul>
        <li>Date: ${forecast.date}</li>
        <li>Temperature: ${forecast.temp}</li>
        <li>Feels like: ${forecast.feels_like}</li>  
      </ul>
    </div>`;
}

async function getLocation()
{
  if('geolocation' in navigator)
  {
    navigator.geolocation.getCurrentPosition(success, error);
  }
  else
  {
    document.body.innerHTML = 'Browser does not support geolocation';
  }
}

async function success(position)
{
  const crd = position.coords;
  const lat = crd.latitude;
  const lon = crd.longitude;
  const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${apiKey}`
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  const name = geoData[0].name;
  const state = geoData[0].state;
  document.body.innerHTML += `
    <p>${state}</p>
    <p>${name}</p>`;
}

function error(err)
{
  document.body.innerHTML = 'Location access denied';
}

