import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/StatusStates";

const initialForm = {
  name: "",
  email: "",
  password: "",
  country: "",
  university: "",
  degree: "",
  fieldOfStudy: "",
  studyLevel: "Undergraduate",
  currentYear: "",
  expectedGraduationYear: "",
  skills: "", // comma-separated in the form, split into an array on submit
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({
        ...form,
        currentYear: form.currentYear ? Number(form.currentYear) : undefined,
        expectedGraduationYear: form.expectedGraduationYear ? Number(form.expectedGraduationYear) : undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      navigate("/dashboard");
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
          <h2>Create your profile</h2>
          <p className="muted mb-lg">This helps us match you with opportunities you're actually eligible for.</p>

          <div className="form-group">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input name="country" value={form.country} onChange={handleChange} placeholder="e.g. Ethiopia" />
          </div>
          <div className="form-group">
            <label>University</label>
            <input name="university" value={form.university} onChange={handleChange} placeholder="e.g. Addis Ababa University" />
          </div>
          <div className="form-group">
            <label>Degree</label>
            <input name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. Software Engineering" />
          </div>
          <div className="form-group">
            <label>Field of study</label>
            <input name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} placeholder="e.g. Computer Science" />
          </div>
          <div className="form-group">
            <label>Study level</label>
            <select name="studyLevel" value={form.studyLevel} onChange={handleChange}>
              <option>Undergraduate</option>
              <option>Graduate</option>
              <option>PhD</option>
            </select>
          </div>
          <div className="form-group">
            <label>Current year</label>
            <input type="number" name="currentYear" value={form.currentYear} onChange={handleChange} min={1} max={8} />
          </div>
          <div className="form-group">
            <label>Expected graduation year</label>
            <input type="number" name="expectedGraduationYear" value={form.expectedGraduationYear} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js" />
            <div className="field-hint">Comma-separated.</div>
          </div>

          <ErrorBanner message={error} />

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <p className="muted center-text mt-lg">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
