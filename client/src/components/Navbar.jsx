import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaBookmark,
  FaCircleQuestion,
  FaCloudSun,
  FaCompass,
  FaGear,
  FaHouse,
  FaRightFromBracket,
  FaRoute,
  FaSuitcaseRolling,
  FaUser
} from "react-icons/fa6";
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
              <FaHouse />
            </span>{" "}
            Home
          </Link>
          <Link to={securePath("/plan")}>
            <span className="nav-symbol" aria-hidden="true">
              <FaRoute />
            </span>{" "}
            Plan Trip
          </Link>
          <Link to={securePath("/my-trips")}>
            <span className="nav-symbol" aria-hidden="true">
              <FaSuitcaseRolling />
            </span>{" "}
            My Trips
          </Link>
          <Link to="/hidden-gems">
            <span className="nav-symbol" aria-hidden="true">
              <FaCompass />
            </span>{" "}
            Hidden Gems
          </Link>
          <Link to={securePath("/saved-places")}>
            <span className="nav-symbol" aria-hidden="true">
              <FaBookmark />
            </span>{" "}
            Saved Places
          </Link>
          <Link to={securePath("/weather")}>
            <span className="nav-symbol" aria-hidden="true">
              <FaCloudSun />
            </span>{" "}
            Weather
          </Link>
          <Link to={securePath("/settings")}>
            <span className="nav-symbol" aria-hidden="true">
              <FaGear />
            </span>{" "}
            Settings
          </Link>
          <Link to="/help">
            <span className="nav-symbol" aria-hidden="true">
              <FaCircleQuestion />
            </span>{" "}
            Help
          </Link>
          {!user && (
            <Link to="/login">
              <span className="nav-symbol" aria-hidden="true">
                <FaRightFromBracket />
              </span>{" "}
              Sign In
            </Link>
          )}
          {user && (
            <span className="user-pill">
              <span className="nav-symbol" aria-hidden="true">
                <FaUser />
              </span>{" "}
              {user.name || user.email}
            </span>
          )}
          {user && (
            <button
              className="btn btn-text"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <span className="nav-symbol" aria-hidden="true">
                <FaRightFromBracket />
              </span>{" "}
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
