import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const RecruiterLayout = React.lazy(() => import("../portals/recruiter/RecruiterLayout"));
const DashboardPage = React.lazy(() => import("../portals/recruiter/pages/DashboardPage"));
const JobsPage = React.lazy(() => import("../portals/recruiter/pages/JobsPage"));
const ScreeningPage = React.lazy(() => import("../portals/recruiter/pages/ScreeningPage"));
const ResultsPage = React.lazy(() => import("../portals/recruiter/pages/ResultsPage"));
const QuestionsPage = React.lazy(() => import("../portals/recruiter/pages/QuestionsPage"));
const SchedulePage = React.lazy(() => import("../portals/recruiter/pages/SchedulePage"));
const DecisionsPage = React.lazy(() => import("../portals/recruiter/pages/DecisionsPage"));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function RecruiterRoutes() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<RecruiterLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="jobs"       element={<JobsPage />} />
            <Route path="screening"  element={<ScreeningPage />} />
            <Route path="results"    element={<ResultsPage />} />
            <Route path="questions"  element={<QuestionsPage />} />
            <Route path="schedule"   element={<SchedulePage />} />
            <Route path="decisions"  element={<DecisionsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

