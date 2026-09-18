import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as opportunityService from "../services/opportunityService";
import * as applicationService from "../services/applicationService";
import { useAuth } from "../context/AuthContext";
import { Loading, ErrorBanner } from "../components/StatusStates";
import MatchResult from "../components/MatchResult";
import { formatDeadline, formatDate, isExpired } from "../utils/deadline";

export default function OpportunityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    opportunityService
      .getOpportunityById(id)
      .then((data) => setOpportunity(data.opportunity))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // The match check needs a logged-in user's profile - if there's no
    // user, we simply don't call it rather than showing a confusing 401 error.
    if (user) {
      opportunityService.getMatch(id).then((data) => setMatch(data)).catch(() => {});
    }
  }, [id, user]);

  async function handleSave() {
    try {
      await applicationService.saveOpportunity(id);
      setSaveMessage("Saved to your tracker.");
    } catch (err) {
      setSaveMessage(err.message);
    }
  }

  if (loading) return <div className="page container"><Loading /></div>;
  if (error) return <div className="page container"><ErrorBanner message={error} /></div>;
  if (!opportunity) return null;

  const expired = isExpired(opportunity.deadline);

  return (
    <div className="page">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div className="stack">
          <div>
            {opportunity.isDemo && <span className="badge badge-neutral mb-lg">DEMO DATA — for development only</span>}
            <div className="muted">{opportunity.organization}</div>
            <h1>{opportunity.title}</h1>
            <div className="flex gap-sm flex-wrap">
              <span className="badge badge-neutral">{opportunity.opportunityType}</span>
              {opportunity.remote && <span className="badge badge-neutral">🌍 Remote</span>}
              <span className={expired ? "badge badge-danger" : "badge badge-warning"}>
                ⏰ {expired ? "Deadline passed" : formatDeadline(opportunity.deadline)}
              </span>
            </div>
          </div>

          <div className="card">
            <h3>Description</h3>
            <p>{opportunity.description}</p>
          </div>

          <div className="card">
            <h3>Eligibility & Requirements</h3>
            <p className="muted">{opportunity.eligibility || "Not stated by the source — check the official application page."}</p>
            <ul>
              {opportunity.degreeRequirements?.length > 0 && <li>Degree: {opportunity.degreeRequirements.join(", ")}</li>}
              {opportunity.studyLevel?.length > 0 && <li>Study level: {opportunity.studyLevel.join(", ")}</li>}
              {(opportunity.minGraduationYear || opportunity.maxGraduationYear) && (
                <li>
                  Graduation year: {opportunity.minGraduationYear || "any"} – {opportunity.maxGraduationYear || "any"}
                </li>
              )}
              {opportunity.skills?.length > 0 && <li>Skills: {opportunity.skills.join(", ")}</li>}
            </ul>
          </div>

          <div className="card">
            <h3>Funding</h3>
            <p>{opportunity.funding}{opportunity.fundingDetails ? ` — ${opportunity.fundingDetails}` : ""}</p>
          </div>
        </div>

        <div className="stack">
          <div className="card stack">
            <div className="flex-between">
              <span className="muted">Deadline</span>
              <strong>{formatDate(opportunity.deadline)}</strong>
            </div>
            <div className="flex-between">
              <span className="muted">Duration</span>
              <strong>{opportunity.duration || "—"}</strong>
            </div>
            <div className="flex-between">
              <span className="muted">Location</span>
              <strong>{opportunity.location || opportunity.country || "—"}</strong>
            </div>

            <a href={opportunity.applicationUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%" }}>
              Apply on official site →
            </a>
            {user && (
              <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleSave}>
                Save to my tracker
              </button>
            )}
            {saveMessage && <div className="muted center-text">{saveMessage}</div>}

            <div className="field-hint" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.6rem" }}>
              <strong>OpportunityHub information</strong> is collected/curated by us for discovery
              purposes. The <strong>official application page</strong> (linked above) is run by{" "}
              {opportunity.organization}, not OpportunityHub — always verify details there.
            </div>
          </div>

          {user && match && <MatchResult match={match} />}
        </div>
      </div>
    </div>
  );
}
