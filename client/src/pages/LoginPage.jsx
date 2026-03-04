import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Logged in");
      navigate("/dashboard");
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="container page auth-page">
      <section className="auth-layout">
        <article className="auth-showcase card">
          <div className="auth-showcase-overlay" />
          <div className="auth-showcase-content">
            <p className="kicker">Trip AI Companion</p>
            <h2>Plan better journeys with smart suggestions</h2>
            <p>
              Discover routes, hidden gems, weather updates, and budget tips in one place.
            </p>
            <div className="auth-showcase-actions">
              <Link className="btn btn-text" to="/register">
                Create Account
              </Link>
            </div>
          </div>
        </article>

        <section className="auth-card card">
          <p className="kicker">Welcome back</p>
          <h2>Login to continue planning</h2>
          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input placeholder="you@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Password
              <input
                placeholder="Enter password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <button className="btn" type="submit">
              Login
            </button>
            {user && (
              <button className="btn secondary" type="button" onClick={() => navigate("/profile")}>
                Go to Profile
              </button>
            )}
          </form>
          <p className="muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
