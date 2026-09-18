const verdictStyles = {
  "Potential Match": "badge-success",
  "Not a Match": "badge-danger",
  "Check Eligibility Details": "badge-warning",
};

const statusIcon = { match: "✓", mismatch: "✗", unknown: "⚠" };
const statusClass = { match: "badge-success", mismatch: "badge-danger", unknown: "badge-warning" };

// Renders exactly what services/matchingService.js returns: a verdict plus
// a list of explainable checks. Deliberately does NOT compute anything -
// all the matching logic lives on the backend, this component just displays it.
export default function MatchResult({ match }) {
  if (!match) return null;

  return (
    <div className="card">
      <div className={`badge ${verdictStyles[match.verdict] || "badge-neutral"}`} style={{ marginBottom: "0.75rem" }}>
        {match.verdict}
      </div>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {match.checks.map((check, index) => (
          <li key={index} className="flex gap-sm" style={{ alignItems: "flex-start" }}>
            <span className={`badge ${statusClass[check.status]}`} style={{ minWidth: "1.5rem", justifyContent: "center" }}>
              {statusIcon[check.status]}
            </span>
            <span style={{ fontSize: "0.9rem" }}>{check.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
