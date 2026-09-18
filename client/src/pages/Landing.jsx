import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page">
      <div className="container center-text" style={{ padding: "3rem 0" }}>
        <h1 style={{ fontSize: "2.4rem" }}>Find opportunities you can actually apply for.</h1>
        <p className="muted" style={{ maxWidth: "640px", margin: "1rem auto 2rem", fontSize: "1.05rem" }}>
          OpportunityHub centralizes international internships, scholarships, fellowships,
          research programs, hackathons, and more — then tells you, clearly, whether
          you're actually eligible based on your country, degree, study level, and skills.
        </p>
        <div className="flex gap-md" style={{ justifyContent: "center" }}>
          <Link to="/discover" className="btn btn-primary">
            Discover Opportunities
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create a Profile
          </Link>
        </div>

        <div className="grid mt-lg" style={{ marginTop: "3rem", textAlign: "left" }}>
          <div className="card">
            <h3>🔎 Discover</h3>
            <p className="muted">
              Search and filter internships, scholarships, fellowships, and more from one place
              instead of a dozen different websites.
            </p>
          </div>
          <div className="card">
            <h3>✓ Explainable Matching</h3>
            <p className="muted">
              No fake percentages. See exactly which requirements you meet, which you don't,
              and which the opportunity simply doesn't state.
            </p>
          </div>
          <div className="card">
            <h3>📋 Track Everything</h3>
            <p className="muted">
              Save opportunities and move them through your own application tracker —
              Saved, Preparing, Applied, Interview, Accepted, or Rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
