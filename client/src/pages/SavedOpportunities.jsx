import { useEffect, useState } from "react";
import * as applicationService from "../services/applicationService";
import { Loading, EmptyState, ErrorBanner } from "../components/StatusStates";
import OpportunityCard from "../components/OpportunityCard";

export default function SavedOpportunities() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    applicationService
      .getApplications()
      .then((data) => setApplications(data.applications.filter((a) => a.status === "Saved")))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(applicationId) {
    try {
      await applicationService.deleteApplication(applicationId);
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Saved Opportunities</h1>
        <ErrorBanner message={error} />
        {loading && <Loading />}
        {!loading && applications.length === 0 && <EmptyState label="You haven't saved any opportunities yet." />}
        <div className="grid">
          {applications.map((app) => (
            <div key={app._id} className="stack">
              <OpportunityCard opportunity={app.opportunity} />
              <button className="btn btn-danger btn-sm" onClick={() => handleRemove(app._id)}>
                Remove from saved
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
