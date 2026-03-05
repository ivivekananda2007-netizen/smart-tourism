import { memo, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import HotelsNearby from "../components/HotelsNearby";
import { useTripForm } from "../context/TripContext";

const SELECTED_GEM_HOTELS_STYLE = { marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #ecf0f1" };
const GEM_META_STYLE = { fontSize: "12px", color: "#7f8c8d", marginTop: "8px" };
const GEM_DESC_STYLE = { fontSize: "13px", color: "#555", marginTop: "10px", fontStyle: "italic" };

const HiddenGemCard = memo(function HiddenGemCard({ gem, isSelected, tripBudget }) {
  return (
    <article data-gem-id={gem._id} className={`card trip-card ${isSelected ? "selected" : ""}`}>
      <h3>{gem.placeTown}</h3>
      <p>
        {gem.cityTown}, {gem.state}
      </p>
      <p>
        {gem.type} | Budget: {"\u20B9"}
        {gem.budgetINR} | Duration: {gem.visitDuration}h
      </p>
      <div style={GEM_META_STYLE}>
        {"\u2B50"} Rating: {gem.rating}
      </div>
      {gem.description && <p style={GEM_DESC_STYLE}>{gem.description}</p>}

      {isSelected && (
        <div
          style={SELECTED_GEM_HOTELS_STYLE}
          data-stop-gem-toggle="true"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <HotelsNearby gem={gem} budget={tripBudget} />
        </div>
      )}
    </article>
  );
});

export default function HiddenGems() {
  const [searchParams] = useSearchParams();
  const { tripForm } = useTripForm();
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGemId, setSelectedGemId] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const activeRequestRef = useRef(null);
  const [filters, setFilters] = useState(() => ({
    state: searchParams.get("state") || "",
    type: searchParams.get("type") || "",
    hiddenGem: true,
    search: searchParams.get("search") || ""
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(
    async (retryCount = 0) => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
      const controller = new AbortController();
      activeRequestRef.current = controller;

      try {
        setLoading(true);
        setError(null);
        const q = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== "" && v !== false) q.set(k, String(v));
        });

        const { data } = await api.get(`/places/hidden-gems?${q.toString()}`, {
          timeout: 10000,
          signal: controller.signal
        });

        setItems(Array.isArray(data) ? data : []);

        if (filters.search || filters.state) {
          const target = filters.search || filters.state;
          try {
            const r = await api.get(`/places/by-destination/${encodeURIComponent(target)}`, {
              signal: controller.signal
            });
            setRecommendations(r.data.recommendations || []);
          } catch (recError) {
            if (recError?.code === "ERR_CANCELED") return;
            console.warn("Could not load recommendations:", recError.message);
            setRecommendations([]);
          }
        } else {
          setRecommendations([]);
        }
        setLoading(false);
      } catch (loadError) {
        if (loadError?.code === "ERR_CANCELED") return;

        if (retryCount < 2 && (loadError.code === "ECONNABORTED" || loadError.code === "ERR_NETWORK")) {
          setTimeout(() => load(retryCount + 1), 1000);
          return;
        }

        let errorMsg = "Failed to load gems";

        if (loadError.code === "ERR_NETWORK") {
          errorMsg =
            "Network error: Cannot reach server at " + api.defaults.baseURL + " - Make sure backend is running on port 5000";
        } else if (loadError.response?.status === 404) {
          errorMsg = "API endpoint not found - Backend may not be running";
        } else if (loadError.response?.status === 500) {
          errorMsg = "Server error: " + (loadError.response?.data?.message || "Check backend logs");
        } else if (loadError.message === "timeout of 10000ms exceeded") {
          errorMsg = "Request timeout - Server is too slow or not responding";
        } else {
          errorMsg = loadError.response?.data?.message || loadError.message || errorMsg;
        }

        setError(errorMsg);
        setLoading(false);

        if (retryCount === 0) {
          toast.error(errorMsg, { duration: 5000 });
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    api
      .get("/places/states")
      .then((r) => setStates(r.data))
      .catch((e) => {
        console.error("Failed to load states:", e.message);
      });
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    if (!selectedGemId) return;
    if (!items.some((item) => item._id === selectedGemId)) {
      setSelectedGemId(null);
    }
  }, [items, selectedGemId]);

  const handleCardsClick = useCallback((event) => {
    if (event.target.closest("[data-stop-gem-toggle]")) return;
    const card = event.target.closest("[data-gem-id]");
    if (!card) return;
    const clickedGemId = card.getAttribute("data-gem-id");
    if (!clickedGemId) return;
    setSelectedGemId((prev) => (prev === clickedGemId ? null : clickedGemId));
  }, []);

  const tripBudget = Number(tripForm.budget) || 50000;

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Discovery</p>
          <h2>Hidden Gems Recommendation Engine</h2>
        </div>
      </section>

      <section className="card filter-panel">
        <div className="field-grid">
          <label>
            Search
            <input placeholder="Search place/city/state" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </label>
          <label>
            State
            <select value={filters.state} onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}>
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="card">
          <h3>Instead of popular spots, try these</h3>
          {recommendations.map((x, i) => (
            <p key={i}>
              Instead of <b>{x.insteadOf}</b> in {x.cityTown}, try <b>{x.tryThis}</b> ({x.reason})
            </p>
          ))}
        </section>
      )}

      {error && (
        <section className="card" style={{ backgroundColor: "#fee", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <p style={{ color: "#c00", margin: "0 0 10px 0" }}>
            <strong>{"\u26A0\uFE0F"} Error:</strong> {error}
          </p>
          <p style={{ color: "#666", margin: "0 0 10px 0", fontSize: "14px" }}>
            <strong>Troubleshooting:</strong>
          </p>
          <ul style={{ color: "#666", margin: "0 0 10px 0", fontSize: "14px", paddingLeft: "20px" }}>
            <li>Make sure backend server is running: <code>npm run dev</code> in server folder</li>
            <li>Backend should be on http://localhost:5000</li>
            <li>Check if MongoDB is connected</li>
            <li>Check browser console (F12) for more details</li>
          </ul>
          <button
            onClick={() => load()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {"\uD83D\uDD04"} Retry Loading
          </button>
        </section>
      )}

      {loading && (
        <section className="card">
          <p style={{ textAlign: "center", padding: "20px" }}>Loading hidden gems...</p>
        </section>
      )}

      {!loading && !error && items.length === 0 && (
        <section className="card empty-state">
          <h3>No hidden gems found</h3>
          <p>Try adjusting your filters or search criteria.</p>
        </section>
      )}

      <section className="cards gems-cards" onClick={handleCardsClick}>
        {items.map((p) => (
          <HiddenGemCard key={p._id} gem={p} isSelected={selectedGemId === p._id} tripBudget={tripBudget} />
        ))}
      </section>
    </main>
  );
}
