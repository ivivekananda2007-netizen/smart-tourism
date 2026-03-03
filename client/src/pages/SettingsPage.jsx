import { useState } from "react";
import toast from "react-hot-toast";

const SETTINGS_KEY = "smartTourismSettings";

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => ({
    theme: readSettings().theme || "light",
    emailAlerts: Boolean(readSettings().emailAlerts),
    weatherAlerts: Boolean(readSettings().weatherAlerts)
  }));

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Settings saved");
  };

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Settings</p>
          <h2>Account Settings</h2>
          <p className="muted">Control app preferences, alerts, and appearance options.</p>
        </div>
      </section>

      <section className="card form">
        <label>
          Theme
          <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.emailAlerts}
            onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
          />
          Email alerts for trip updates
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.weatherAlerts}
            onChange={(e) => setSettings({ ...settings, weatherAlerts: e.target.checked })}
          />
          Weather alerts before trip dates
        </label>

        <button className="btn" onClick={saveSettings}>
          Save Settings
        </button>
      </section>
    </main>
  );
}
