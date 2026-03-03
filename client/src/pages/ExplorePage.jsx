import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    type: "",
    crowdLevel: ""
  });

  useEffect(() => {
    api
      .get("/places/states")
      .then((r) => setStates(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    api
      .get(`/places?${q.toString()}`)
      .then((r) => setPlaces(r.data))
      .catch(() => toast.error("Failed to load destinations"));
  }, [filters]);

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Discover</p>
          <h2>Explore Destinations</h2>
          <p className="muted">Find popular places, unique spots, and travel ideas across states.</p>
        </div>
      </section>

      <section className="card filter-panel">
        <div className="field-grid">
          <label>
            Search
            <input
              placeholder="Search place, city, or state"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </label>
          <label>
            State
            <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <input placeholder="food, heritage, nature..." value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
          </label>
          <label>
            Crowd
            <select value={filters.crowdLevel} onChange={(e) => setFilters({ ...filters, crowdLevel: e.target.value })}>
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
      </section>

      <section className="cards">
        {places.map((place) => (
          <article key={place._id} className="card trip-card">
            <h3>{place.placeTown}</h3>
            <p>
              {place.cityTown}, {place.state}
            </p>
            <p>
              {place.type} | Crowd: {place.crowdLevel}
            </p>
            <p>{place.hiddenGem ? "Hidden gem pick" : "Popular choice"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
