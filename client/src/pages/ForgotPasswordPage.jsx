import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSending(true);
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      toast.success(data?.message || "Reset link sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Account Recovery</p>
          <h2>Forgot Password</h2>
          <p className="muted">Enter your registered email address to receive a secure reset link.</p>
        </div>
      </section>

      <form className="card form" onSubmit={onSubmit}>
        <label>
          Registered Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <button className="btn" type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send Reset Link"}
        </button>
        {sent && (
          <p className="muted">
            If the email is valid, check your inbox and spam folder for the password reset link.
          </p>
        )}
      </form>
    </main>
  );
}
