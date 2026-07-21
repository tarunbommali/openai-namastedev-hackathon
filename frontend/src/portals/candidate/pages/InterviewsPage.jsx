import React from "react";
import { CalendarCheck, Clock, ExternalLink } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCandidateContext } from "../CandidateLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function InterviewsPage() {
  const { token } = useAuth();
  const { interviews, loading, refresh, addToast } = useCandidateContext();

  async function reschedule(ivId) {
    try {
      await api(`/api/candidate/interviews/${ivId}/reschedule`, { method: "POST" }, token);
      addToast("Reschedule request sent", "success");
      await refresh();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      {interviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Scheduled Interviews</p>
          <p className="text-xs text-slate-500">Interview invitations appear here once your application passes recruiter screening.</p>
        </div>
      ) : (
        interviews.map((iv) => (
          <div key={iv.publicId || iv.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                  {iv.round || "Technical Round"}
                </span>
                <span className="text-xs font-mono text-slate-400">IST (UTC+5:30)</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{iv.topic || "Technical Evaluation Interview"}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-600" /> {iv.time || "TBD"}</span>
                <span>Interviewer: <strong className="text-slate-900">{iv.interviewer || "Senior Lead"}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {iv.joinLink && (
                <a href={iv.joinLink} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  Join Call <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => reschedule(iv.publicId || iv.id)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Request Reschedule
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
