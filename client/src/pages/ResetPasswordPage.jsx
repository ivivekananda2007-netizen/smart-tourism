import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post(`/auth/reset-password/${token}`, form);
      toast.success(data?.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Account Recovery</p>
          <h2>Reset Password</h2>
          <p className="muted">Set a new password for your account.</p>
        </div>
      </section>

      <form className="card form" onSubmit={onSubmit}>
        <label>
          New Password
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Enter new password"
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
          />
        </label>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </main>
  );
}
