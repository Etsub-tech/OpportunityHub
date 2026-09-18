import { useEffect, useState } from "react";
import * as opportunityService from "../../services/opportunityService";
import * as adminService from "../../services/adminService";
import { Loading, ErrorBanner } from "../../components/StatusStates";

const OPPORTUNITY_TYPES = [
  "Internship", "Scholarship", "Fellowship", "Research", "Summer School",
  "Exchange Program", "Hackathon", "Competition", "Remote Job", "Graduate Program",
];

const emptyForm = {
  title: "", organization: "", description: "", opportunityType: "Internship",
  country: "", applicationUrl: "", deadline: "", funding: "Unknown",
};

export default function ManageOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  function loadOpportunities() {
    // limit=50 here so an admin can see a reasonably full list at once -
    // for a huge catalog this page would need its own pagination controls too.
    opportunityService
      .getOpportunities({ limit: 50, sort: "newest" })
      .then((data) => setOpportunities(data.opportunities))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadOpportunities(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await adminService.updateOpportunity(editingId, form);
      } else {
        await adminService.createOpportunity(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadOpportunities();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(opp) {
    setEditingId(opp._id);
    setForm({
      title: opp.title, organization: opp.organization, description: opp.description,
      opportunityType: opp.opportunityType, country: opp.country || "",
      applicationUrl: opp.applicationUrl, deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
      funding: opp.funding,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this opportunity permanently?")) return;
    try {
      await adminService.deleteOpportunity(id);
      loadOpportunities();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem" }}>
        <form className="card stack" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit opportunity" : "Create opportunity"}</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required />
          <select value={form.opportunityType} onChange={(e) => setForm({ ...form, opportunityType: e.target.value })}>
            {OPPORTUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <input placeholder="Application URL" value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} required />
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <select value={form.funding} onChange={(e) => setForm({ ...form, funding: e.target.value })}>
            <option>Unknown</option><option>Fully Funded</option><option>Partially Funded</option><option>Paid</option><option>Unfunded</option>
          </select>
          <div className="flex gap-sm">
            <button className="btn btn-primary">{editingId ? "Save changes" : "Create"}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
          <ErrorBanner message={error} />
        </form>

        <div className="stack">
          <h3>All opportunities</h3>
          {loading ? <Loading /> : opportunities.map((opp) => (
            <div key={opp._id} className="card flex-between">
              <div>
                <strong>{opp.title}</strong>
                <div className="muted">{opp.organization} · {opp.opportunityType} · {opp.source}</div>
              </div>
              <div className="flex gap-sm">
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(opp)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(opp._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
