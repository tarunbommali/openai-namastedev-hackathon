import React, { useState } from "react";
import { BriefcaseBusiness, Plus, XCircle } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useRecruiterContext } from "../RecruiterLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function CreateJobModal({ onClose, onSuccess, addToast, token }) {
  const [form, setForm] = useState({
    title: "", location: "Bangalore / Remote", team: "Engineering",
    summary: "", requirements: "", skillMatch: 50, experienceMatch: 30, seniorityMatch: 20
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/recruiter/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
          scoringWeights: {
            skillMatch: Number(form.skillMatch),
            experienceMatch: Number(form.experienceMatch),
            seniorityMatch: Number(form.seniorityMatch)
          }
        })
      }, token);
      addToast(`Job "${form.title}" created with weighting policy`, "success");
      onSuccess();
      onClose();
    } catch (e) { addToast(e.message, "error"); }
    finally { setLoading(false); }
  }

  const inp = "w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const F = ({ label, children }) => (
    <div className="space-y-1"><label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>{children}</div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Create Job & Weighting Policy</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <F label="Job Title"><input required className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Backend Engineer" /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Team"><input className={inp} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Engineering" /></F>
            <F label="Location"><input className={inp} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" /></F>
          </div>
          <F label="Summary"><textarea rows={3} className={inp} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Role description..." /></F>
          <F label="Requirements (comma-separated)"><input className={inp} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="React, Node.js, TypeScript" /></F>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Scoring Weights (must sum to 100)</p>
            {[
              { key: "skillMatch", label: "Skill Match" },
              { key: "experienceMatch", label: "Experience Match" },
              { key: "seniorityMatch", label: "Seniority Match" }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-36">{label}</span>
                <input type="range" min={0} max={100} value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="flex-1 accent-indigo-600" />
                <span className="text-xs font-mono font-bold text-indigo-600 w-8">{form[key]}%</span>
              </div>
            ))}
            <p className="text-[11px] text-slate-400">Total: {Number(form.skillMatch) + Number(form.experienceMatch) + Number(form.seniorityMatch)}%</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecruiterJobsPage() {
  const { token } = useAuth();
  const { jobs, loading, refresh, addToast } = useRecruiterContext();
  const [showCreate, setShowCreate] = useState(false);
  const [closing, setClosing] = useState(null);

  async function closeJob(id) {
    setClosing(id);
    try {
      await api(`/api/recruiter/jobs/${id}/close`, { method: "POST", body: "{}" }, token);
      addToast("Job closed", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setClosing(null); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-2">
          <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Jobs Yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Job Title", "Team", "Location", "Skill%", "Exp%", "Sen%", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4 font-semibold text-sm text-slate-900">{j.title}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{j.team || "â€”"}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{j.location || "â€”"}</td>
                  <td className="px-4 py-4 text-xs font-mono text-indigo-600">{j.scoringWeights?.skillMatch ?? j.skillMatch ?? "â€”"}%</td>
                  <td className="px-4 py-4 text-xs font-mono text-indigo-600">{j.scoringWeights?.experienceMatch ?? j.experienceMatch ?? "â€”"}%</td>
                  <td className="px-4 py-4 text-xs font-mono text-indigo-600">{j.scoringWeights?.seniorityMatch ?? j.seniorityMatch ?? "â€”"}%</td>
                  <td className="px-4 py-4">
                    <button onClick={() => closeJob(j.id)} disabled={closing === j.id} className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
                      {closing === j.id ? <LoadingSpinner size="sm" /> : <XCircle className="w-3.5 h-3.5" />} Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onSuccess={refresh} addToast={addToast} token={token} />}
    </div>
  );
}
