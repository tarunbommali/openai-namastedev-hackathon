import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  FileUp,
  LogOut,
  Search,
  UserRound,
  Sparkles,
  MapPin,
  Building,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  Send,
  AlertCircle,
  FileText,
  DollarSign
} from "lucide-react";
import { api } from "../api";

const NAV = [
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness },
  { id: "apply", label: "Apply / Upload", icon: FileUp },
  { id: "applications", label: "Applications", icon: CheckCircle2 },
  { id: "interviews", label: "Interviews", icon: CalendarCheck },
  { id: "offers", label: "Offers", icon: DollarSign },
  { id: "profile", label: "Profile", icon: UserRound }
];

const STAGES = [
  { id: "Applied", label: "Applied" },
  { id: "Screened", label: "Screened" },
  { id: "Interview Scheduled", label: "Interview Scheduled" },
  { id: "Decision", label: "Decision" },
  { id: "Offer", label: "Offer" }
];

export default function CandidatePortal({ auth, onLogout }) {
  const token = auth.accessToken;
  const [page, setPage] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [portal, setPortal] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState({
    name: auth.user.name,
    location: "",
    skills: "",
    experience: "",
    education: "",
    certifications: ""
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [jobList, p] = await Promise.all([
      api(`/api/candidate/jobs?q=${encodeURIComponent(q)}&skill=${encodeURIComponent(skill)}&location=${encodeURIComponent(location)}`, {}, token),
      api("/api/candidate/portal", {}, token)
    ]);
    setJobs(jobList);
    setPortal(p);
    if (p?.candidate) {
      setProfile((prev) => ({
        ...prev,
        name: p.candidate.name || prev.name,
        location: p.candidate.location || "",
        skills: (p.candidate.skills || p.candidate.parsedResume?.skills || []).join(", "),
        experience: p.candidate.experience || "",
        education: p.candidate.education || p.candidate.parsedResume?.education || "",
        certifications: (p.candidate.certifications || []).join(", ")
      }));
    }
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  async function searchJobs() {
    setErr("");
    try {
      setJobs(await api(`/api/candidate/jobs?q=${encodeURIComponent(q)}&skill=${encodeURIComponent(skill)}&location=${encodeURIComponent(location)}`, {}, token));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function submitApply() {
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      let data;
      if (file) {
        const form = new FormData();
        form.append("resume", file);
        if (selectedJob?.id) form.append("jobId", selectedJob.id);
        if (resumeText) form.append("resumeText", resumeText);
        data = await api("/api/candidate/apply", { method: "POST", body: form }, token);
      } else {
        data = await api("/api/candidate/apply", {
          method: "POST",
          body: JSON.stringify({ resumeText, jobId: selectedJob?.id })
        }, token);
      }
      setAnalysis(data);
      setMsg(data.message || "Application submitted successfully");
      await refresh();
      setPage("applications");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setLoading(true);
    setErr("");
    try {
      await api("/api/candidate/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          location: profile.location,
          skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience: profile.experience,
          education: profile.education,
          certifications: profile.certifications.split(",").map((s) => s.trim()).filter(Boolean)
        })
      }, token);
      setMsg("Profile saved successfully");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function respondOffer(id, decision) {
    setLoading(true);
    try {
      await api(`/api/candidate/offers/${id}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision })
      }, token);
      setMsg(`Offer ${decision.toLowerCase()} successfully`);
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function reschedule(id) {
    setLoading(true);
    try {
      await api(`/api/candidate/interviews/${id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ note: "Please suggest another afternoon slot." })
      }, token);
      setMsg("Reschedule request submitted to recruiter");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const getStageIndex = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s.includes("offer") || s.includes("hired")) return 4;
    if (s.includes("decid") || s.includes("reject") || s.includes("select")) return 3;
    if (s.includes("interview") || s.includes("sched")) return 2;
    if (s.includes("screen") || s.includes("shortlist")) return 1;
    return 0;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Brand Mark */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
              C
            </div>
            <div>
              <div className="font-bold text-white text-base leading-snug">Candidate Portal</div>
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

        {/* User Footer */}
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

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate Portal</div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {NAV.find((n) => n.id === page)?.label}
            </h1>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Assisted Screening Active</span>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Mandatory AI Disclosure Banner */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 text-indigo-950 text-xs leading-relaxed shadow-sm">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">AI-Assisted Screening Disclosure:</span>{" "}
              This platform uses AI-assisted analysis to parse resume skills and support recruiter evaluation. Final hiring decisions are always made and confirmed by human recruiters.
            </div>
          </div>

          {/* Feedback Messages */}
          {err && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{err}</span>
            </div>
          )}
          {msg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}

          {/* 1. JOBS TAB */}
          {page === "jobs" && (
            <div className="space-y-6">
              {/* Search Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search job title..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <input
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Required Skill (e.g. React)"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
                <input
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Location (e.g. Bangalore / Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <button
                  onClick={searchJobs}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> Filter Jobs
                </button>
              </div>

              {/* Job Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.team || "Engineering"}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || "Bangalore, India"}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Sparkles className="w-3 h-3 text-indigo-600" /> AI Screened
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{job.summary}</p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(job.requirements || []).map((req) => (
                          <span key={req} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">ID: {job.id}</span>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setPage("apply");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        Apply Now <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. APPLY TAB */}
          {page === "apply" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submit Application</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Applying to: <span className="font-semibold text-indigo-600">{selectedJob?.title || "General Application"}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Upload Resume File (.txt / .md / text)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.md,.text,text/plain"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-1.5"
                  />
                  {file && <p className="text-xs font-mono text-emerald-700">Selected file: {file.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Or Paste Resume Text Content
                  </label>
                  <textarea
                    rows={8}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Paste resume text, skills, experience details..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <button
                  disabled={loading || (!file && !resumeText.trim())}
                  onClick={submitApply}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Analyzing with AI..." : "Submit Application & Run AI Analysis"}
                </button>
              </div>

              {/* Analysis Sidebar Preview */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>AI Resume Analysis Result</span>
                </div>

                {analysis ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-900">Calculated Match Score:</span>
                      <span className="text-2xl font-bold font-mono text-indigo-600">
                        {analysis.resumeScore || analysis.application?.matchScore || 85}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Parsed Skills & Data:</span>
                      <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-80 border border-slate-800">
                        {JSON.stringify(analysis.parsedResume || analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-xs">Submit a resume on the left to see instant AI skill parsing and match scoring preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. APPLICATIONS TAB */}
          {page === "applications" && (
            <div className="space-y-6">
              {(portal?.applications || []).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
                  <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No Applications Submitted Yet</p>
                  <p className="text-xs text-slate-500">Explore open roles on the Jobs tab to submit your first application.</p>
                </div>
              ) : (
                (portal?.applications || []).map((app) => {
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
                            AI Match Score: <strong className="text-slate-900 font-mono text-sm">{app.matchScore || app.resumeScore || "85"}%</strong>
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {app.status || "Applied"}
                          </span>
                        </div>
                      </div>

                      {/* Status Node Timeline */}
                      <div className="relative py-4">
                        <div className="grid grid-cols-5 gap-2 relative z-10">
                          {STAGES.map((st, i) => {
                            const isPast = i <= stageIdx;
                            const isCurrent = i === stageIdx;
                            return (
                              <div key={st.id} className="flex flex-col items-center text-center space-y-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md"
                                    : isPast
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                }`}>
                                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`text-xs font-semibold ${isPast ? "text-slate-900" : "text-slate-400"}`}>
                                  {st.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. INTERVIEWS TAB */}
          {page === "interviews" && (
            <div className="space-y-6">
              {(portal?.interviews || []).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
                  <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No Scheduled Interviews</p>
                  <p className="text-xs text-slate-500">Interview invitations will appear here once your application passes initial recruiter screening.</p>
                </div>
              ) : (
                (portal?.interviews || []).map((iv) => (
                  <div key={iv.publicId || iv.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                          {iv.round || "Technical Round"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Timezone: IST (UTC+5:30)</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{iv.topic || "Technical Evaluation Interview"}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-600" /> {iv.time || "Tomorrow at 2:00 PM IST"}</span>
                        <span>Interviewer: <strong className="text-slate-900">{iv.interviewer || "Senior Lead"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {iv.joinLink && (
                        <a
                          href={iv.joinLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
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
          )}

          {/* 5. OFFERS TAB */}
          {page === "offers" && (
            <div className="space-y-6">
              {(portal?.offers || []).length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No Job Offers Yet</p>
                  <p className="text-xs text-slate-500">Official offer letters will appear here upon recruiter selection and decision approval.</p>
                </div>
              ) : (
                (portal?.offers || []).map((off) => (
                  <div key={off.publicId || off.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {off.status || "Pending Action"}
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-2">{off.subject || "Official Offer Letter"}</h3>
                      </div>
                    </div>

                    <pre className="bg-slate-50 text-slate-800 text-xs font-mono p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                      {off.body}
                    </pre>

                    {off.status !== "Accepted" && off.status !== "Rejected" && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          disabled={loading}
                          onClick={() => respondOffer(off.publicId || off.id, "Accepted")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                        >
                          Accept Offer
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => respondOffer(off.publicId || off.id, "Rejected")}
                          className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                        >
                          Decline Offer
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. PROFILE TAB */}
          {page === "profile" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900">Candidate Profile</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["name", "location", "skills", "experience", "education", "certifications"].map((field) => (
                  <div key={field} className={field === "skills" || field === "certifications" ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{field}</label>
                    <input
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile[field] || ""}
                      onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                      placeholder={field === "skills" || field === "certifications" ? "e.g. React, Node.js, TypeScript" : field}
                    />
                  </div>
                ))}
              </div>

              <button
                disabled={loading}
                onClick={saveProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                {loading ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
