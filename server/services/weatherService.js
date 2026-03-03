const axios = require("axios");

const CACHE_TTL_MS = 1000 * 60 * 30;
const cache = new Map();

function keyFor(city) {
  return city.toLowerCase().trim();
}

function getWeatherTip(weather, pop, temp) {
  if (weather === "Thunderstorm") return "Storm warning: avoid exposed outdoor activities.";
  if (weather === "Rain" || pop > 0.5) return "Rain expected: prefer indoor attractions for this slot.";
  if (temp >= 36) return "High heat expected: schedule outdoor visits in morning/evening.";
  if (weather === "Snow") return "Snow conditions: check road and access safety before travel.";
  return "Weather looks moderate for normal sightseeing.";
}

async function fetchWeather(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) throw new Error("WEATHER_API_KEY is missing");
  const [currentRes, forecastRes] = await Promise.all([
    axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { q: city, appid: apiKey, units: "metric" }
    }),
    axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: { q: city, appid: apiKey, units: "metric" }
    })
  ]);
  const current = currentRes.data;
  const forecast = forecastRes.data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .map((item) => ({
      date: item.dt_txt.slice(0, 10),
      temp: Math.round(item.main.temp),
      weather: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      rainChance: Math.round((item.pop || 0) * 100),
      tip: getWeatherTip(item.weather[0].main, item.pop || 0, item.main.temp)
    }));

  return {
    city: current.name,
    country: current.sys.country,
    current: {
      temp: Math.round(current.main.temp),
      weather: current.weather[0].main,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed
    },
    forecast
  };
}

async function getWeather(city) {
  const key = keyFor(city);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.payload;
  const payload = await fetchWeather(city);
  cache.set(key, { ts: Date.now(), payload });
  return payload;
}

function weatherReplanHint(dayForecast, places) {
  if (!dayForecast) return "";
  const weather = dayForecast.weather;
  const tooHot = dayForecast.temp >= 36;
  const rainy = weather === "Rain" || dayForecast.rainChance >= 55;
  const storm = weather === "Thunderstorm";
  if (!rainy && !tooHot && !storm) return "";
  if (storm) return "Storm expected: move high-exposure activities to safer indoor alternatives.";
  if (rainy) return "Rain expected: replace open-air spots with museum/heritage/temple options where possible.";
  if (tooHot) return "High heat: prioritize short morning visits and indoor attractions after noon.";
  return "";
}

module.exports = { getWeather, weatherReplanHint };
