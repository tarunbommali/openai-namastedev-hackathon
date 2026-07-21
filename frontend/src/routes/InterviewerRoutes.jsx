import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const InterviewerLayout = React.lazy(() => import("../portals/interviewer/InterviewerLayout"));
const EvaluationPage = React.lazy(() => import("../portals/interviewer/pages/EvaluationPage"));
const AssignedInterviewsPage = React.lazy(() => import("../portals/interviewer/pages/AssignedInterviewsPage"));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function InterviewerRoutes() {
  return (
    <ProtectedRoute requiredRole="interviewer">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<InterviewerLayout />}>
            <Route index element={<Navigate to="evaluation" replace />} />
            <Route path="evaluation"  element={<EvaluationPage />} />
            <Route path="interviews"  element={<AssignedInterviewsPage />} />
            <Route path="*" element={<Navigate to="evaluation" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

