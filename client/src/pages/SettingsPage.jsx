import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weatherAlerts: true,
    hiddenGemsAlerts: true,
    nearbyHotelsAlerts: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [gmailConfigured, setGmailConfigured] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [{ data }, { data: emailStatus }] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/settings/email-status")
        ]);
        setProfile({
          name: data?.name || "",
          phone: data?.phone || "",
          email: data?.email || ""
        });
        setNotifications({
          emailAlerts: Boolean(data?.notificationSettings?.emailAlerts),
          weatherAlerts: Boolean(data?.notificationSettings?.weatherAlerts),
          hiddenGemsAlerts: Boolean(data?.notificationSettings?.hiddenGemsAlerts),
          nearbyHotelsAlerts: Boolean(data?.notificationSettings?.nearbyHotelsAlerts)
        });
        setGmailConfigured(Boolean(emailStatus?.gmailConfigured));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profile.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (profile.phone && profile.phone.replace(/\D/g, "").length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const { data } = await api.put("/auth/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
      const storedRaw = localStorage.getItem("smartTourismUser");
      if (storedRaw) {
        const stored = JSON.parse(storedRaw);
        localStorage.setItem(
          "smartTourismUser",
          JSON.stringify({ ...stored, name: data.name, email: data.email, phone: data.phone || "" })
        );
      }
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const saveNotifications = async () => {
    try {
      await api.put("/auth/settings", notifications);
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save notification settings");
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill current and new password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await api.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm("Delete account permanently? This will remove your trips and cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete("/auth/account");
      logout();
      toast.success("Account deleted");
      navigate("/register");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <main className="container page">
        <section className="card">Loading settings...</section>
      </main>
    );
  }

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Settings</p>
          <h2>Account Settings</h2>
          <p className="muted">Manage your account details and tourism alerts.</p>
        </div>
      </section>

      <section className="card form">
        <h3>Account Settings</h3>
        <label>
          Name
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </label>
        <label>
          Phone Number
          <input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="Enter 10-digit phone number"
            inputMode="numeric"
            maxLength={10}
          />
        </label>
        <label>
          Email
          <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </label>
        <button className="btn" type="button" onClick={saveProfile}>
          Save Profile
        </button>

        <h3>Notifications</h3>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={notifications.emailAlerts}
            onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
          />
          Email alerts for trip updates
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={notifications.weatherAlerts}
            onChange={(e) => setNotifications({ ...notifications, weatherAlerts: e.target.checked })}
          />
          Weather alerts before trip dates
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={notifications.hiddenGemsAlerts}
            onChange={(e) => setNotifications({ ...notifications, hiddenGemsAlerts: e.target.checked })}
          />
          Hidden Gems recommendations alerts
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={notifications.nearbyHotelsAlerts}
            onChange={(e) => setNotifications({ ...notifications, nearbyHotelsAlerts: e.target.checked })}
          />
          New Nearby Hotels alerts
        </label>
        <button className="btn" type="button" onClick={saveNotifications}>
          Save Notification Settings
        </button>

        <h3>Email Service Status</h3>
        {gmailConfigured === null ? (
          <p className="muted">Checking Gmail configuration...</p>
        ) : gmailConfigured ? (
          <p style={{ color: "#128a5a", fontWeight: 700 }}>✔ Gmail Connected</p>
        ) : (
          <p style={{ color: "#b42334", fontWeight: 700 }}>✖ Gmail Not Configured</p>
        )}

        <h3>Change Password</h3>
        <label>
          Current Password
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
        </label>
        <Link to="/forgot-password" style={{ color: "#1f5ca9", fontWeight: 700, textDecoration: "underline" }}>
          Forgot Password?
        </Link>
        <label>
          New Password
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
        </label>
        <label>
          Confirm New Password
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
        </label>
        <button className="btn" type="button" onClick={changePassword}>
          Change Password
        </button>

        <h3>Delete Account</h3>
        <p className="muted">This action is permanent and cannot be undone.</p>
        <button className="btn secondary" type="button" onClick={deleteAccount}>
          Delete Account
        </button>
      </section>
    </main>
  );
}
