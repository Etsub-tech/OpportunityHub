import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/StatusStates";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Log in</h2>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <ErrorBanner message={error} />

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <p className="muted center-text mt-lg">
            No account yet? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
