import { useState } from "react";
import * as submissionService from "../services/submissionService";
import { ErrorBanner } from "../components/StatusStates";

const OPPORTUNITY_TYPES = [
  "Internship", "Scholarship", "Fellowship", "Research", "Summer School",
  "Exchange Program", "Hackathon", "Competition", "Remote Job", "Graduate Program",
];

export default function SubmitOpportunity() {
  const [form, setForm] = useState({
    title: "", organization: "", opportunityType: "Internship",
    applicationUrl: "", description: "", country: "", deadline: "", notes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submissionService.submitOpportunity(form);
      setMessage("Thanks! Your submission is pending admin review.");
      setForm({ title: "", organization: "", opportunityType: "Internship", applicationUrl: "", description: "", country: "", deadline: "", notes: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Submit an Opportunity</h2>
          <p className="muted mb-lg">
            Found something we're missing? Submit it here — an admin will review it before it goes live.
          </p>

          <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label>Organization</label><input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required /></div>
          <div className="form-group">
            <label>Type</label>
            <select value={form.opportunityType} onChange={(e) => setForm({ ...form, opportunityType: e.target.value })}>
              {OPPORTUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Application URL</label><input type="url" value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="form-group"><label>Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
          <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div className="form-group"><label>Your notes (optional)</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. found this on Twitter" /></div>

          <ErrorBanner message={error} />
          {message && <div className="muted">{message}</div>}

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </div>
    </div>
  );
}
