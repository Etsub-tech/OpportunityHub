// formatDeadline(deadline)
// WHAT: turns a raw date into a human phrase like "12 days left",
//       "Deadline tomorrow", or "Deadline passed".
// WHY:  a raw ISO date ("2026-10-03T00:00:00Z") doesn't tell a student
//       anything useful at a glance - the urgency is what matters.
// HOW:  simple date-math: subtract "now" from the deadline, convert
//       milliseconds to whole days.
export function formatDeadline(deadline) {
  if (!deadline) return "Rolling / no fixed deadline";

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((deadlineDate - now) / msPerDay);

  if (daysLeft < 0) return "Deadline passed";
  if (daysLeft === 0) return "Deadline today";
  if (daysLeft === 1) return "Deadline tomorrow";
  return `${daysLeft} days left`;
}

export function isExpired(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
