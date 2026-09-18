import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

// WHAT: holds the current logged-in user (or null) and exposes login/
//       register/logout functions, available to any component via useAuth().
// WHY:  many different pages need to know "who is logged in" - Navbar,
//       Dashboard, Profile, ProtectedRoute. Passing that down as props
//       through every layer would be tedious ("prop drilling"). React
//       Context solves exactly this one problem, which is why we use it
//       instead of installing Redux for a single piece of global state.
// HOW:  on first load, if a token is saved in localStorage, we ask the
//       backend GET /api/auth/me to confirm it's still valid and fetch the
//       user - this is what keeps someone logged in after closing the tab.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing token on first load

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token is invalid or expired - clear it so we don't keep retrying.
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  async function register(userData) {
    const data = await authService.register(userData);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  // With JWT there's no server-side session to end - "logging out" is just
  // deleting the token the browser was holding. See Stage 1 README note.
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  async function refreshUser() {
    const data = await authService.getMe();
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
