import apiRequest from "./api";

export function register(userData) {
  return apiRequest("/auth/register", { method: "POST", body: userData, auth: false });
}

export function login(email, password) {
  return apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false });
}

export function getMe() {
  return apiRequest("/auth/me");
}

export function updateProfile(profileData) {
  return apiRequest("/auth/profile", { method: "PATCH", body: profileData });
}

export function changePassword(currentPassword, newPassword) {
  return apiRequest("/auth/password", { method: "PATCH", body: { currentPassword, newPassword } });
}
