export function Loading({ label = "Loading…" }) {
  return <div className="loading-state">{label}</div>;
}

export function EmptyState({ label }) {
  return <div className="empty-state">{label}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="form-error">{message}</div>;
}
