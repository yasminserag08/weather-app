const apiKey = "3a58d57be667e419d11430ebc8ac6896";

const cityInput = document.querySelector('.search-city');
const getForecastBtn = document.querySelector('.get-forecast');
const locationContainer = document.querySelector('.location-container');
const currentWeatherContainer = document.querySelector('.current-weather-container');
const todayForecastContainer = document.querySelector('.today-forecasts-container');
const iconContainer = document.querySelector('.icon-container');

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
  const icon = data.weather[0].icon;
  console.log(data);
  currentWeatherContainer.innerHTML = `
    ${data.main.temp}25&deg;C`;
  iconContainer.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png">`;
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
  return forecasts;
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
  const forecasts = await getForecasts(name);
  console.log(forecasts);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  const todayForecasts = forecasts.filter(forecast => {
    return forecast.date.includes(formattedDate);
  });

  todayForecasts.forEach(forecast => {
    todayForecastContainer.innerHTML += `
      <div>
        ${forecast.date} <br>
        icon <br>
        ${forecast.temp} <br>
      </div>`
  });
}

function error(err)
{
  locationContainer.innerHTML = 'Location access denied';
}


