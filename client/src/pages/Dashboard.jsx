import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as applicationService from "../services/applicationService";
import * as opportunityService from "../services/opportunityService";
import { Loading } from "../components/StatusStates";
import OpportunityCard from "../components/OpportunityCard";
import { formatDeadline } from "../utils/deadline";

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationService.getApplications(),
      opportunityService.getOpportunities({ sort: "newest", limit: 3 }),
    ])
      .then(([appData, recentData]) => {
        setApplications(appData.applications);
        setCounts(appData.counts);
        setRecent(recentData.opportunities);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page container"><Loading /></div>;

  const upcomingDeadlines = applications
    .filter((a) => a.opportunity?.deadline)
    .sort((a, b) => new Date(a.opportunity.deadline) - new Date(b.opportunity.deadline))
    .slice(0, 4);

  return (
    <div className="page">
      <div className="container stack">
        <h1>Welcome, {user.name}</h1>

        <div className="grid">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="card center-text">
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{count}</div>
              <div className="muted">{status}</div>
            </div>
          ))}
        </div>

        <section>
          <div className="flex-between mb-lg">
            <h2>Upcoming deadlines</h2>
            <Link to="/tracker">View tracker →</Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="muted">No tracked opportunities with a deadline yet.</p>
          ) : (
            <div className="stack">
              {upcomingDeadlines.map((app) => (
                <div key={app._id} className="card flex-between">
                  <div>
                    <Link to={`/opportunities/${app.opportunity._id}`}>{app.opportunity.title}</Link>
                    <div className="muted">{app.opportunity.organization}</div>
                  </div>
                  <span className="badge badge-warning">{formatDeadline(app.opportunity.deadline)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex-between mb-lg">
            <h2>Recently added opportunities</h2>
            <Link to="/discover">Discover more →</Link>
          </div>
          <div className="grid">
            {recent.map((opp) => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
