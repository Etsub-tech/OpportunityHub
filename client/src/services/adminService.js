import apiRequest from "./api";

export function getStats() {
  return apiRequest("/admin/stats");
}

export function createOpportunity(data) {
  return apiRequest("/admin/opportunities", { method: "POST", body: data });
}

export function updateOpportunity(id, data) {
  return apiRequest(`/admin/opportunities/${id}`, { method: "PATCH", body: data });
}

export function deleteOpportunity(id) {
  return apiRequest(`/admin/opportunities/${id}`, { method: "DELETE" });
}

export function getAllSubmissions() {
  return apiRequest("/admin/submissions");
}

export function reviewSubmission(id, action, rejectionReason) {
  return apiRequest(`/admin/submissions/${id}`, { method: "PATCH", body: { action, rejectionReason } });
}

export function triggerIngestion() {
  return apiRequest("/admin/ingest/run", { method: "POST" });
}
