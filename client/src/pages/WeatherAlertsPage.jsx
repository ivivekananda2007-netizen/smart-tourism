import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";

export default function WeatherAlertsPage() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchWeather = async (e) => {
    e.preventDefault();
    const target = city.trim();
    if (!target) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/weather/${encodeURIComponent(target)}`);
      setWeather(data);
    } catch (_) {
      toast.error("Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Weather & Alerts</p>
          <h2>Trip Weather</h2>
          <p className="muted">Check current weather and 5-day forecast before your travel plan.</p>
        </div>
      </section>

      <form className="card row weather-search" onSubmit={searchWeather}>
        <label className="stretch">
          City
          <input placeholder="Enter city name" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Get Weather"}
        </button>
      </form>

      {weather && (
        <>
          <section className="card">
            <h3>
              {weather.city}, {weather.country}
            </h3>
            <p>
              {weather.current.weather} ({weather.current.description}) | {weather.current.temp} C
            </p>
            <p>
              Humidity {weather.current.humidity}% | Wind {weather.current.windSpeed} m/s
            </p>
          </section>

          <section className="cards">
            {weather.forecast.map((day) => (
              <article key={day.date} className="card trip-card">
                <h3>{day.date}</h3>
                <p>
                  {day.weather} | {day.temp} C
                </p>
                <p>Rain chance: {day.rainChance}%</p>
                <p>{day.tip}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
