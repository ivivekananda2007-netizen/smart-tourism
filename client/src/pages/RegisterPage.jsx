import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="container page auth-page">
      <section className="auth-card card">
        <p className="kicker">Start your journey</p>
        <h2>Create your travel account</h2>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Full name
            <input placeholder="Vivek Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email
            <input placeholder="you@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input
              placeholder="Create password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="btn" type="submit">
            Create account
          </button>
        </form>
        <p className="muted">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
