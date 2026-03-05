import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [deletingTripId, setDeletingTripId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/trips")
      .then((r) => setTrips(r.data))
      .catch(() => toast.error("Failed to load trips"));
  }, []);

  const totalBudget = useMemo(() => trips.reduce((sum, t) => sum + Number(t.budget || 0), 0), [trips]);

  const deleteTrip = async (tripId, destination) => {
    const confirmed = window.confirm(`Delete this plan for ${destination}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingTripId(tripId);
      await api.delete(`/trips/${tripId}`);
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
      toast.success("Trip plan deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete trip plan");
    } finally {
      setDeletingTripId("");
    }
  };

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
            <div
              className="row"
              style={{ justifyContent: "space-between", width: "100%", marginTop: "6px", alignItems: "flex-end" }}
            >
              <button className="btn" type="button" onClick={() => navigate(`/itinerary/${trip._id}`)}>
                View Trip Plan
              </button>
              <button
                type="button"
                onClick={() => deleteTrip(trip._id, trip.destination)}
                disabled={deletingTripId === trip._id}
                style={{
                  border: "1px solid #f1b1ba",
                  background: deletingTripId === trip._id ? "#fdecef" : "#fff5f7",
                  color: "#b42334",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  cursor: deletingTripId === trip._id ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  lineHeight: 1,
                  transition: "all 0.2s ease"
                }}
                aria-label={`Delete plan for ${trip.destination}`}
                title="Delete plan"
              >
                {deletingTripId === trip._id ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {trips.length === 0 && (
        <section className="card empty-state">
          <h3>No trips yet</h3>
          <p style={{ marginBottom: "10px" }}>Start by creating your first personalized trip plan.</p>
          <Link className="btn" to="/plan">
            Create First Trip
          </Link>
        </section>
      )}
    </main>
  );
}
