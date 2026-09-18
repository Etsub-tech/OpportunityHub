import apiRequest from "./api";

// filters is a plain object like { search, opportunityType, country, page, ... }
// We drop any empty/undefined values so the query string stays clean
// (e.g. no "?country=&remote=" cluttering the URL and the Express req.query).
export function getOpportunities(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  return apiRequest(`/opportunities?${params.toString()}`, { auth: false });
}

export function getOpportunityById(id) {
  return apiRequest(`/opportunities/${id}`, { auth: false });
}

// Requires login - the backend returns 401 if there's no token, which the
// calling component treats as "just don't show a match section".
export function getMatch(id) {
  return apiRequest(`/opportunities/${id}/match`);
}
