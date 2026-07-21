import React from "react";
import { UserCheck } from "lucide-react";
import { useCompanyContext } from "../CompanyLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

const STATUS_COLORS = {
  "Applied": "bg-slate-100 text-slate-600",
  "Screening": "bg-amber-50 text-amber-700",
  "Shortlisted": "bg-indigo-50 text-indigo-700",
  "Interview Scheduled": "bg-blue-50 text-blue-700",
  "Under Review": "bg-purple-50 text-purple-700",
  "Selected": "bg-emerald-50 text-emerald-700",
  "Rejected": "bg-rose-50 text-rose-700",
  "Ranked": "bg-slate-100 text-slate-600"
};

export default function CandidatesPage() {
  const { candidates, loading } = useCompanyContext();
  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in pipeline</p>

      {candidates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Candidates in Pipeline</p>
          <p className="text-xs text-slate-500">Candidates appear here after AI-screening is run on applications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Candidate", "Match Score", "Status", "Skills", "Location"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {candidates.map((c) => (
                <tr key={c.id || c.publicId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {c.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-lg font-bold font-mono text-indigo-600">{c.matchScore || 0}%</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"}`}>
                      {c.status || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {(c.skills || c.parsedResume?.skills || []).slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{c.location || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
