import { Link } from "react-router-dom";
import { formatDeadline, isExpired } from "../utils/deadline";

const fundingClass = {
  "Fully Funded": "badge-success",
  "Paid": "badge-success",
  "Partially Funded": "badge-warning",
  "Unfunded": "badge-neutral",
  "Unknown": "badge-neutral",
};

// onSave is optional - Discover passes it, but a card shown inside the
// tracker (where it's already saved) doesn't need a save button at all.
export default function OpportunityCard({ opportunity, onSave, saving }) {
  const expired = isExpired(opportunity.deadline);

  return (
    <div className="card stack" style={{ opacity: expired ? 0.6 : 1 }}>
      <div className="flex-between">
        <span className="muted">{opportunity.organization}</span>
        {opportunity.isDemo && <span className="badge badge-neutral">DEMO DATA</span>}
      </div>

      <h3 style={{ fontSize: "1.05rem" }}>
        <Link to={`/opportunities/${opportunity._id}`}>{opportunity.title}</Link>
      </h3>

      <div className="flex gap-sm flex-wrap">
        <span className="badge badge-neutral">{opportunity.opportunityType}</span>
        {opportunity.remote && <span className="badge badge-neutral">🌍 Remote</span>}
        <span className={`badge ${fundingClass[opportunity.funding] || "badge-neutral"}`}>
          💰 {opportunity.funding}
        </span>
        {/* Shows exactly what field/department this opportunity got tagged
            with, so a mismatch (or a missing tag) is visible at a glance
            instead of being invisible internal data you have to guess about. */}
        {opportunity.field && <span className="badge badge-neutral">🏷 {opportunity.field}</span>}
      </div>

      <div className="muted" style={{ fontSize: "0.85rem" }}>
        {opportunity.location || opportunity.country || "Location not specified"}
      </div>

      <div className={expired ? "badge badge-danger" : "badge badge-warning"} style={{ alignSelf: "flex-start" }}>
        ⏰ {expired ? "Deadline passed" : formatDeadline(opportunity.deadline)}
      </div>

      <div className="flex-between mt-lg" style={{ marginTop: "0.5rem" }}>
        <Link to={`/opportunities/${opportunity._id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
        {onSave && (
          <button className="btn btn-primary btn-sm" onClick={() => onSave(opportunity._id)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
