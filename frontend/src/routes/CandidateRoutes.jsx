import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const CandidateLayout = React.lazy(() => import("../portals/candidate/CandidateLayout"));
const JobsPage = React.lazy(() => import("../portals/candidate/pages/JobsPage"));
const JobDetailPage = React.lazy(() => import("../portals/candidate/pages/JobDetailPage"));
const ApplyPage = React.lazy(() => import("../portals/candidate/pages/ApplyPage"));
const ApplicationsPage = React.lazy(() => import("../portals/candidate/pages/ApplicationsPage"));
const InterviewsPage = React.lazy(() => import("../portals/candidate/pages/InterviewsPage"));
const OffersPage = React.lazy(() => import("../portals/candidate/pages/OffersPage"));
const ProfilePage = React.lazy(() => import("../portals/candidate/pages/ProfilePage"));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function CandidateRoutes() {
  return (
    <ProtectedRoute requiredRole="candidate">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<CandidateLayout />}>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:jobId" element={<JobDetailPage />} />
            <Route path="jobs/:jobId/apply" element={<ApplyPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="interviews" element={<InterviewsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="jobs" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

