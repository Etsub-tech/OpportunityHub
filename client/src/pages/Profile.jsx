import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/authService";
import { ErrorBanner } from "../components/StatusStates";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    country: user.country || "",
    university: user.university || "",
    degree: user.degree || "",
    fieldOfStudy: user.fieldOfStudy || "",
    studyLevel: user.studyLevel || "Undergraduate",
    currentYear: user.currentYear || "",
    expectedGraduationYear: user.expectedGraduationYear || "",
    skills: (user.skills || []).join(", "),
    remotePreference: user.remotePreference || "No preference",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await authService.updateProfile({
        ...form,
        currentYear: form.currentYear ? Number(form.currentYear) : undefined,
        expectedGraduationYear: form.expectedGraduationYear ? Number(form.expectedGraduationYear) : undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      await refreshUser();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage("Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "600px" }}>
        <h1>My Profile</h1>
        <p className="muted mb-lg">
          This information is what the eligibility matching engine compares against opportunity requirements.
        </p>

        <form className="card stack" onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
          <div className="form-group"><label>University</label><input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} /></div>
          <div className="form-group"><label>Degree</label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
          <div className="form-group"><label>Field of study</label><input value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} /></div>
          <div className="form-group">
            <label>Study level</label>
            <select value={form.studyLevel} onChange={(e) => setForm({ ...form, studyLevel: e.target.value })}>
              <option>Undergraduate</option><option>Graduate</option><option>PhD</option>
            </select>
          </div>
          <div className="form-group"><label>Current year</label><input type="number" value={form.currentYear} onChange={(e) => setForm({ ...form, currentYear: e.target.value })} /></div>
          <div className="form-group"><label>Expected graduation year</label><input type="number" value={form.expectedGraduationYear} onChange={(e) => setForm({ ...form, expectedGraduationYear: e.target.value })} /></div>
          <div className="form-group"><label>Skills (comma-separated)</label><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
          <div className="form-group">
            <label>Remote preference</label>
            <select value={form.remotePreference} onChange={(e) => setForm({ ...form, remotePreference: e.target.value })}>
              <option>No preference</option><option>Remote only</option><option>On-site only</option>
            </select>
          </div>

          <ErrorBanner message={error} />
          {message && <div className="muted">{message}</div>}
          <button className="btn btn-primary">Save changes</button>
        </form>

        <h2 className="mt-lg">Change password</h2>
        <form className="card stack" onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
          </div>
          <ErrorBanner message={passwordError} />
          {passwordMessage && <div className="muted">{passwordMessage}</div>}
          <button className="btn btn-secondary">Change password</button>
        </form>
      </div>
    </div>
  );
}
