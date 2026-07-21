import React, { useState } from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInterviewerContext } from "../InterviewerLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function AssignedInterviewsPage() {
  const navigate = useNavigate();
  const { interviews, loading } = useInterviewerContext();

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Assigned Interviews ({interviews.length})</h2>

        {interviews.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No Interviews Assigned Yet</p>
            <p className="text-xs text-slate-500">Interviews assigned by the recruiter will appear here once scheduled.</p>
          </div>
        ) : (
          interviews.map((iv) => (
            <div key={iv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-200 transition-all">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{iv.candidate}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{iv.round} · {iv.time}</p>
                {iv.job && <p className="text-[11px] text-indigo-600 font-mono mt-0.5">{iv.job}</p>}
              </div>
              <button
                onClick={() => navigate("/interviewer/evaluation")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                Open Evaluation <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
