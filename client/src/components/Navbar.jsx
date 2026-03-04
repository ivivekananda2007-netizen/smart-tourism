import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "./Smarte_ai_पर्यटन_डिज़ाइन-removebg-preview.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const securePath = (path) => (user ? path : "/login");
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand brand-logo-container">
          <span className="brand-mark logo-popup">
            {!logoError ? (
              <img
                className="brand-logo"
                src={logo}
                alt="Smart Tourism"
                title="Smart Tourism"
                decoding="async"
                fetchPriority="high"
                onError={() => setLogoError(true)}
              />
            ) : (
              "ST"
            )}
          </span>
        </Link>
        <nav className="nav-links">
          <Link to="/">
            <span className="nav-symbol" aria-hidden="true">
              {"\u2302"}
            </span>{" "}
            Home
          </Link>
          <Link to={securePath("/plan")}>Plan Trip</Link>
          <Link to={securePath("/my-trips")}>My Trips</Link>
          <Link to="/hidden-gems">Hidden Gems</Link>
          <Link to={securePath("/saved-places")}>Saved Places</Link>
          <Link to={securePath("/weather")}>Weather</Link>
          <Link to={securePath("/settings")}>Settings</Link>
          <Link to="/help">Help</Link>
          {!user && (
            <Link to="/login">
              <span className="nav-symbol" aria-hidden="true">
                {"\u21AA"}
              </span>{" "}
              Sign In
            </Link>
          )}
          {user && <span className="user-pill">{user.name || user.email}</span>}
          {user && (
            <button
              className="btn btn-text"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
