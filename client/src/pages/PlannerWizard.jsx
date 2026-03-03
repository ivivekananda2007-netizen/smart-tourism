import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useTripForm } from "../context/TripContext";

const INTERESTS = ["nature", "food", "adventure", "culture", "photography", "historical", "religious", "beach", "wildlife", "hill"];
const STYLES = ["budget", "solo", "family", "luxury"];

export default function PlannerWizard() {
  const [loading, setLoading] = useState(false);
  const { tripForm, updateForm, resetForm } = useTripForm();
  const navigate = useNavigate();

  const toggleInterest = (x) => {
    const has = tripForm.interests.includes(x);
    updateForm({ interests: has ? tripForm.interests.filter((i) => i !== x) : [...tripForm.interests, x] });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/trips/generate", tripForm);
      resetForm();
      navigate(`/itinerary/${data._id}`);
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Trip Builder</p>
          <h2>AI Personalized Trip Planner</h2>
        </div>
      </section>

      <form className="form card planner-card" onSubmit={onSubmit}>
        <label>
          Destination
          <input placeholder="Enter city or state" value={tripForm.destination} onChange={(e) => updateForm({ destination: e.target.value })} />
        </label>
        <div className="field-grid">
          <label>
            Start date
            <input type="date" value={tripForm.startDate} onChange={(e) => updateForm({ startDate: e.target.value })} />
          </label>
          <label>
            End date
            <input type="date" value={tripForm.endDate} onChange={(e) => updateForm({ endDate: e.target.value })} />
          </label>
          <label>
            Total budget (INR)
            <input type="number" placeholder="50000" value={tripForm.budget} onChange={(e) => updateForm({ budget: e.target.value })} />
          </label>
        </div>

        <div>
          <label>Interests</label>
          <div className="chips">
            {INTERESTS.map((i) => (
              <button type="button" key={i} className={tripForm.interests.includes(i) ? "chip active" : "chip"} onClick={() => toggleInterest(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <label>
          Travel style
          <select value={tripForm.travelStyle} onChange={(e) => updateForm({ travelStyle: e.target.value })}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button disabled={loading} className="btn" type="submit">
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </form>
    </main>
  );
}
