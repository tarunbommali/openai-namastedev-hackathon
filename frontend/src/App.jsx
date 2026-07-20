import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { api, loadAuth, saveAuth } from "./api";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import CandidateAuthPage from "./pages/CandidateAuthPage";

//auth routes
import AccessTypePage from "./pages/AccessTypePage";
import WorkLoginPage from "./pages/WorkLoginPage";
import CandidateLoginPage from "./pages/CandidateLoginPage";

// Portals
import CandidatePortal from "./portals/CandidatePortal";
import RecruiterPortal from "./portals/RecruiterPortal";
import InterviewerPortal from "./portals/InterviewerPortal";

// ─── Role → Portal mapping ────────────────────────────────────────────────────
// company_admin / admin / recruiter → RecruiterPortal (shows admin view when role=company_admin)
// interviewer                       → InterviewerPortal
// developer / candidate             → CandidatePortal

function resolvePortal(role, auth, onLogout) {
  if (role === "company_admin" || role === "admin" || role === "recruiter") {
    return <RecruiterPortal auth={auth} onLogout={onLogout} />;
  }
  if (role === "interviewer") {
    return <InterviewerPortal auth={auth} onLogout={onLogout} />;
  }
  if (role === "developer" || role === "candidate") {
    return <CandidatePortal auth={auth} onLogout={onLogout} />;
  }
  return (
    <main className="min-h-screen flex items-center justify-center text-slate-600 text-sm">
      Unknown role: {role} —{" "}
      <button onClick={onLogout} className="ml-2 underline text-rose-600">
        Sign out
      </button>
    </main>
  );
}

// ─── Inner app (needs router context for useNavigate) ─────────────────────────
function AppInner() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api("/api/health")
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  // ── Standard login ──────────────────────────────────────────────────────────
  async function handleAuth({ mode, email, password }) {
    setLoading(true);
    setError("");
    try {
      if (mode === "forgot") {
        const data = await api("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email })
        });
        setError("");
        return data.message;
      }
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const next = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      saveAuth(next);
      setAuth(next);
      setApiOnline(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Company registration (creates org + company_admin) ──────────────────────
  async function handleRegisterCompany({ companyName, email, domain, industry, size, country, password }) {
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/register/company", {
        method: "POST",
        body: JSON.stringify({ companyName, email, domain, industry, size, country, password })
      });
      const next = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      saveAuth(next);
      setAuth(next);
      setApiOnline(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Developer registration ──────────────────────────────────────────────────
  async function handleRegisterDeveloper({ name, email, password }) {
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/register/developer", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      const next = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      saveAuth(next);
      setAuth(next);
      setApiOnline(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await api(
        "/api/auth/logout",
        { method: "POST", body: JSON.stringify({ refreshToken: auth?.refreshToken }) },
        auth?.accessToken
      );
    } catch {
      /* ignore */
    }
    saveAuth(null);
    setAuth(null);
    navigate("/");
  }

  // ── Authenticated — show the correct portal ─────────────────────────────────
  if (auth?.user) {
    return resolvePortal(auth.user.role, auth, handleLogout);
  }

  // ── Public route tree ───────────────────────────────────────────────────────
  return (
    <Routes>
      {/* Landing */}
      <Route
        path="/"
        element={
          <LandingPage
            onNavigateAuth={(m, r) =>
              navigate(r === "candidate" || r === "developer"
                ? "/candidate/login"
                : m === "register"
                  ? "/work/login?mode=register"
                  : "/work/login")
            }
            apiOnline={apiOnline}
          />
        }
      />

      {/* ─── Primary auth routes ─── */}
      <Route
        path="/access-type"
        element={<AccessTypePage apiOnline={apiOnline} />}
      />
      <Route
        path="/work/login"
        element={
          <WorkLoginPage
            onAuth={handleAuth}
            onRegisterCompany={handleRegisterCompany}
            loading={loading}
            error={error}
            apiOnline={apiOnline}
          />
        }
      />
      <Route
        path="/candidate/login"
        element={
          <CandidateLoginPage
            onAuth={handleAuth}
            onRegisterDeveloper={handleRegisterDeveloper}
            loading={loading}
            error={error}
          />
        }
      />

      {/* ─── Legacy routes kept for backward compat ─── */}
      <Route
        path="/auth"
        element={
          <AuthPage
            onAuth={handleAuth}
            loading={loading}
            error={error}
            apiOnline={apiOnline}
            initialConfig={{ mode: "login", role: "recruiter" }}
            onSwitchToCandidateAuth={() => navigate("/candidate/login")}
          />
        }
      />
      <Route
        path="/auth/candidate"
        element={
          <CandidateAuthPage
            onAuth={handleAuth}
            loading={loading}
            error={error}
            onBackToB2B={() => navigate("/work/login")}
          />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
