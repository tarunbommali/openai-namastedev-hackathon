import React, { createContext, useContext, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness, CalendarCheck, CheckCircle2, UserRound, Award, Sparkles
} from "lucide-react";
import { PortalLayout } from "../shared/components/layout/PortalLayout";
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header } from "../shared/components/layout/Header";
import { Breadcrumb } from "../shared/components/layout/Breadcrumb";
import { ToastContainer } from "../shared/components/ui/Toast";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../shared/hooks/useToast";
import { useCandidateData } from "./hooks/useCandidateData";

const NAV = [
  { id: "jobs",         label: "Jobs",         icon: BriefcaseBusiness },
  { id: "applications", label: "Applications", icon: CheckCircle2 },
  { id: "interviews",   label: "Interviews",   icon: CalendarCheck },
  { id: "offers",       label: "Offers",       icon: Award },
  { id: "profile",      label: "Profile",      icon: UserRound }
];

const ROUTE_MAP = {
  jobs:         "/candidate/jobs",
  applications: "/candidate/applications",
  interviews:   "/candidate/interviews",
  offers:       "/candidate/offers",
  profile:      "/candidate/profile"
};

// Context to share portal data with child pages
export const CandidateDataContext = createContext(null);
export function useCandidateContext() { return useContext(CandidateDataContext); }

export default function CandidateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [filters, setFilters] = useState({ q: "", skill: "", location: "" });
  const candidateData = useCandidateData(filters);

  // Derive active nav item from pathname
  const getActivePage = () => {
    const p = location.pathname;
    if (p.startsWith("/candidate/applications")) return "applications";
    if (p.startsWith("/candidate/interviews"))   return "interviews";
    if (p.startsWith("/candidate/offers"))       return "offers";
    if (p.startsWith("/candidate/profile"))      return "profile";
    return "jobs";
  };

  // Derive breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const p = location.pathname;
    const crumbs = [];
    if (p === "/candidate/jobs" || p === "/candidate") return crumbs;
    if (p.startsWith("/candidate/jobs/")) {
      crumbs.push({ label: "Jobs", path: "/candidate/jobs" });
      if (p.includes("/apply")) {
        const jobId = p.split("/")[3];
        crumbs.push({ label: "Job Details", path: `/candidate/jobs/${jobId}` });
        crumbs.push({ label: "Application Form" });
      } else {
        crumbs.push({ label: "Job Details" });
      }
    } else if (p.startsWith("/candidate/applications")) crumbs.push({ label: "My Applications" });
    else if (p.startsWith("/candidate/interviews"))   crumbs.push({ label: "Interviews" });
    else if (p.startsWith("/candidate/offers"))       crumbs.push({ label: "Job Offers" });
    else if (p.startsWith("/candidate/profile"))      crumbs.push({ label: "My Profile" });
    return crumbs;
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/candidate/jobs" || p === "/candidate") return "Browse Jobs";
    if (p.includes("/apply"))          return "Apply for Job";
    if (p.startsWith("/candidate/jobs/")) return "Job Details";
    if (p.startsWith("/candidate/applications")) return "My Applications";
    if (p.startsWith("/candidate/interviews"))   return "My Interviews";
    if (p.startsWith("/candidate/offers"))       return "My Offers";
    if (p.startsWith("/candidate/profile"))      return "My Profile";
    return "Candidate Portal";
  };

  const whoami = candidateData.profile?.whoami || auth?.user?.role || "Candidate";

  return (
    <CandidateDataContext.Provider value={{ ...candidateData, filters, setFilters, addToast }}>
      <PortalLayout
        sidebar={
          <Sidebar
            navItems={NAV}
            activePage={getActivePage()}
            onNavigate={(id) => navigate(ROUTE_MAP[id])}
            user={auth?.user}
            onLogout={logout}
            brandName={auth?.user?.name || "Candidate"}
            brandTagline={whoami}
          />
        }
        header={
          <Header
            pageTitle={getPageTitle()}
            portalLabel="Candidate Portal"
            headerActions={
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Matching
              </span>
            }
          />
        }
        breadcrumb={<Breadcrumb items={getBreadcrumbs()} homeHref="/candidate/jobs" />}
      >
        <Outlet />
      </PortalLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </CandidateDataContext.Provider>
  );
}
