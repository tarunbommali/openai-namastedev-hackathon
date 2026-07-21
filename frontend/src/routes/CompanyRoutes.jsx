import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const CompanyLayout = React.lazy(() => import("../portals/company/CompanyLayout"));
const DashboardPage = React.lazy(() => import("../portals/company/pages/DashboardPage"));
const EmployeesPage = React.lazy(() => import("../portals/company/pages/EmployeesPage"));
const JobsPage = React.lazy(() => import("../portals/company/pages/JobsPage"));
const CandidatesPage = React.lazy(() => import("../portals/company/pages/CandidatesPage"));
const SettingsPage = React.lazy(() => import("../portals/company/pages/SettingsPage"));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function CompanyRoutes() {
  return (
    <ProtectedRoute requiredRole={["company_admin", "admin"]}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<CompanyLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="employees"  element={<EmployeesPage />} />
            <Route path="jobs"       element={<JobsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="settings"   element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

