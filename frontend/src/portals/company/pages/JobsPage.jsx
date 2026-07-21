import React, { useState } from "react";
import { BriefcaseBusiness, Plus, MapPin, Building, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCompanyContext } from "../CompanyLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function CreateJobModal({ onClose, onSuccess, addToast, token }) {
  const [form, setForm] = useState({
    title: "", team: "Engineering", location: "Bangalore / Remote",
    department: "", employmentType: "Full-time", salaryRange: "",
    summary: "", requirements: "React, Node.js, TypeScript"
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean)
        })
      }, token);
      addToast(`Job "${form.title}" created successfully`, "success");
      onSuccess();
      onClose();
    } catch (e) { addToast(e.message, "error"); }
    finally { setLoading(false); }
  }

  const F = ({ label, children }) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
  const inp = "w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Create New Job
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <F label="Job Title"><input required className={`${inp} col-span-2`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" /></F>
            <F label="Team"><input className={inp} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Engineering" /></F>
            <F label="Department"><input className={inp} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Product" /></F>
            <F label="Location"><input className={inp} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bangalore" /></F>
            <F label="Employment Type">
              <select className={inp} value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                {["Full-time", "Part-time", "Contract", "Internship"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </F>
          </div>
          <F label="Salary Range"><input className={inp} value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="e.g. â‚¹18L â€“ â‚¹28L per annum" /></F>
          <F label="Role Summary">
            <textarea rows={3} className={inp} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Describe the role and responsibilities..." />
          </F>
          <F label="Required Skills (comma separated)">
            <input className={inp} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="React, TypeScript, Node.js" />
          </F>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <BriefcaseBusiness className="w-4 h-4" />}
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { token } = useAuth();
  const { jobs, loading, refresh, addToast } = useCompanyContext();
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState(null);

  async function toggleJob(jobId, isActive) {
    setToggling(jobId);
    try {
      await api(`/api/jobs/${jobId}`, { method: "PATCH", body: JSON.stringify({ isActive: !isActive }) }, token);
      addToast(`Job ${isActive ? "closed" : "reopened"}`, "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setToggling(null); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{jobs.length} job posting{jobs.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Jobs Posted Yet</p>
          <p className="text-xs text-slate-500">Create your first job posting to start receiving AI-screened applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div key={job.id} className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 transition-all ${job.isActive !== false ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.team || "â€”"}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || "â€”"}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${job.isActive !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  {job.isActive !== false ? "Active" : "Closed"}
                </span>
              </div>
              {job.salaryRange && <p className="text-xs text-slate-500">ðŸ’° {job.salaryRange}</p>}
              <div className="flex flex-wrap gap-1.5">
                {(job.requirements || []).slice(0, 4).map((r) => (
                  <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">{r}</span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => toggleJob(job.id, job.isActive !== false)}
                  disabled={toggling === job.id}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${job.isActive !== false ? "text-rose-600 hover:text-rose-800" : "text-emerald-600 hover:text-emerald-800"}`}
                >
                  {toggling === job.id ? <LoadingSpinner size="sm" /> : job.isActive !== false ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {job.isActive !== false ? "Close Job" : "Reopen Job"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onSuccess={refresh} addToast={addToast} token={token} />}
    </div>
  );
}
