import React, { createContext, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Building2, Users, BriefcaseBusiness, UserCheck, Settings } from "lucide-react";
import { PortalLayout } from "../shared/components/layout/PortalLayout";
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header } from "../shared/components/layout/Header";
import { Breadcrumb } from "../shared/components/layout/Breadcrumb";
import { ToastContainer } from "../shared/components/ui/Toast";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../shared/hooks/useToast";
import { useCompanyData } from "./hooks/useCompanyData";

const NAV = [
  { id: "dashboard",  label: "Dashboard",          icon: Building2 },
  { id: "employees",  label: "Employees & Team",   icon: Users },
  { id: "jobs",       label: "Job Management",      icon: BriefcaseBusiness },
  { id: "candidates", label: "Candidate Pipeline",  icon: UserCheck },
  { id: "settings",   label: "Company Settings",    icon: Settings }
];

const ROUTE_MAP = {
  dashboard:  "/company/dashboard",
  employees:  "/company/employees",
  jobs:       "/company/jobs",
  candidates: "/company/candidates",
  settings:   "/company/settings"
};

export const CompanyDataContext = createContext(null);
export function useCompanyContext() { return useContext(CompanyDataContext); }

export default function CompanyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const companyData = useCompanyData();

  const getActivePage = () => {
    const p = location.pathname;
    if (p.startsWith("/company/employees"))  return "employees";
    if (p.startsWith("/company/jobs"))       return "jobs";
    if (p.startsWith("/company/candidates")) return "candidates";
    if (p.startsWith("/company/settings"))   return "settings";
    return "dashboard";
  };

  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === "/company/dashboard") return [];
    if (p.startsWith("/company/employees"))  return [{ label: "Employees & Team" }];
    if (p.startsWith("/company/jobs"))       return [{ label: "Job Management" }];
    if (p.startsWith("/company/candidates")) return [{ label: "Candidate Pipeline" }];
    if (p.startsWith("/company/settings"))   return [{ label: "Company Settings" }];
    return [];
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith("/company/employees"))  return "Employees & Team";
    if (p.startsWith("/company/jobs"))       return "Job Management";
    if (p.startsWith("/company/candidates")) return "Candidate Pipeline";
    if (p.startsWith("/company/settings"))   return "Company Settings";
    return "Dashboard";
  };

  const orgName = companyData.org?.companyDisplayName || companyData.org?.name || auth?.user?.name || "Company";
  const orgTagline = companyData.org?.tagline || companyData.org?.settings?.tagline || "Company Admin";

  return (
    <CompanyDataContext.Provider value={{ ...companyData, addToast }}>
      <PortalLayout
        sidebar={
          <Sidebar
            navItems={NAV}
            activePage={getActivePage()}
            onNavigate={(id) => navigate(ROUTE_MAP[id])}
            user={auth?.user}
            onLogout={logout}
            brandName={orgName}
            brandTagline={orgTagline}
          />
        }
        header={
          <Header
            pageTitle={getPageTitle()}
            portalLabel="Company Portal"
          />
        }
        breadcrumb={<Breadcrumb items={getBreadcrumbs()} homeHref="/company/dashboard" />}
      >
        <Outlet />
      </PortalLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </CompanyDataContext.Provider>
  );
}
