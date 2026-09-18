import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminService from "../../services/adminService";
import { Loading, ErrorBanner } from "../../components/StatusStates";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  async function handleTriggerIngestion() {
    setIngesting(true);
    setIngestResult(null);
    try {
      const result = await adminService.triggerIngestion();
      setIngestResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIngesting(false);
    }
  }

  if (error) return <div className="page container"><ErrorBanner message={error} /></div>;
  if (!stats) return <div className="page container"><Loading /></div>;

  return (
    <div className="page">
      <div className="container stack">
        <h1>Admin Dashboard</h1>

        <div className="grid">
          <div className="card center-text"><div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.totalUsers}</div><div className="muted">Users</div></div>
          <div className="card center-text"><div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.totalOpportunities}</div><div className="muted">Total Opportunities</div></div>
          <div className="card center-text"><div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.activeOpportunities}</div><div className="muted">Active</div></div>
          <div className="card center-text"><div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{stats.pendingSubmissions}</div><div className="muted">Pending Submissions</div></div>
        </div>

        <div className="card">
          <h3>Opportunities by source</h3>
          <ul>
            {stats.opportunitiesBySource.map((s) => <li key={s._id}>{s._id}: {s.count}</li>)}
          </ul>
        </div>

        <div className="card">
          <h3>Data collection</h3>
          <p className="muted">Manually trigger the ingestion pipeline instead of waiting for the next scheduled 6-hour run.</p>
          <button className="btn btn-primary" onClick={handleTriggerIngestion} disabled={ingesting}>
            {ingesting ? "Running…" : "Run ingestion now"}
          </button>
          {ingestResult && (
            <div className="mt-lg">
              <div>Created: {ingestResult.created} · Updated: {ingestResult.updated}</div>
              {ingestResult.errors.length > 0 && (
                <ul className="form-error">
                  {ingestResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-md">
          <Link to="/admin/opportunities" className="btn btn-secondary">Manage Opportunities</Link>
          <Link to="/admin/submissions" className="btn btn-secondary">Review Submissions</Link>
        </div>
      </div>
    </div>
  );
}
