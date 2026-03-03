import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import api from "../api";

export default function BudgetTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [expense, setExpense] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "food",
    amount: "",
    note: ""
  });

  const loadTrip = async (tripId) => {
    const { data } = await api.get(`/trips/${tripId}`);
    setTrip(data);
  };

  useEffect(() => {
    if (id) {
      loadTrip(id).catch(() => toast.error("Failed to load trip"));
    } else {
      api
        .get("/trips")
        .then((r) => setTrips(r.data))
        .catch(() => toast.error("Failed to load trips"));
    }
  }, [id]);

  const addExpense = async () => {
    await api.post(`/trips/${id}/spend`, expense);
    await loadTrip(id);
    setExpense({ ...expense, amount: "", note: "" });
  };

  const pieData = useMemo(() => {
    if (!trip?.budgetBreakdown) return [];
    return Object.entries(trip.budgetBreakdown)
      .filter(([k]) => k !== "total")
      .map(([name, value]) => ({ name, value }));
  }, [trip]);

  const dailyData = useMemo(() => {
    if (!trip?.spendLog) return [];
    const m = {};
    trip.spendLog.forEach((x) => {
      m[x.date] = (m[x.date] || 0) + Number(x.amount || 0);
    });
    return Object.entries(m).map(([date, amount]) => ({ date, amount }));
  }, [trip]);

  if (!id) {
    return (
      <main className="container page">
        <section className="section-head">
          <div>
            <p className="kicker">Expense Manager</p>
            <h2>Budget Tracker</h2>
          </div>
        </section>
        <section className="cards">
          {trips.map((t) => (
            <article key={t._id} className="card trip-card">
              <h3>{t.destination}</h3>
              <button className="btn" onClick={() => navigate(`/budget/${t._id}`)}>
                Open Budget
              </button>
            </article>
          ))}
        </section>
        {trips.length === 0 && (
          <p>
            No trips available. <Link to="/plan">Plan a trip</Link>
          </p>
        )}
      </main>
    );
  }

  if (!trip) return <main className="container page">Loading...</main>;

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Expense Manager</p>
          <h2>Budget - {trip.destination}</h2>
          <p className="muted">
            Planned INR {trip.budget} | Actual INR {trip.actualSpend || 0}
          </p>
        </div>
      </section>

      <section className="card form">
        <h3>Add Expense</h3>
        <div className="field-grid">
          <label>
            Date
            <input type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} />
          </label>
          <label>
            Category
            <select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
              <option value="accommodation">accommodation</option>
              <option value="food">food</option>
              <option value="transport">transport</option>
              <option value="activities">activities</option>
              <option value="entertainment">entertainment</option>
              <option value="shopping">shopping</option>
              <option value="other">other</option>
            </select>
          </label>
          <label>
            Amount (INR)
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
            />
          </label>
        </div>
        <label>
          Note
          <input placeholder="Note" value={expense.note} onChange={(e) => setExpense({ ...expense, note: e.target.value })} />
        </label>
        <button className="btn" onClick={() => addExpense().catch(() => toast.error("Failed to add expense"))}>
          Save Expense
        </button>
      </section>

      <section className="charts">
        <article className="card">
          <h3>Planned split</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
        <article className="card">
          <h3>Spend by day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}
