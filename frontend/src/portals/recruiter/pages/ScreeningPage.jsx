import React, { useState } from "react";
import { Layers, Sparkles, Send } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useRecruiterContext } from "../RecruiterLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function ScreeningPage() {
  const { token } = useAuth();
  const { candidates, loading, refresh, addToast } = useRecruiterContext();
  const [screenResult, setScreenResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [quota, setQuota] = useState({ processed: 4250, limit: 5000 });
  const isQuotaWarning = quota.processed / quota.limit >= 0.85;

  async function runScreen() {
    setRunning(true);
    try {
      const data = await api("/api/recruiter/screen", {
        method: "POST",
        body: JSON.stringify({ intent: "Screen and rank candidates against role weights" })
      }, token);
      setScreenResult(data);
      setQuota((prev) => ({ ...prev, processed: Math.min(prev.limit, prev.processed + 50) }));
      addToast("AI screening batch executed", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setRunning(false); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Quota Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${isQuotaWarning ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Resume Processing Quota</span>
            <span className="font-mono">{quota.processed.toLocaleString()} / {quota.limit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${isQuotaWarning ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width: `${(quota.processed / quota.limit) * 100}%` }} />
          </div>
        </div>
        {isQuotaWarning && (
          <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">âš  &gt;85%</span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> AI Screening Batch
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Runs the 7-agent CrewAI pipeline against all unprocessed applications.</p>
          </div>
          <button
            onClick={runScreen}
            disabled={running}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            {running ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
            {running ? "Running AI Screeningâ€¦" : "Run AI Screening Batch"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-slate-900">{candidates.length}</p>
            <p className="text-xs text-slate-500">Total Candidates</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-emerald-600">{candidates.filter((c) => c.status === "Ranked").length}</p>
            <p className="text-xs text-slate-500">Ranked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-amber-600">{candidates.filter((c) => c.status === "Pending").length}</p>
            <p className="text-xs text-slate-500">Pending Screen</p>
          </div>
        </div>
      </div>

      {screenResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Latest Batch Result
          </h3>
          <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-80 border border-slate-800">
            {JSON.stringify(screenResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
