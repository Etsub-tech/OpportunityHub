import apiRequest from "./api";

export function saveOpportunity(opportunityId) {
  return apiRequest("/applications", { method: "POST", body: { opportunityId, status: "Saved" } });
}

export function getApplications() {
  return apiRequest("/applications");
}

export function updateApplication(id, updates) {
  return apiRequest(`/applications/${id}`, { method: "PATCH", body: updates });
}

export function deleteApplication(id) {
  return apiRequest(`/applications/${id}`, { method: "DELETE" });
}
