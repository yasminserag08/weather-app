const apiKey = "3a58d57be667e419d11430ebc8ac6896";

const getForecastBtn = document.querySelector('#get-forecast');
const cityInput = document.querySelector('#search-city');

getForecastBtn.addEventListener('click', async () => {
  const forecast = await getForecast(cityInput.value)
  renderForecast(forecast);
});

async function getForecast(city)
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
    feels_like: forecast.main.feels_like,
    humidity: forecast.main.humidity,
    temp: forecast.main.temp,
    temp_max: forecast.main.temp_max,
    temp_min: forecast.main.temp_min
  }));
  console.log(forecasts);
  return forecasts[0];
}

function renderForecast(forecast)
{
  document.body.innerHTML += `
    <div>
      <ul>
        <li>Temperature: ${forecast.temp}</li>
        <li>Feels like: ${forecast.feels_like}</li>  
      </ul>
    </div>`
}
