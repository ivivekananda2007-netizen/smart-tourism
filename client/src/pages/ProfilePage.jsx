import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Profile</p>
          <h2>My Profile</h2>
          <p className="muted">Manage your account details.</p>
        </div>
      </section>

      <section className="card profile-grid">
        <article className="card soft-card">
          <h3>{user?.name || "Traveler"}</h3>
          <p>{user?.email}</p>
        </article>
        <article className="card soft-card">
          <h3>Account</h3>
          <p className="muted">Your profile details are linked to your login account.</p>
          <p>
            <strong>Name:</strong> {user?.name || "Not set"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "Not set"}
          </p>
        </article>
      </section>
    </main>
  );
}
