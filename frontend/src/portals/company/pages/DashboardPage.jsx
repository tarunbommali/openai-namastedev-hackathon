import React from "react";
import { Users, BriefcaseBusiness, UserCheck, TrendingUp } from "lucide-react";
import { useCompanyContext } from "../CompanyLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function StatCard({ icon: Icon, label, value, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { members, jobs, candidates, org, loading } = useCompanyContext();
  if (loading) return <PageLoadingSpinner />;

  const recruiters = members.filter((m) => m.role === "recruiter");
  const interviewers = members.filter((m) => m.role === "interviewer");
  const activeJobs = jobs.filter((j) => j.isActive !== false);

  return (
    <div className="space-y-8">
      {/* Company Info Banner */}
      {org && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Company Admin Dashboard</p>
            <h2 className="text-2xl font-bold mt-1">{org.companyDisplayName || org.name}</h2>
            {org.tagline && <p className="text-indigo-200 text-sm mt-0.5">{org.tagline}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-200">Plan</p>
            <p className="text-xl font-bold uppercase">{org.plan || "Trial"}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${org.status === "active" ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
              {org.status}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Team Members" value={members.length} color="indigo" />
        <StatCard icon={BriefcaseBusiness} label="Active Jobs" value={activeJobs.length} color="emerald" />
        <StatCard icon={UserCheck} label="Candidates in Pipeline" value={candidates.length} color="amber" />
        <StatCard icon={TrendingUp} label="Recruiters" value={recruiters.length} color="rose" />
      </div>

      {/* Team Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Hiring Team</h3>
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No team members yet. Invite recruiters and interviewers.</p>
            ) : (
              members.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {m.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-500">{m.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${m.role === "recruiter" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                    {m.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Jobs</h3>
          <div className="space-y-2">
            {activeJobs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active jobs. Create your first job posting.</p>
            ) : (
              activeJobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{j.title}</p>
                    <p className="text-[11px] text-slate-500">{j.location || "—"} · {j.team || "—"}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
