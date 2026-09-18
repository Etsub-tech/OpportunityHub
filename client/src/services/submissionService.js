import apiRequest from "./api";

export function submitOpportunity(submissionData) {
  return apiRequest("/submissions", { method: "POST", body: submissionData });
}

export function getMySubmissions() {
  return apiRequest("/submissions/mine");
}
