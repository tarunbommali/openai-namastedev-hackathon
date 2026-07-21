import React from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CheckCircle2, ChevronRight } from "lucide-react";
import { useCandidateContext } from "../CandidateLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

const STAGES = [
  { id: "Applied", label: "Applied" },
  { id: "Screened", label: "Screened" },
  { id: "Interview Scheduled", label: "Interview Scheduled" },
  { id: "Decision", label: "Decision" },
  { id: "Offer", label: "Offer" }
];

function getStageIndex(status = "") {
  const s = status.toLowerCase();
  if (s.includes("offer")) return 4;
  if (s.includes("decid") || s.includes("reject") || s.includes("select")) return 3;
  if (s.includes("interview") || s.includes("sched")) return 2;
  if (s.includes("screen") || s.includes("shortlist")) return 1;
  return 0;
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { applications, loading } = useCandidateContext();

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      {applications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Applications Submitted Yet</p>
          <p className="text-xs text-slate-500">Explore open roles on the Jobs tab to submit your first application.</p>
          <button onClick={() => navigate("/candidate/jobs")} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Browse Jobs <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        applications.map((app) => {
          const stageIdx = getStageIndex(app.status);
          return (
            <div key={app.publicId || app.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">Job Reference: {app.jobId}</span>
                  <h3 className="text-lg font-bold text-slate-900">Application #{app.publicId || app.id}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    AI Match: <strong className="text-slate-900 font-mono">{app.matchScore || app.resumeScore || "—"}%</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {app.status || "Applied"}
                  </span>
                </div>
              </div>

              {/* Stage timeline */}
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map((st, i) => {
                  const isPast = i <= stageIdx;
                  const isCurrent = i === stageIdx;
                  return (
                    <div key={st.id} className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isCurrent ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md" : isPast ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-xs font-semibold ${isPast ? "text-slate-900" : "text-slate-400"}`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
