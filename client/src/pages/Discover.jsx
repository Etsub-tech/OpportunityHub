import { useEffect, useState } from "react";
import OpportunityCard from "../components/OpportunityCard";
import { Loading, EmptyState, ErrorBanner } from "../components/StatusStates";
import * as opportunityService from "../services/opportunityService";
import * as applicationService from "../services/applicationService";
import { useAuth } from "../context/AuthContext";

const OPPORTUNITY_TYPES = [
  "Internship", "Scholarship", "Fellowship", "Research", "Summer School",
  "Exchange Program", "Hackathon", "Competition", "Remote Job", "Graduate Program",
];

const FIELD_OPTIONS = [
  "Software Engineering", "Data & AI", "Security", "Product & Design",
  "Sales", "Finance & Accounting", "People & Recruiting", "Marketing",
  "Legal & Compliance", "Customer Success", "Other",
];

const initialFilters = {
  search: "", opportunityType: "", country: "", remote: "",
  field: "", funding: "", studyLevel: "", sort: "deadline", page: 1,
};

// WHAT THIS PAGE DEMONSTRATES: every filter change re-fetches from the
// backend instead of filtering an already-downloaded array in the browser.
// WHY: with thousands of opportunities, downloading everything once and
// filtering client-side would mean a slow initial load and a LOT of wasted
// bandwidth for data the user never looks at. Server-side filtering means
// we only ever transfer the one page of results actually being shown.
export default function Discover() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ opportunities: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    opportunityService
      .getOpportunities(filters)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // If the component unmounts (or filters change again) before this
    // request finishes, "cancelled" stops it from overwriting newer state -
    // a common React bug (setting state from a stale, out-of-order request).
    return () => { cancelled = true; };
  }, [filters]);

  function updateFilter(key, value) {
    // Any real filter change resets back to page 1 - staying on page 5 of a
    // narrowed-down search would usually just show an empty page.
    setFilters({ ...filters, [key]: value, page: key === "page" ? value : 1 });
  }

  async function handleSave(opportunityId) {
    if (!user) return;
    setSavingId(opportunityId);
    try {
      await applicationService.saveOpportunity(opportunityId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const { opportunities, pagination } = data;

  return (
    <div className="page">
      <div className="container">
        <h1>Discover Opportunities</h1>

        <div className="card mb-lg">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            <input
              placeholder="Search title or description…"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              style={{ gridColumn: "1 / -1" }}
            />
            <select value={filters.opportunityType} onChange={(e) => updateFilter("opportunityType", e.target.value)}>
              <option value="">All types</option>
              {OPPORTUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Country (e.g. Kenya, Canada, Remote)" value={filters.country} onChange={(e) => updateFilter("country", e.target.value)} />            <select value={filters.remote} onChange={(e) => updateFilter("remote", e.target.value)}>
              <option value="">Remote or not</option>
              <option value="true">Remote only</option>
              <option value="false">On-site only</option>
            </select>
            <select value={filters.field} onChange={(e) => updateFilter("field", e.target.value)}>
            <option value="">All fields</option>
            {FIELD_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={filters.studyLevel} onChange={(e) => updateFilter("studyLevel", e.target.value)}>
              <option value="">Any study level</option>
              <option>Undergraduate</option>
              <option>Graduate</option>
              <option>PhD</option>
            </select>
            <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
              <option value="deadline">Closing soon</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <ErrorBanner message={error} />

        {loading && <Loading label="Loading opportunities…" />}

        {!loading && opportunities.length === 0 && (
          <EmptyState label="No opportunities match your filters. Try broadening your search." />
        )}

        {!loading && opportunities.length > 0 && (
          <>
            <div className="grid">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp._id} opportunity={opp} onSave={user ? handleSave : undefined} saving={savingId === opp._id} />
              ))}
            </div>

            <div className="flex-between mt-lg">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter("page", pagination.page - 1)}
              >
                ← Previous
              </button>
              <span className="muted">
                Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total)
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilter("page", pagination.page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
