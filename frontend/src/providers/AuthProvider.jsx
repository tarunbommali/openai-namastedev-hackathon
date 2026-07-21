import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, loadAuth, saveAuth, clearAuth } from "../services/api";
import { ROLE_PATHS } from "../constants/routes";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => loadAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Validate existing session on mount
  useEffect(() => {
    const validateSession = async () => {
      if (auth?.accessToken) {
        try {
          await api("/api/auth/validate", {}, auth.accessToken);
        } catch {
          clearAuth();
          setAuth(null);
        }
      }
      setIsInitialized(true);
    };
    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const authData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      };
      saveAuth(authData);
      setAuth(authData);
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: auth?.refreshToken })
      }, auth?.accessToken);
    } catch { /* ignore */ }
    clearAuth();
    setAuth(null);
  }, [auth]);

  const registerCompany = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/api/auth/register/company", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      const authData = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      saveAuth(authData);
      setAuth(authData);
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerCandidate = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const name = `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
        (formData.email || "").split("@")[0];
      const data = await api("/api/auth/register/developer", {
        method: "POST",
        body: JSON.stringify({ ...formData, name })
      });
      const authData = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      saveAuth(authData);
      setAuth(authData);
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() })
      });
      return data.message;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRedirectPath = useCallback((role) => {
    return ROLE_PATHS[role] || "/";
  }, []);

  const value = {
    auth,
    user: auth?.user,
    token: auth?.accessToken,
    isAuthenticated: !!auth?.accessToken,
    loading,
    error,
    isInitialized,
    login,
    logout,
    registerCompany,
    registerCandidate,
    forgotPassword,
    getRedirectPath,
    clearError: () => setError(null),
    // Legacy compat
    setAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
