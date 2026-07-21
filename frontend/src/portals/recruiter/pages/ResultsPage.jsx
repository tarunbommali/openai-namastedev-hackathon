import React from "react";
import { ListChecks, UserCheck } from "lucide-react";
import { useRecruiterContext } from "../RecruiterLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function scoreBadge(score) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ResultsPage() {
  const { candidates, loading } = useRecruiterContext();
  if (loading) return <PageLoadingSpinner />;

  const ranked = [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">{ranked.length} candidate{ranked.length !== 1 ? "s" : ""} screened and ranked by AI</p>

      {ranked.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <ListChecks className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Screening Results Yet</p>
          <p className="text-xs text-slate-500">Run an AI Screening Batch on the Screening Batches tab to rank candidates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Rank", "Candidate", "Match Score", "Status", "Skills", "Location"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ranked.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{c.name?.[0] || "?"}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-bold font-mono border ${scoreBadge(c.matchScore || 0)}`}>
                      {c.matchScore || 0}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {c.status || "Ranked"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.skills || []).slice(0, 3).map((s) => (
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
