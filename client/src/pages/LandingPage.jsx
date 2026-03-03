import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const tripPhotos = [
  {
    title: "Goa Beaches",
    subtitle: "Sunset shacks, water sports, and nightlife",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Jaipur Heritage",
    subtitle: "Royal forts, markets, and local food trails",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Kerala Backwaters",
    subtitle: "Houseboats, greenery, and calm getaways",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("flights");
  const [hiddenGems, setHiddenGems] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabContent = useMemo(
    () => ({
      flights: {
        fields: [
          { label: "From", value: "New Delhi" },
          { label: "To", value: "Goa" },
          { label: "Departure", value: "2026-03-15", type: "date" },
          { label: "Travellers", value: "2 Adults" }
        ],
        cta: "Search Best Routes",
        route: "/plan"
      },
      hotels: {
        fields: [
          { label: "City", value: "Jaipur" },
          { label: "Check-in", value: "2026-04-10", type: "date" },
          { label: "Check-out", value: "2026-04-13", type: "date" },
          { label: "Guests", value: "2 Guests, 1 Room" }
        ],
        cta: "Browse Stays",
        route: "/hidden-gems"
      },
      holidays: {
        fields: [
          { label: "Destination", value: "Kerala" },
          { label: "Start", value: "2026-05-02", type: "date" },
          { label: "Duration", value: "5 Nights / 6 Days" },
          { label: "Budget", value: "INR 60,000" }
        ],
        cta: "Explore Packages",
        route: "/plan"
      }
    }),
    []
  );

  const content = tabContent[activeTab];

  useEffect(() => {
    api
      .get("/places/hidden-gems")
      .then((r) => setHiddenGems(r.data.slice(0, 6)))
      .catch(() => setHiddenGems([]));
  }, []);

  const handleProtectedNavigation = (route) => {
    navigate(user ? route : "/login");
  };

  return (
    <main className="container page">
      <section className="hero">
        <div className="hero-video-bg" aria-hidden="true">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-a-beautiful-beach-1579/1080p.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>
        <div className="hero-copy">
          <p className="kicker">India Smart Travel Planner</p>
          <h1>Book better journeys with AI-crafted itineraries</h1>
          <p className="lead">
            Plan end-to-end trips with day-wise routes, hidden gems, weather-smart updates, and budget tracking in one
            place.
          </p>
          <div className="row">
            <button className="btn" type="button" onClick={() => handleProtectedNavigation("/plan")}>
              {user ? "Start Planning" : "Get Started"}
            </button>
            <Link className="btn secondary" to={user ? "/dashboard" : "/login"}>
              {user ? "Open Dashboard" : "Login"}
            </Link>
          </div>
        </div>
        <aside className="search-widget card">
          <div className="search-tabs">
            <button type="button" className={activeTab === "flights" ? "active" : ""} onClick={() => setActiveTab("flights")}>
              Flights
            </button>
            <button type="button" className={activeTab === "hotels" ? "active" : ""} onClick={() => setActiveTab("hotels")}>
              Hotels
            </button>
            <button type="button" className={activeTab === "holidays" ? "active" : ""} onClick={() => setActiveTab("holidays")}>
              Holidays
            </button>
          </div>
          <div className="widget-grid">
            {content.fields.map((field) => (
              <label key={field.label}>
                {field.label}
                <input type={field.type || "text"} value={field.value} readOnly />
              </label>
            ))}
          </div>
          <button className="btn full" type="button" onClick={() => handleProtectedNavigation(content.route)}>
            {content.cta}
          </button>
        </aside>
      </section>

      <section className="feature-grid">
        <article className="card feature">
          <h3>Intelligent Itinerary</h3>
          <p>Auto-build daily plans based on your interests, travel style, and budget.</p>
        </article>
        <article className="card feature">
          <h3>Hidden Gems Engine</h3>
          <p>Swap crowded attractions with lesser-known places loved by local travelers.</p>
        </article>
        <article className="card feature">
          <h3>Budget + Weather Sync</h3>
          <p>Track real spend and auto-replan when weather changes your day schedule.</p>
        </article>
      </section>

      <section className="gallery-grid">
        {tripPhotos.map((item) => (
          <article key={item.title} className="trip-photo-card">
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
          : "Sign in to create personalized itineraries, save trips, and manage expenses on one dashboard."}
      </div>
    </main>
  );
}
