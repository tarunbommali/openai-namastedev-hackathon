import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Gauge,
  ListChecks,
  LogOut,
  Mic,
  NotebookPen,
  Sparkles,
  Sliders,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Send,
  Calendar,
  Layers,
  Database
} from "lucide-react";
import { api } from "../api";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "jobs", label: "Jobs & Weighting", icon: Sliders },
  { id: "batches", label: "Screening Batches", icon: Layers },
  { id: "results", label: "Screening Results", icon: ListChecks },
  { id: "questions", label: "Interview Briefs", icon: NotebookPen },
  { id: "schedule", label: "Schedule", icon: Mic },
  { id: "decide", label: "Decisions & Offers", icon: UserCheck }
];

export default function RecruiterPortal({ auth, onLogout }) {
  const token = auth.accessToken;
  const [page, setPage] = useState("dashboard");
  const [dash, setDash] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [screenResult, setScreenResult] = useState(null);
  const [questions, setQuestions] = useState(null);
  
  // Quota & Tenant State
  const [quota, setQuota] = useState({ processed: 4250, limit: 5000 });
  const isQuotaWarning = quota.processed / quota.limit >= 0.85;

  // Role Weighting & Job Form State
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "",
    team: "",
    summary: "",
    requirements: "",
    skillMatch: 50,
    experienceMatch: 30,
    seniorityMatch: 20
  });

  // Human Override State
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ verdict: "Hire", reason: "" });

  // AI Brief Modal State
  const [briefModalCandidate, setBriefModalCandidate] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    time: "Wednesday 2:30 PM IST",
    round: "Technical Round 1",
    interviewerEmail: "interviewer@hireflow.ai"
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [d, j, c, a, f] = await Promise.all([
      api("/api/recruiter/dashboard", {}, token),
      api("/api/recruiter/jobs", {}, token),
      api("/api/recruiter/candidates", {}, token),
      api("/api/recruiter/applications", {}, token),
      api("/api/recruiter/feedback", {}, token)
    ]);
    setDash(d);
    setJobs(j);
    setCandidates(c);
    setApplications(a);
    setFeedback(f);
    if (!selectedId && c[0]?.id) setSelectedId(c[0].id);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  async function createJob() {
    setLoading(true);
    setErr("");
    try {
      await api("/api/recruiter/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...jobForm,
          requirements: jobForm.requirements.split(",").map((s) => s.trim()).filter(Boolean),
          scoringWeights: {
            skillMatch: Number(jobForm.skillMatch),
            experienceMatch: Number(jobForm.experienceMatch),
            seniorityMatch: Number(jobForm.seniorityMatch)
          }
        })
      }, token);
      setMsg("Job role & weighting policy saved successfully");
      setJobForm({ title: "", location: "", team: "", summary: "", requirements: "", skillMatch: 50, experienceMatch: 30, seniorityMatch: 20 });
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function closeJob(id) {
    setLoading(true);
    setErr("");
    try {
      await api(`/api/recruiter/jobs/${id}/close`, { method: "POST", body: "{}" }, token);
      setMsg("Job closed");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function runScreen() {
    setLoading(true);
    try {
      const data = await api("/api/recruiter/screen", {
        method: "POST",
        body: JSON.stringify({ intent: "Screen and rank candidates against role weights" })
      }, token);
      setScreenResult(data);
      setMsg("AI screening batch executed cleanly");
      setQuota(prev => ({ ...prev, processed: Math.min(prev.limit, prev.processed + 50) }));
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function genQuestions() {
    setLoading(true);
    try {
      setQuestions(await api("/api/recruiter/questions", {
        method: "POST",
        body: JSON.stringify({ candidateId: selected?.id })
      }, token));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function schedule() {
    setLoading(true);
    try {
      const data = await api("/api/recruiter/schedule", {
        method: "POST",
        body: JSON.stringify({ candidateId: selected?.id, ...scheduleForm })
      }, token);
      setMsg(data.message || "Interview scheduled & brief dispatched");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function decide(decision, overrideReason = "") {
    setLoading(true);
    try {
      const data = await api("/api/recruiter/decide", {
        method: "POST",
        body: JSON.stringify({ candidateId: selected?.id, decision, overrideReason })
      }, token);
      setMsg(`Verdict recorded (${decision}): ${data.reason}`);
      setOverrideModal(null);
      setOverrideForm({ verdict: "Hire", reason: "" });
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Brand Mark */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
              R
            </div>
            <div>
              <div className="font-bold text-white text-base leading-snug">Recruiter Portal</div>
              <div className="text-xs text-indigo-400 font-medium truncate max-w-[130px]">{auth.user.name}</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar & Tenant Quota Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant Workspace</div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {NAV.find((n) => n.id === page)?.label}
            </h1>
          </div>

          {/* Quota Gauge Indicator */}
          <div className={`p-3 rounded-xl border flex items-center gap-4 transition-colors ${
            isQuotaWarning ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" /> Resume Quota:
                </span>
                <span className="font-mono">{quota.processed.toLocaleString()} / {quota.limit.toLocaleString()}</span>
              </div>
              <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isQuotaWarning ? "bg-amber-500" : "bg-indigo-600"}`}
                  style={{ width: `${(quota.processed / quota.limit) * 100}%` }}
                />
              </div>
            </div>
            {isQuotaWarning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> &gt;85% Limit
              </span>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Notifications */}
          {err && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{err}</span>
            </div>
          )}
          {msg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}

          {/* PAGE 1: DASHBOARD */}
          {page === "dashboard" && dash && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Roles</span>
                  <div className="text-3xl font-bold font-mono text-slate-900">{dash.openJobs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Candidates Ranked</span>
                  <div className="text-3xl font-bold font-mono text-indigo-600">{dash.totalCandidates}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Applications</span>
                  <div className="text-3xl font-bold font-mono text-slate-900">{dash.applications}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interviews Today</span>
                  <div className="text-3xl font-bold font-mono text-teal-600">{dash.interviewsToday}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>CrewAI 7-Agent Activity Stream</span>
                </div>
                <div className="space-y-2">
                  {(dash.aiActivity || []).map((a) => (
                    <div key={a.executionId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">Execution #{a.executionId}</span>
                      <span className="text-indigo-600 font-medium">{(a.agents || []).join(" → ") || a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: JOBS & ROLE WEIGHTING */}
          {page === "jobs" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Job & Weight Creation Panel */}
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Configure Job & Scoring Weights</h2>
                  <p className="text-xs text-slate-500 mt-1">Set role constraints and define how AI agents score candidate resumes.</p>
                </div>

                <div className="space-y-3">
                  {["title", "location", "team", "summary", "requirements"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{field}</label>
                      <input
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={field === "requirements" ? "React, Node.js, TypeScript (comma separated)" : field}
                        value={jobForm[field]}
                        onChange={(e) => setJobForm({ ...jobForm, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                {/* Role Weighting Sliders */}
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>AI Matching Weight Distribution (Total 100%)</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Skill Match Weight:</span>
                        <span className="font-bold text-indigo-600">{jobForm.skillMatch}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={jobForm.skillMatch}
                        onChange={(e) => setJobForm({ ...jobForm, skillMatch: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Experience Weight:</span>
                        <span className="font-bold text-indigo-600">{jobForm.experienceMatch}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={jobForm.experienceMatch}
                        onChange={(e) => setJobForm({ ...jobForm, experienceMatch: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Seniority Weight:</span>
                        <span className="font-bold text-indigo-600">{jobForm.seniorityMatch}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={jobForm.seniorityMatch}
                        onChange={(e) => setJobForm({ ...jobForm, seniorityMatch: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={createJob}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Save Role & Weighting Policy
                </button>
              </div>

              {/* Open / Closed Roles List */}
              <div className="lg:col-span-6 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Active Job Roles ({jobs.length})</h2>
                {jobs.map((j) => (
                  <div key={j.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{j.title}</h3>
                        <p className="text-xs text-slate-500">{j.location} · {j.team || "Engineering"}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        j.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                      }`}>
                        {j.isActive ? "Active" : "Closed"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono flex items-center justify-between text-slate-700">
                      <span>Weights:</span>
                      <span>{j.scoringWeights?.skillMatch || 50}% Skill / {j.scoringWeights?.experienceMatch || 30}% Exp / {j.scoringWeights?.seniorityMatch || 20}% Seniority</span>
                    </div>

                    {j.isActive && (
                      <button
                        onClick={() => closeJob(j.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
                      >
                        Close Job Opening
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 3: SCREENING BATCHES */}
          {page === "batches" && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Async Batch Screening Queue</h2>
                <p className="text-xs text-slate-500">Trigger async candidate screening across uploaded CSV/ZIP resume batches.</p>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3 bg-slate-50/50">
                <Upload className="w-10 h-10 mx-auto text-indigo-600" />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Batch Resume CSV / ZIP Import</span>
                  <span className="text-xs text-slate-500">Drag & drop resume archives or CSV feeds up to 10,000 candidates</span>
                </div>
                <button
                  disabled={loading}
                  onClick={runScreen}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {loading ? "Screening Queue Running..." : "Run AI Resume Screening Batch"}
                </button>
              </div>

              {screenResult && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Batch Output Rankings JSON</h3>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-64">
                    {JSON.stringify(screenResult.rankings || screenResult.semanticMatches, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: SCREENING RESULTS & CANDIDATES TABLE */}
          {page === "results" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ranked Candidate Results</h2>
                  <p className="text-xs text-slate-500">Review AI scores, inspect skill gaps, and apply human overrides with required logs.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Match Score</th>
                      <th className="p-3">Detected Skill Gaps</th>
                      <th className="p-3">AI Brief</th>
                      <th className="p-3">Human Verdict Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {c.id}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${getScoreBadgeClass(c.matchScore)}`}>
                            {c.matchScore}% Match
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.gaps || []).map((gap) => (
                              <span key={gap} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-mono">
                                Gap: {gap}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setBriefModalCandidate(c)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 font-semibold rounded-md text-xs transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> View AI Brief
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedId(c.id);
                              setOverrideModal(c);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors"
                          >
                            Apply Override / Verdict
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 5: INTERVIEW BRIEFS & QUESTIONS */}
          {page === "questions" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">AI Structured Question Bank Generator</h2>
                  <p className="text-xs text-slate-500">Selected Candidate: <span className="font-bold text-indigo-600">{selected?.name || "None"}</span></p>
                </div>
                <button
                  disabled={loading || !selected}
                  onClick={genQuestions}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Generate Question Brief
                </button>
              </div>

              {questions ? (
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
                  {JSON.stringify(questions, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-slate-400 text-center py-12">Click generate above to produce tiered coding, system design, and behavioral questions.</p>
              )}
            </div>
          )}

          {/* PAGE 6: SCHEDULE */}
          {page === "schedule" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900">Schedule Interview Slot</h2>
              <p className="text-xs text-slate-500">Assign candidate: <span className="font-bold text-indigo-600">{selected?.name}</span></p>

              <div className="space-y-4">
                <input
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  placeholder="Slot Time (e.g. Wednesday 2:30 PM IST)"
                />
                <input
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  value={scheduleForm.round}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, round: e.target.value })}
                  placeholder="Interview Round"
                />
                <input
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  value={scheduleForm.interviewerEmail}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerEmail: e.target.value })}
                  placeholder="Interviewer Email"
                />
              </div>

              <button
                disabled={loading || !selected}
                onClick={schedule}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
              >
                Schedule & Send Brief to Interviewer
              </button>
            </div>
          )}

          {/* PAGE 7: DECISIONS & OFFERS */}
          {page === "decide" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Interviewer Feedback Inbox</h3>
                {feedback.length === 0 ? (
                  <p className="text-xs text-slate-400">No submitted feedback yet.</p>
                ) : (
                  feedback.map((f) => (
                    <div key={f.publicId || f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold text-slate-900 text-xs">
                        <span>{f.candidate}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{f.recommendation?.recommendation}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{f.feedbackText}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Final Verdict & Offer Actions</h3>
                <p className="text-xs text-slate-500">Selected: <span className="font-bold text-indigo-600">{selected?.name}</span></p>
                <p className="text-xs text-slate-600 leading-relaxed">{selected?.explanation}</p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => decide("Hire")}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    Hire Candidate + Send Offer
                  </button>
                  <button
                    onClick={() => decide("Hold")}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    Hold Candidate
                  </button>
                  <button
                    onClick={() => decide("Reject")}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    Reject Candidate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* HUMAN OVERRIDE MODAL */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Apply Human Override Verdict</h3>
            <p className="text-xs text-slate-500">Overriding AI decision for <span className="font-bold text-slate-900">{overrideModal.name}</span></p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Final Verdict</label>
              <select
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                value={overrideForm.verdict}
                onChange={(e) => setOverrideForm({ ...overrideForm, verdict: e.target.value })}
              >
                <option value="Hire">Hire</option>
                <option value="Hold">Hold</option>
                <option value="Reject">Reject</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Override Reason (Required for Audit Log)</label>
              <textarea
                rows={3}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                placeholder="Explain why human verdict differs from AI recommendation..."
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOverrideModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                disabled={!overrideForm.reason.trim()}
                onClick={() => decide(overrideForm.verdict, overrideForm.reason)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                Submit Audit Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI BRIEF MODAL */}
      {briefModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">AI Candidate Brief</h3>
              </div>
              <button onClick={() => setBriefModalCandidate(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Candidate: <strong className="text-slate-900">{briefModalCandidate.name}</strong></span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getScoreBadgeClass(briefModalCandidate.matchScore)}`}>
                  {briefModalCandidate.matchScore}% Match
                </span>
              </div>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">{briefModalCandidate.explanation}</p>
              <div>
                <span className="font-bold text-slate-800 block mb-1">Detected Skill Gaps:</span>
                <div className="flex flex-wrap gap-1">
                  {(briefModalCandidate.gaps || []).map(g => (
                    <span key={g} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 font-mono">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
