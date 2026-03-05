import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";

const STORAGE_KEY = "smartTourismSavedPlaces";

function readSavedPlaces() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

export default function SavedPlacesPage() {
  const [saved, setSaved] = useState(() => readSavedPlaces());
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedPlaceId, setExpandedPlaceId] = useState(null);

  const savedIds = useMemo(() => new Set(saved.map((x) => String(x._id))), [saved]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (search.trim()) q.set("search", search.trim());
    api
      .get(`/places/hidden-gems?${q.toString()}`)
      .then((r) => setResults(r.data.slice(0, 18)))
      .catch(() => toast.error("Failed to load places"));
  }, [search]);

  const persist = (next) => {
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const savePlace = (place) => {
    if (savedIds.has(String(place._id))) return;
    persist([place, ...saved]);
    toast.success("Place saved");
  };

  const removePlace = (id) => {
    persist(saved.filter((p) => String(p._id) !== String(id)));
    toast.success("Removed from saved places");
    if (String(expandedPlaceId) === String(id)) {
      setExpandedPlaceId(null);
    }
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Favorites</p>
          <h2>Saved Places</h2>
          <p className="muted">Keep your shortlisted locations here for faster trip planning.</p>
        </div>
      </section>

      <section className="card form">
        <label>
          Discover new places
          <input placeholder="Search place, city, or state" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="cards compact-cards">
          {results.map((place) => (
            <article key={place._id} className="card trip-card">
              <h3>{place.placeTown}</h3>
              <p>
                {place.cityTown}, {place.state}
              </p>
              <button className="btn" onClick={() => savePlace(place)} disabled={savedIds.has(String(place._id))}>
                {savedIds.has(String(place._id)) ? "Saved" : "Save Place"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="cards">
        {saved.map((place) => (
          <article
            key={place._id}
            className="card trip-card"
            role="button"
            tabIndex={0}
            onClick={() =>
              setExpandedPlaceId((prev) => (String(prev) === String(place._id) ? null : String(place._id)))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedPlaceId((prev) => (String(prev) === String(place._id) ? null : String(place._id)));
              }
            }}
          >
            <h3>{place.placeTown}</h3>
            <p>
              {place.cityTown}, {place.state}
            </p>
            <p>{place.type}</p>
            {String(expandedPlaceId) === String(place._id) && (
              <p>{place.description?.trim() || "No description available for this place yet."}</p>
            )}
            <button
              className="btn secondary"
              onClick={(e) => {
                e.stopPropagation();
                removePlace(place._id);
              }}
            >
              Remove
            </button>
          </article>
        ))}
      </section>

      {saved.length === 0 && (
        <section className="card empty-state">
          <h3>No saved places yet</h3>
          <p>Save locations from the discovery list to build your favorites.</p>
        </section>
      )}
    </main>
  );
}
