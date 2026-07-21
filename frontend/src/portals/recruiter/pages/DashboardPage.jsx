import React from "react";
import { Sparkles, BriefcaseBusiness, Users, CalendarCheck } from "lucide-react";
import { useRecruiterContext } from "../RecruiterLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function StatCard({ label, value, color = "slate" }) {
  const palette = {
    slate: "text-slate-900",
    indigo: "text-indigo-600",
    teal: "text-teal-600",
    amber: "text-amber-600"
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={`text-3xl font-bold font-mono ${palette[color]}`}>{value ?? "—"}</div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  const { dash, loading } = useRecruiterContext();
  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Open Roles"        value={dash?.openJobs}          color="slate" />
        <StatCard label="Candidates Ranked" value={dash?.totalCandidates}   color="indigo" />
        <StatCard label="Applications"      value={dash?.applications}      color="slate" />
        <StatCard label="Interviews Today"  value={dash?.interviewsToday}   color="teal" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>CrewAI 7-Agent Activity Stream</span>
        </div>
        <div className="space-y-2">
          {(dash?.aiActivity || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No AI activity recorded yet. Run a screening batch to populate this stream.</p>
          ) : (
            (dash?.aiActivity || []).map((a, i) => (
              <div key={a.executionId || i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">Execution #{a.executionId}</span>
                <span className="text-indigo-600 font-medium">{(a.agents || []).join(" → ") || a.status}</span>
                <span className="text-slate-400">{a.timestamp || ""}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
