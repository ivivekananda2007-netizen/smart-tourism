import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import PlannerWizard from "./pages/PlannerWizard";
import ItineraryView from "./pages/ItineraryView";
import HiddenGems from "./pages/HiddenGems";
import BudgetTracker from "./pages/BudgetTracker";
import SavedPlacesPage from "./pages/SavedPlacesPage";
import WeatherAlertsPage from "./pages/WeatherAlertsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import HelpSupportPage from "./pages/HelpSupportPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <PrivateRoute>
              <PlannerWizard />
            </PrivateRoute>
          }
        />
        <Route
          path="/itinerary/:id"
          element={
            <PrivateRoute>
              <ItineraryView />
            </PrivateRoute>
          }
        />
        <Route
          path="/hidden-gems"
          element={<HiddenGems />}
        />
        <Route
          path="/saved-places"
          element={
            <PrivateRoute>
              <SavedPlacesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <PrivateRoute>
              <WeatherAlertsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/budget/:id?"
          element={
            <PrivateRoute>
              <BudgetTracker />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}
