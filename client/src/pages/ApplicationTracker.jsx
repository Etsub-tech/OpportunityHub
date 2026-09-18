import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as applicationService from "../services/applicationService";
import { Loading, ErrorBanner } from "../components/StatusStates";
import { formatDeadline } from "../utils/deadline";

const STATUSES = ["Saved", "Preparing", "Applied", "Interview", "Accepted", "Rejected"];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    applicationService
      .getApplications()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(applicationId, status) {
    try {
      const { application } = await applicationService.updateApplication(applicationId, { status });
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, status: application.status } : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNotesChange(applicationId, notes) {
    setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, notes } : a)));
  }

  async function handleNotesSave(applicationId, notes) {
    try {
      await applicationService.updateApplication(applicationId, { notes });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(applicationId) {
    try {
      await applicationService.deleteApplication(applicationId);
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page container"><Loading /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1>Application Tracker</h1>
        <ErrorBanner message={error} />

        <div className="stack">
          {applications.map((app) => (
            <div key={app._id} className="card">
              <div className="flex-between">
                <div>
                  <Link to={`/opportunities/${app.opportunity._id}`}><strong>{app.opportunity.title}</strong></Link>
                  <div className="muted">{app.opportunity.organization}</div>
                </div>
                <span className="badge badge-warning">⏰ {formatDeadline(app.opportunity.deadline)}</span>
              </div>

              <div className="flex gap-md mt-lg" style={{ marginTop: "0.75rem" }}>
                <select value={app.status} onChange={(e) => handleStatusChange(app._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app._id)}>Remove</button>
              </div>

              <textarea
                placeholder="Notes for this application…"
                value={app.notes}
                onChange={(e) => handleNotesChange(app._id, e.target.value)}
                onBlur={(e) => handleNotesSave(app._id, e.target.value)}
                rows={2}
                style={{ marginTop: "0.75rem" }}
              />
            </div>
          ))}
        </div>

        {applications.length === 0 && <p className="muted">Nothing tracked yet — save an opportunity from Discover to get started.</p>}
      </div>
    </div>
  );
}
