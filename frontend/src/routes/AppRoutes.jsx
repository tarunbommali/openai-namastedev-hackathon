import React, { Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { ROUTES, ROLE_PATHS } from "../constants/routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { api } from "../services/api";

// Public Pages
import LandingPage from "../pages/LandingPage";
import AccessTypePage from "../pages/AccessTypePage";
import WorkLoginPage from "../pages/WorkLoginPage";
import CandidateLoginPage from "../pages/CandidateLoginPage";
import TermsPage from "../pages/TermsPage";
import PrivacyPage from "../pages/PrivacyPage";

// Portal route trees (lazy via sub-route files)
import CandidateRoutes from "./CandidateRoutes";
import CompanyRoutes from "./CompanyRoutes";
import RecruiterRoutes from "./RecruiterRoutes";
import InterviewerRoutes from "./InterviewerRoutes";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export const AppRoutes = () => {
  const {
    isAuthenticated,
    user,
    isInitialized,
    login,
    forgotPassword,
    registerCompany,
    registerCandidate
  } = useAuth();
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    api("/api/health")
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  if (!isInitialized) return <LoadingScreen />;

  // ── Authenticated: expose portal subtrees, redirect any unknown path ──
  if (isAuthenticated && user) {
    const redirectPath = ROLE_PATHS[user.role] || "/";
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/candidate/*"   element={<CandidateRoutes />} />
          <Route path="/company/*"     element={<CompanyRoutes />} />
          <Route path="/recruiter/*"   element={<RecruiterRoutes />} />
          <Route path="/interviewer/*" element={<InterviewerRoutes />} />
          <Route path="*" element={<Navigate to={redirectPath} replace />} />
        </Routes>
      </Suspense>
    );
  }

  // ── Public routes ─────────────────────────────────────────────────────
  return (
    <Routes>
      <Route path={ROUTES.HOME}           element={<LandingPage onNavigateAuth={(m, r) => window.location.href = r === "candidate" ? "/candidate/login" : "/work/login"} apiOnline={apiOnline} />} />
      <Route path={ROUTES.ACCESS_TYPE}    element={<AccessTypePage apiOnline={apiOnline} />} />
      <Route path={ROUTES.WORK_LOGIN}     element={<WorkLoginPage onAuth={async ({ mode, email, password }) => {
        if (mode === "forgot") return forgotPassword(email);
        return login(email, password);
      }} onRegisterCompany={async (data) => {
        return registerCompany(data);
      }} loading={false} error="" apiOnline={apiOnline} />} />
      <Route path={ROUTES.CANDIDATE_LOGIN} element={<CandidateLoginPage onAuth={async ({ email, password }) => {
        return login(email, password);
      }} onRegisterCandidate={async (data) => {
        return registerCandidate(data);
      }} loading={false} error="" apiOnline={apiOnline} />} />
      <Route path={ROUTES.TERMS}          element={<TermsPage />} />
      <Route path={ROUTES.PRIVACY}        element={<PrivacyPage />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};


