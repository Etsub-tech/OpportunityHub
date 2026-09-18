import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// WHAT: wraps a page and only renders it if the user is logged in
//       (and, if adminOnly is passed, only if they're an admin).
// WHY:  without this, someone could type /dashboard into the address bar
//       while logged out and see a broken page. This is the FRONTEND half
//       of protection - it's a UX nicety, not real security. The REAL
//       security is the backend's `protect`/`requireAdmin` middleware,
//       which still rejects the request even if someone bypassed this.
// HOW:  reads user from AuthContext; while the initial "am I logged in?"
//       check is still running (loading), we show nothing rather than
//       flashing a redirect that then reverses itself.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}
