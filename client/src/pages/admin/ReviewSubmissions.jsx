import { useEffect, useState } from "react";
import * as adminService from "../../services/adminService";
import { Loading, EmptyState, ErrorBanner } from "../../components/StatusStates";

export default function ReviewSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    adminService.getAllSubmissions().then((data) => setSubmissions(data.submissions)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleReview(id, action) {
    let rejectionReason;
    if (action === "reject") {
      rejectionReason = prompt("Reason for rejection (optional):") || "";
    }
    try {
      await adminService.reviewSubmission(id, action, rejectionReason);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page container"><Loading /></div>;

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="page">
      <div className="container stack">
        <h1>Review Submissions</h1>
        <ErrorBanner message={error} />

        <h3>Pending ({pending.length})</h3>
        {pending.length === 0 && <EmptyState label="No pending submissions." />}
        <div className="stack">
          {pending.map((sub) => (
            <div key={sub._id} className="card">
              <div className="flex-between">
                <div>
                  <strong>{sub.title}</strong>
                  <div className="muted">{sub.organization} · {sub.opportunityType}</div>
                </div>
                <span className="badge badge-warning">pending</span>
              </div>
              <p>{sub.description}</p>
              <div className="muted">Submitted by: {sub.submittedBy?.name} ({sub.submittedBy?.email})</div>
              {sub.notes && <div className="muted">Note: {sub.notes}</div>}
              <a href={sub.applicationUrl} target="_blank" rel="noreferrer">View application link →</a>
              <div className="flex gap-sm mt-lg">
                <button className="btn btn-primary btn-sm" onClick={() => handleReview(sub._id, "approve")}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleReview(sub._id, "reject")}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-lg">Reviewed</h3>
        <div className="stack">
          {reviewed.map((sub) => (
            <div key={sub._id} className="card flex-between">
              <div>
                <strong>{sub.title}</strong>
                <div className="muted">{sub.organization}</div>
              </div>
              <span className={`badge ${sub.status === "approved" ? "badge-success" : "badge-danger"}`}>{sub.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
