import React, { createContext, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Gauge, Sliders, Layers, ListChecks, NotebookPen, Mic, UserCheck } from "lucide-react";
import { PortalLayout } from "../shared/components/layout/PortalLayout";
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header } from "../shared/components/layout/Header";
import { Breadcrumb } from "../shared/components/layout/Breadcrumb";
import { ToastContainer } from "../shared/components/ui/Toast";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../shared/hooks/useToast";
import { useRecruiterData } from "./hooks/useRecruiterData";

const NAV = [
  { id: "dashboard", label: "Dashboard",         icon: Gauge },
  { id: "jobs",      label: "Jobs & Weighting",  icon: Sliders },
  { id: "batches",   label: "Screening Batches", icon: Layers },
  { id: "results",   label: "Screening Results", icon: ListChecks },
  { id: "questions", label: "Interview Briefs",  icon: NotebookPen },
  { id: "schedule",  label: "Schedule",          icon: Mic },
  { id: "decide",    label: "Decisions & Offers",icon: UserCheck }
];

const ROUTE_MAP = {
  dashboard: "/recruiter/dashboard",
  jobs:      "/recruiter/jobs",
  batches:   "/recruiter/screening",
  results:   "/recruiter/results",
  questions: "/recruiter/questions",
  schedule:  "/recruiter/schedule",
  decide:    "/recruiter/decisions"
};

export const RecruiterDataContext = createContext(null);
export function useRecruiterContext() { return useContext(RecruiterDataContext); }

export default function RecruiterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const recruiterData = useRecruiterData();

  const getActivePage = () => {
    const p = location.pathname;
    if (p.startsWith("/recruiter/jobs"))       return "jobs";
    if (p.startsWith("/recruiter/screening"))   return "batches";
    if (p.startsWith("/recruiter/results"))     return "results";
    if (p.startsWith("/recruiter/questions"))   return "questions";
    if (p.startsWith("/recruiter/schedule"))    return "schedule";
    if (p.startsWith("/recruiter/decisions"))   return "decide";
    return "dashboard";
  };

  const PAGE_LABELS = {
    dashboard: "Dashboard", jobs: "Jobs & Weighting", batches: "Screening Batches",
    results: "Screening Results", questions: "Interview Briefs", schedule: "Schedule", decide: "Decisions & Offers"
  };
  const activePage = getActivePage();

  return (
    <RecruiterDataContext.Provider value={{ ...recruiterData, addToast }}>
      <PortalLayout
        sidebar={
          <Sidebar
            navItems={NAV}
            activePage={activePage}
            onNavigate={(id) => navigate(ROUTE_MAP[id])}
            user={auth?.user}
            onLogout={logout}
            brandName={auth?.user?.name || "Recruiter"}
            brandTagline={auth?.user?.whoami || "Recruiter Portal"}
          />
        }
        header={<Header pageTitle={PAGE_LABELS[activePage] || "Recruiter"} portalLabel="Recruiter Portal" />}
        breadcrumb={<Breadcrumb items={activePage !== "dashboard" ? [{ label: PAGE_LABELS[activePage] }] : []} homeHref="/recruiter/dashboard" />}
      >
        <Outlet />
      </PortalLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </RecruiterDataContext.Provider>
  );
}
