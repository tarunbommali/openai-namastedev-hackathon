import React, { createContext, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ClipboardCheck, CalendarCheck } from "lucide-react";
import { PortalLayout } from "../shared/components/layout/PortalLayout";
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header } from "../shared/components/layout/Header";
import { Breadcrumb } from "../shared/components/layout/Breadcrumb";
import { ToastContainer } from "../shared/components/ui/Toast";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../shared/hooks/useToast";
import { useInterviewerData } from "./hooks/useInterviewerData";

const NAV = [
  { id: "eval",  label: "Live Evaluation Workspace", icon: ClipboardCheck },
  { id: "today", label: "Assigned Interviews",       icon: CalendarCheck }
];

const ROUTE_MAP = { eval: "/interviewer/evaluation", today: "/interviewer/interviews" };

export const InterviewerDataContext = createContext(null);
export function useInterviewerContext() { return useContext(InterviewerDataContext); }

export default function InterviewerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const interviewerData = useInterviewerData();

  const getActivePage = () => location.pathname.startsWith("/interviewer/interviews") ? "today" : "eval";
  const activePage = getActivePage();
  const PAGE_LABELS = { eval: "Live Evaluation Workspace", today: "Assigned Interviews" };

  return (
    <InterviewerDataContext.Provider value={{ ...interviewerData, addToast }}>
      <PortalLayout
        sidebar={
          <Sidebar
            navItems={NAV}
            activePage={activePage}
            onNavigate={(id) => navigate(ROUTE_MAP[id])}
            user={auth?.user}
            onLogout={logout}
            brandName={auth?.user?.name || "Interviewer"}
            brandTagline={auth?.user?.whoami || "Technical Interviewer"}
          />
        }
        header={<Header pageTitle={PAGE_LABELS[activePage]} portalLabel="Interviewer Portal" />}
        breadcrumb={<Breadcrumb items={[{ label: PAGE_LABELS[activePage] }]} homeHref="/interviewer/evaluation" />}
      >
        <Outlet />
      </PortalLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </InterviewerDataContext.Provider>
  );
}
