import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useTripForm } from "../context/TripContext";

const INTERESTS = ["nature", "food", "adventure", "culture", "photography", "historical", "religious", "beach", "wildlife", "hill"];
const STYLES = ["budget", "solo", "family", "luxury"];
const MIN_BUDGET_INR = 5000;

export default function PlannerWizard() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [budgetError, setBudgetError] = useState("");
  const { tripForm, updateForm, resetForm } = useTripForm();
  const navigate = useNavigate();
  const loadingMessages = [
    "Planning your perfect trip...",
    "Mapping your adventure...",
    "Packing your itinerary...",
    "Almost ready for takeoff!"
  ];

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setMessageIndex(0);
      return undefined;
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const bump = prev < 40 ? 3 : prev < 75 ? 2 : 1;
        return Math.min(95, prev + bump);
      });
    }, 180);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1600);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [loading]);

  const toggleInterest = (x) => {
    const has = tripForm.interests.includes(x);
    updateForm({ interests: has ? tripForm.interests.filter((i) => i !== x) : [...tripForm.interests, x] });
  };

  const handleBudgetChange = (value) => {
    updateForm({ budget: value });
    const numericBudget = Number(value);
    if (value && Number.isFinite(numericBudget) && numericBudget < MIN_BUDGET_INR) {
      setBudgetError("Please enter an amount above ₹5000.");
      return;
    }
    setBudgetError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const numericBudget = Number(tripForm.budget);
    if (!Number.isFinite(numericBudget) || numericBudget < MIN_BUDGET_INR) {
      setBudgetError("Please enter an amount above ₹5000.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/trips/generate", tripForm);
      setProgress(100);
      resetForm();
      setTimeout(() => navigate(`/itinerary/${data._id}`), 220);
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .trip-loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 15% 20%, rgba(221, 244, 255, 0.95), rgba(245, 251, 255, 0.98));
          backdrop-filter: blur(2px);
        }
        .trip-loading-card {
          width: min(92vw, 700px);
          border-radius: 20px;
          border: 1px solid rgba(189, 224, 243, 0.9);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 24px 50px rgba(20, 73, 112, 0.16);
          padding: 28px 26px;
          display: grid;
          gap: 14px;
        }
        .trip-loading-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }
        .trip-loading-bag {
          font-size: 1.6rem;
        }
        .trip-loading-route {
          position: relative;
          height: 90px;
          border-radius: 14px;
          background:
            radial-gradient(circle at 14% 20%, rgba(194, 232, 255, 0.85), transparent 38%),
            radial-gradient(circle at 82% 68%, rgba(183, 245, 236, 0.84), transparent 40%),
            linear-gradient(160deg, #f7fdff 0%, #eef9ff 100%);
          border: 1px solid rgba(201, 230, 246, 0.9);
          overflow: hidden;
        }
        .trip-loading-route::before {
          content: "";
          position: absolute;
          inset: 42px 20px auto 20px;
          border-top: 3px dashed #8bb8d6;
          transform: rotate(-8deg);
          transform-origin: left center;
        }
        .trip-loading-plane {
          position: absolute;
          top: 20px;
          left: -40px;
          font-size: 1.55rem;
          filter: drop-shadow(0 8px 12px rgba(18, 78, 120, 0.22));
          animation: roamPlane 2.4s linear infinite;
        }
        .trip-loading-cloud {
          position: absolute;
          font-size: 1.05rem;
          opacity: 0.7;
        }
        .trip-loading-cloud.c1 { top: 9px; left: 18%; }
        .trip-loading-cloud.c2 { top: 16px; right: 18%; }
        .trip-loading-cloud.c3 { top: 54px; left: 68%; }
        .trip-loading-message {
          font-weight: 700;
          color: #215676;
          min-height: 24px;
        }
        .trip-loading-progress-track {
          width: 100%;
          height: 12px;
          border-radius: 999px;
          background: #e8f3fb;
          border: 1px solid #cae0ef;
          overflow: hidden;
        }
        .trip-loading-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2a85c9 0%, #2db6ac 100%);
          transition: width 0.25s ease;
        }
        .trip-loading-progress-text {
          text-align: right;
          color: #336786;
          font-weight: 700;
          font-size: 0.9rem;
        }
        @keyframes roamPlane {
          0% { transform: translateX(0) translateY(0) rotate(8deg); }
          25% { transform: translateX(165px) translateY(14px) rotate(14deg); }
          50% { transform: translateX(330px) translateY(2px) rotate(5deg); }
          75% { transform: translateX(495px) translateY(16px) rotate(12deg); }
          100% { transform: translateX(690px) translateY(0) rotate(8deg); }
        }
        @media (max-width: 760px) {
          .trip-loading-card { padding: 20px 16px; }
          .trip-loading-route { height: 82px; }
          @keyframes roamPlane {
            0% { transform: translateX(0) translateY(0) rotate(8deg); }
            25% { transform: translateX(110px) translateY(14px) rotate(14deg); }
            50% { transform: translateX(220px) translateY(2px) rotate(5deg); }
            75% { transform: translateX(330px) translateY(16px) rotate(12deg); }
            100% { transform: translateX(440px) translateY(0) rotate(8deg); }
          }
        }
      `}</style>
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
              <input
                type="number"
                min={MIN_BUDGET_INR}
                placeholder="50000"
                value={tripForm.budget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                aria-invalid={Boolean(budgetError)}
                aria-describedby="budget-error"
              />
              <span className="muted">Minimum budget: ₹5000</span>
              {budgetError && (
                <span id="budget-error" style={{ color: "#b42334", fontWeight: 700 }}>
                  {budgetError}
                </span>
              )}
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

          <button disabled={loading || Boolean(budgetError)} className="btn" type="submit">
            {loading ? "Generating..." : "Generate Trip Plan"}
          </button>
        </form>
      </main>

      {loading && (
        <section className="trip-loading-overlay" role="status" aria-live="polite" aria-label="Generating trip itinerary">
          <article className="trip-loading-card">
            <div className="trip-loading-top">
              <h3 style={{ margin: 0, color: "#174f74" }}>Building Your Journey</h3>
              <span className="trip-loading-bag" aria-hidden="true">
                🧳
              </span>
            </div>
            <div className="trip-loading-route" aria-hidden="true">
              <span className="trip-loading-cloud c1">☁️</span>
              <span className="trip-loading-cloud c2">☁️</span>
              <span className="trip-loading-cloud c3">☁️</span>
              <span className="trip-loading-plane">✈️</span>
            </div>
            <p className="trip-loading-message">{loadingMessages[messageIndex]}</p>
            <div className="trip-loading-progress-track">
              <div className="trip-loading-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="trip-loading-progress-text">{progress}%</p>
          </article>
        </section>
      )}
    </>
  );
}
