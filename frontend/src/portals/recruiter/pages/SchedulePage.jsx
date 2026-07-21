import React, { useState } from "react";
import { Mic, Send } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useRecruiterContext } from "../RecruiterLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function SchedulePage() {
  const { token } = useAuth();
  const { candidates, loading, refresh, addToast } = useRecruiterContext();
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    time: "Wednesday 2:30 PM IST",
    round: "Technical Round 1",
    interviewerEmail: "interviewer@hireflow.ai"
  });
  const [scheduling, setScheduling] = useState(false);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  async function schedule() {
    setScheduling(true);
    try {
      const data = await api("/api/recruiter/schedule", {
        method: "POST",
        body: JSON.stringify({ candidateId: selected?.id, ...form })
      }, token);
      addToast(data.message || "Interview scheduled & brief dispatched", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setScheduling(false); }
  }

  if (loading) return <PageLoadingSpinner />;

  const inp = "w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const F = ({ label, children }) => (
    <div className="space-y-1"><label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>{children}</div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Mic className="w-5 h-5 text-indigo-600" /> Schedule Interview
        </h3>

        <F label="Select Candidate">
          <select className={inp} value={selectedId || selected?.id || ""} onChange={(e) => setSelectedId(e.target.value)}>
            {candidates.length === 0 ? (
              <option value="">No candidates â€” run screening first</option>
            ) : (
              candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} â€” {c.matchScore || 0}%</option>
              ))
            )}
          </select>
        </F>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Interview Time">
            <input className={inp} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Wednesday 2:30 PM IST" />
          </F>
          <F label="Round Name">
            <input className={inp} value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="Technical Round 1" />
          </F>
          <F label="Interviewer Email" className="sm:col-span-2">
            <input className={inp} type="email" value={form.interviewerEmail} onChange={(e) => setForm({ ...form, interviewerEmail: e.target.value })} placeholder="interviewer@company.com" />
          </F>
        </div>

        <button
          onClick={schedule}
          disabled={scheduling || !candidates.length}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm"
        >
          {scheduling ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
          {scheduling ? "Schedulingâ€¦" : "Schedule & Dispatch Brief"}
        </button>
      </div>
    </div>
  );
}
