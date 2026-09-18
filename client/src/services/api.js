const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// WHAT: a thin wrapper around fetch() used by every service file.
// WHY:  without this, every single API call would need to repeat the same
//       three things: attach the Authorization header, parse the JSON
//       response, and turn a non-2xx response into a readable error. That's
//       three lines duplicated across a dozen files - a classic case where
//       ONE small shared function is genuinely worth it (unlike a bigger
//       "API client class" with retries/caching/interceptors, which this
//       app doesn't need).
// HOW:  reads the token from localStorage on every call rather than storing
//       it in a variable, so it always sends the CURRENT token even if the
//       user just logged in or out in another tab.
async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The backend's errorMiddleware always sends { message: "..." } -
    // we just re-throw that message so components can show it directly.
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export default apiRequest;
