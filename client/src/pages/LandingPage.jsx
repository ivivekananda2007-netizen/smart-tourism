import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const ICONS = {
  flight: "\u2708",
  beach: "\u{1F3D6}",
  fort: "\u{1F3F0}",
  boat: "\u{1F6A4}",
  pin: "\u{1F4CD}",
  sun: "\u2600"
};

const tripPhotos = [
  {
    title: `Goa Beaches ${ICONS.beach}`,
    subtitle: "Sunset shacks, water sports, and nightlife",
    search: "Goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: `Jaipur Heritage ${ICONS.fort}`,
    subtitle: "Royal forts, markets, and local food trails",
    search: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: `Kerala Backwaters ${ICONS.boat}`,
    subtitle: "Houseboats, greenery, and calm getaways",
    state: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
  }
];

function FlightHeroIcon() {
  return (
    <span className="hero-inline-symbol hero-inline-flight" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img" focusable="false">
        <path
          d="M21 12.2a1.1 1.1 0 0 0-.88-1.08l-6.58-1.37-3.05-4.9a1.05 1.05 0 0 0-1.95.35l.66 4.7-3.7-.78-1.3-2.18a.8.8 0 0 0-1.48.41v2.18l-1.87.73a.84.84 0 0 0 0 1.56l1.87.73v2.18a.8.8 0 0 0 1.48.41l1.3-2.18 3.7-.78-.66 4.7a1.05 1.05 0 0 0 1.95.35l3.05-4.9 6.58-1.37A1.1 1.1 0 0 0 21 12.2Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function BeachHeroIcon() {
  return (
    <span className="hero-inline-symbol hero-inline-beach" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img" focusable="false">
        <path d="M2 16.8c2.3-1.7 4.7-1.7 7 0s4.7 1.7 7 0 4.7-1.7 7 0V22H2Z" fill="currentColor" />
        <circle cx="18" cy="6" r="2.4" fill="#ffd34d" />
        <path d="M7.6 14.7h1.1v-4.6H7.6zM8.2 10.4l3.5-2a.7.7 0 0 1 .98.8l-1.1 3.2Z" fill="#0f766e" />
      </svg>
    </span>
  );
}

function BudgetWeatherIcon() {
  return (
    <span className="feature-symbol budget-weather-symbol" aria-hidden="true">
      <svg viewBox="0 0 48 48" role="img" focusable="false">
        <defs>
          <linearGradient id="bwSun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="bwCoin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="14" r="8" fill="url(#bwSun)" />
        <circle cx="18" cy="30" r="10" fill="#60a5fa" />
        <circle cx="26" cy="31" r="8" fill="#93c5fd" />
        <circle cx="13" cy="33" r="7" fill="#bfdbfe" />
        <circle cx="33" cy="33" r="9" fill="url(#bwCoin)" />
        <path d="M33 28v10M29 33h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function LandingPage() {
  const [hiddenGems, setHiddenGems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/places/hidden-gems")
      .then((r) => setHiddenGems(r.data.slice(0, 6)))
      .catch(() => setHiddenGems([]));
  }, []);

  const handleProtectedNavigation = (route) => {
    navigate(user ? route : "/login");
  };

  const handleTripPhotoClick = (item) => {
    const params = new URLSearchParams();
    if (item.search) params.set("search", item.search);
    if (item.state) params.set("state", item.state);
    navigate(`/hidden-gems?${params.toString()}`);
  };

  return (
    <main className="container page">
      <section className="hero">
        <div className="hero-art" aria-hidden="true">
          <img
            className="hero-backdrop-image"
            src="/images/hero-banner.jpeg"
            alt=""
            loading="eager"
          />
          <div className="hero-art-fade" />
        </div>
        <div className="hero-copy">
          <p className="kicker">India Smart Travel Planner</p>
          <h1 className="hero-title-icons">
            <FlightHeroIcon /> Plan your perfect trip to India easily and smartly!
          </h1>
          <p className="lead">
            Create an easy <strong>day-by-day itinerary</strong> with local attractions, a trip budget, and live weather forecasts.
          </p>
          <div className="row">
            <button className="btn" type="button" onClick={() => handleProtectedNavigation("/plan")}>
              Start Planning
            </button>
            <Link className="btn secondary" to={user ? "/dashboard" : "/login"}>
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="card feature">
          <h3>{`${ICONS.flight} Smart Daily Plan`}</h3>
          <p>Get a simple day-by-day trip plan based on your interests and budget.</p>
        </article>
        <article className="card feature">
          <h3>{`${ICONS.pin} Local Hidden Spots`}</h3>
          <p>Skip crowded places and find local favorites loved by nearby travelers.</p>
        </article>
        <article className="card feature">
          <h3><BudgetWeatherIcon /> Budget + Weather</h3>
          <p>Track spending and quickly adjust your plan when weather changes.</p>
        </article>
      </section>

      <section className="gallery-grid">
        {tripPhotos.map((item) => (
          <article
            key={item.title}
            className="trip-photo-card"
            role="button"
            tabIndex={0}
            onClick={() => handleTripPhotoClick(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTripPhotoClick(item);
              }
            }}
          >
            <img src={item.image} alt={item.title} className="trip-photo" loading="lazy" />
            <div className="trip-photo-overlay">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          </article>
        ))}
      </section>

      <section>
        <div className="section-head">
          <div>
            <p className="kicker">From Your Dataset</p>
            <h2>Featured Hidden Gems</h2>
          </div>
          <Link className="btn secondary" to="/hidden-gems">
            View All Hidden Gems
          </Link>
        </div>
        <div className="cards">
          {hiddenGems.map((place) => (
            <article key={place._id} className="card trip-card">
              <h3>{place.placeTown}</h3>
              <p>
                {place.cityTown}, {place.state}
              </p>
              <p>
                {place.type} | Crowd: {place.crowdLevel}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="note">
        {user
          ? "You're logged in. Jump to planning, manage saved trips, and track expenses from your dashboard."
          : "Sign in to create personal trip plans, save trips, and track expenses on one dashboard."}
      </div>
    </main>
  );
}



