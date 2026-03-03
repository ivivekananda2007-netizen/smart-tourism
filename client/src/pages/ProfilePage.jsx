import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const PROFILE_PREFS_KEY = "smartTourismProfilePrefs";

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_PREFS_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(() => ({
    travelStyle: readPrefs().travelStyle || "budget",
    homeCity: readPrefs().homeCity || "",
    favoriteTripType: readPrefs().favoriteTripType || ""
  }));

  const savePreferences = () => {
    localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(prefs));
    toast.success("Profile preferences saved");
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Profile</p>
          <h2>My Profile</h2>
          <p className="muted">Manage your account details and travel preferences.</p>
        </div>
      </section>

      <section className="card profile-grid">
        <article className="card soft-card">
          <h3>{user?.name || "Traveler"}</h3>
          <p>{user?.email}</p>
        </article>
        <article className="card soft-card form">
          <h3>Preferences</h3>
          <label>
            Travel style
            <select value={prefs.travelStyle} onChange={(e) => setPrefs({ ...prefs, travelStyle: e.target.value })}>
              <option value="budget">Budget</option>
              <option value="family">Family</option>
              <option value="solo">Solo</option>
              <option value="luxury">Luxury</option>
            </select>
          </label>
          <label>
            Home city
            <input value={prefs.homeCity} onChange={(e) => setPrefs({ ...prefs, homeCity: e.target.value })} />
          </label>
          <label>
            Favorite trip type
            <input
              placeholder="Adventure, food, heritage..."
              value={prefs.favoriteTripType}
              onChange={(e) => setPrefs({ ...prefs, favoriteTripType: e.target.value })}
            />
          </label>
          <button className="btn" onClick={savePreferences}>
            Save Profile
          </button>
        </article>
      </section>
    </main>
  );
}
