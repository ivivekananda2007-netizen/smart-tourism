import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/trips")
      .then((r) => setTrips(r.data))
      .catch(() => toast.error("Failed to load trips"));
  }, []);

  const totalBudget = useMemo(() => trips.reduce((sum, t) => sum + Number(t.budget || 0), 0), [trips]);

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Travel Dashboard</p>
          <h2>My Trips</h2>
        </div>
        <Link className="btn" to="/plan">
          Plan New Trip
        </Link>
      </section>

      <section className="stats-row">
        <article className="card stat-card">
          <p>Total Trips</p>
          <strong>{trips.length}</strong>
        </article>
        <article className="card stat-card">
          <p>Planned Budget</p>
          <strong>INR {totalBudget}</strong>
        </article>
      </section>

      <section className="cards">
        {trips.map((trip) => (
          <article key={trip._id} className="card trip-card">
            <h3>{trip.destination}</h3>
            <p>
              {trip.startDate} to {trip.endDate}
            </p>
            <p>Budget: INR {trip.budget}</p>
            <div className="row">
              <button className="btn" onClick={() => navigate(`/itinerary/${trip._id}`)}>
                View Trip Plan
              </button>
              <button className="btn secondary" onClick={() => navigate(`/budget/${trip._id}`)}>
                Budget
              </button>
            </div>
          </article>
        ))}
      </section>

      {trips.length === 0 && (
        <section className="card empty-state">
          <h3>No trips yet</h3>
          <p>Start by creating your first AI-generated trip plan.</p>
          <Link className="btn" to="/plan">
            Create First Trip
          </Link>
        </section>
      )}
    </main>
  );
}
