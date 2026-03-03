import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";

export default function HiddenGems() {
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    state: "",
    type: "",
    hiddenGem: true,
    search: "",
    preset: ""
  });

  const load = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== false) q.set(k, String(v));
      });
      console.log(`📍 Fetching hidden gems (attempt ${retryCount + 1})...`);
      console.log(`🔗 API URL: ${api.defaults.baseURL}/places/hidden-gems?${q.toString()}`);
      
      const { data } = await api.get(`/places/hidden-gems?${q.toString()}`, {
        timeout: 10000
      });
      
      console.log(`✅ Got hidden gems data:`, data);
      console.log(`📊 Total gems: ${data?.length || 0}`);
      
      setItems(Array.isArray(data) ? data : []);
      
      if (filters.search || filters.state) {
        const target = filters.search || filters.state;
        try {
          const r = await api.get(`/places/by-destination/${encodeURIComponent(target)}`);
          setRecommendations(r.data.recommendations || []);
        } catch (recError) {
          console.warn("Could not load recommendations:", recError.message);
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading gems:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      // Retry logic for network errors
      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
        console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => load(retryCount + 1), 1000);
        return;
      }
      
      let errorMsg = "Failed to load gems";
      
      if (error.code === 'ERR_NETWORK') {
        errorMsg = "Network error: Cannot reach server at " + api.defaults.baseURL + " - Make sure backend is running on port 5000";
      } else if (error.response?.status === 404) {
        errorMsg = "API endpoint not found - Backend may not be running";
      } else if (error.response?.status === 500) {
        errorMsg = "Server error: " + (error.response?.data?.message || "Check backend logs");
      } else if (error.message === 'timeout of 10000ms exceeded') {
        errorMsg = "Request timeout - Server is too slow or not responding";
      } else {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      }
      
      setError(errorMsg);
      setLoading(false);
      
      if (retryCount === 0) {
        toast.error(errorMsg, { duration: 5000 });
      }
    }
  };

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
  }, [filters]);

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
            <input placeholder="Search place/city/state" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </label>
          <label>
            State
            <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preset
            <select value={filters.preset} onChange={(e) => setFilters({ ...filters, preset: e.target.value })}>
              <option value="">No preset</option>
              <option value="quiet">Quiet</option>
              <option value="photography">Photography</option>
              <option value="local-food">Local food</option>
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
            <strong>⚠️ Error:</strong> {error}
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
            🔄 Retry Loading
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

      <section className="cards">
        {items.map((p) => (
          <article key={p._id} className="card trip-card">
            <h3>{p.placeTown}</h3>
            <p>
              {p.cityTown}, {p.state}
            </p>
            <p>
              {p.type} | Budget: ₹{p.budgetINR} | Duration: {p.visitDuration}h
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
