import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Discover from "./pages/Discover";
import OpportunityDetails from "./pages/OpportunityDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SavedOpportunities from "./pages/SavedOpportunities";
import ApplicationTracker from "./pages/ApplicationTracker";
import SubmitOpportunity from "./pages/SubmitOpportunity";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageOpportunities from "./pages/admin/ManageOpportunities";
import ReviewSubmissions from "./pages/admin/ReviewSubmissions";

// One line per route - this is the map of the whole app. If you're trying
// to find where a page lives, start here.
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/opportunities/:id" element={<OpportunityDetails />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedOpportunities /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitOpportunity /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/opportunities" element={<ProtectedRoute adminOnly><ManageOpportunities /></ProtectedRoute>} />
        <Route path="/admin/submissions" element={<ProtectedRoute adminOnly><ReviewSubmissions /></ProtectedRoute>} />

        <Route path="*" element={<div className="page container">Page not found.</div>} />
      </Routes>
    </>
  );
}
