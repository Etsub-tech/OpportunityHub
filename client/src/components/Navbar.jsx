import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="container flex-between" style={{ height: "64px" }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--color-text)" }}>
          OpportunityHub
        </Link>

        <nav className="flex gap-md">
          <Link to="/discover">Discover</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/saved">Saved</Link>
              <Link to="/tracker">Tracker</Link>
              <Link to="/submit">Submit</Link>
              {user.role === "admin" && <Link to="/admin">Admin</Link>}
              <Link to="/profile">Profile</Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
