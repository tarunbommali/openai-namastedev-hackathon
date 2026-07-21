import React, { useState } from "react";
import { UserCheck, ThumbsUp, ThumbsDown, Shield } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useRecruiterContext } from "../RecruiterLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

const VERDICT_COLORS = {
  Hire: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Reject: "bg-rose-50 text-rose-700 border-rose-200",
  Hold: "bg-amber-50 text-amber-700 border-amber-200"
};

function OverrideModal({ candidate, onClose, onDecide }) {
  const [form, setForm] = useState({ verdict: "Hire", reason: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await onDecide(form.verdict, form.reason);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Human Override for {candidate?.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Override Verdict</label>
            <select
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.verdict}
              onChange={(e) => setForm({ ...form, verdict: e.target.value })}
            >
              <option value="Hire">Hire</option>
              <option value="Reject">Reject</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Override Reason</label>
            <textarea
              required
              rows={3}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Explain the human override decision..."
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <Shield className="w-4 h-4" />} Apply Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DecisionsPage() {
  const { token } = useAuth();
  const { candidates, loading, refresh, addToast } = useRecruiterContext();
  const [selectedId, setSelectedId] = useState("");
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [deciding, setDeciding] = useState(null);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  async function decide(candidateId, decision, overrideReason = "") {
    setDeciding(candidateId);
    try {
      const data = await api("/api/recruiter/decide", {
        method: "POST",
        body: JSON.stringify({ candidateId, decision, overrideReason })
      }, token);
      addToast(`Verdict: ${decision} â€” ${data.reason || "recorded"}`, "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setDeciding(null); }
  }

  if (loading) return <PageLoadingSpinner />;

  const ranked = [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <div className="space-y-6">
      {ranked.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Candidates to Decide</p>
          <p className="text-xs text-slate-500">Run AI Screening first to rank candidates before making hire/reject decisions.</p>
        </div>
      ) : (
        ranked.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">{c.name?.[0] || "?"}</div>
                <div>
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold font-mono border ${c.matchScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : c.matchScore >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                  {c.matchScore || 0}%
                </span>
                {c.verdict && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${VERDICT_COLORS[c.verdict] || "bg-slate-100 text-slate-600"}`}>
                    {c.verdict}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {!c.verdict && (
                <>
                  <button
                    onClick={() => decide(c.id, "Hire")}
                    disabled={deciding === c.id}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                  >
                    {deciding === c.id ? <LoadingSpinner size="sm" /> : <ThumbsUp className="w-3.5 h-3.5" />} Hire
                  </button>
                  <button
                    onClick={() => decide(c.id, "Reject")}
                    disabled={deciding === c.id}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                  >
                    {deciding === c.id ? <LoadingSpinner size="sm" /> : <ThumbsDown className="w-3.5 h-3.5" />} Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setOverrideTarget(c)}
                className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold px-4 py-2 rounded-lg"
              >
                <Shield className="w-3.5 h-3.5" /> Override
              </button>
            </div>
          </div>
        ))
      )}

      {overrideTarget && (
        <OverrideModal
          candidate={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onDecide={(verdict, reason) => decide(overrideTarget.id, verdict, reason)}
        />
      )}
    </div>
  );
}
