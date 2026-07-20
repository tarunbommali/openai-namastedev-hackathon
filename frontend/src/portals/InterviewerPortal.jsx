import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  ClipboardCheck,
  FileJson,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Code2,
  Cpu,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send
} from "lucide-react";
import { api } from "../api";

const NAV = [
  { id: "eval", label: "Live Evaluation Workspace", icon: ClipboardCheck },
  { id: "today", label: "Assigned Interviews", icon: CalendarCheck }
];

const QUESTION_CATEGORIES = [
  {
    id: "coding",
    title: "1. Coding & Data Structures",
    icon: Code2,
    questions: [
      {
        q: "How would you handle concurrent cache invalidation in a distributed Node.js service using Redis?",
        lookup: "Look for mentions of atomic operations (Lua scripts, redis transactions), TTL strategies, cache-aside pattern."
      },
      {
        q: "Explain how you optimize database query execution plans for high-throughput pagination.",
        lookup: "Look for cursor-based (keyset) pagination over OFFSET/LIMIT, indexing strategy, query profiling."
      }
    ]
  },
  {
    id: "system",
    title: "2. System Design & Architecture",
    icon: Cpu,
    questions: [
      {
        q: "Design an asynchronous background queue system capable of handling 50,000 resume parsing jobs per hour.",
        lookup: "Evaluate worker pool scaling, dead letter queues (DLQ), idempotency, backpressure handling."
      },
      {
        q: "How do you enforce multi-tenant isolation and data security in PostgreSQL?",
        lookup: "Row-Level Security (RLS) policies, schema-per-tenant vs column-level tenant_id filtering, Vault secrets."
      }
    ]
  },
  {
    id: "behavioral",
    title: "3. Cultural & Behavioral Alignment",
    icon: MessageSquare,
    questions: [
      {
        q: "Describe a situation where an AI tool gave an uncertain recommendation and how you applied human override judgment.",
        lookup: "Assesses critical thinking, unwillingness to blindly trust model outputs, accountability."
      }
    ]
  }
];

export default function InterviewerPortal({ auth, onLogout }) {
  const token = auth.accessToken;
  const [page, setPage] = useState("eval");
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [brief, setBrief] = useState(null);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState({ coding: true, system: true, behavioral: false });

  // 1-5 Ratings State
  const [ratings, setRatings] = useState({
    coding: 4,
    systemDesign: 4,
    communication: 4,
    problemSolving: 5
  });

  const [recommendation, setRecommendation] = useState("Hire"); // 'Strong Hire' | 'Hire' | 'Hold' | 'Reject'
  const [notes, setNotes] = useState("Candidate demonstrated clear understanding of distributed caching and DB query optimization.");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const list = await api("/api/interviewer/interviews", {}, token);
    setInterviews(list);
    if (!selectedId && list[0]?.id) setSelectedId(list[0].id);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api(`/api/interviewer/interviews/${selectedId}/brief`, {}, token)
      .then(setBrief)
      .catch((e) => setErr(e.message));
  }, [selectedId]);

  async function submitFeedback() {
    setLoading(true);
    setErr("");
    try {
      const data = await api("/api/interviewer/feedback", {
        method: "POST",
        body: JSON.stringify({
          interviewId: selectedId,
          feedbackText: notes,
          ratings: {
            ...ratings,
            recommendation
          }
        })
      }, token);
      setResult(data);
      setMsg("Interview evaluation submitted cleanly — synced to recruiter inbox");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
              I
            </div>
            <div>
              <div className="font-bold text-white text-base leading-snug">Interviewer Portal</div>
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
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interviewer Workspace</div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {brief?.candidate?.name ? `Evaluation: ${brief.candidate.name}` : "Live Candidate Evaluation"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-semibold rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timezone: IST (UTC+5:30)</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Brief Loaded
            </span>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Notifications */}
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

          {/* PAGE: TODAY / ASSIGNED LIST */}
          {page === "today" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Assigned Interviews ({interviews.length})</h2>
              {interviews.map((iv) => (
                <div key={iv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{iv.candidate}</h3>
                    <p className="text-xs text-slate-500">{iv.round} · {iv.time}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedId(iv.id);
                      setPage("eval");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                  >
                    Open Live Evaluation Sheet →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PAGE: SPLIT TWO-COLUMN EVALUATION WORKSPACE */}
          {page === "eval" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: AI BRIEF & TIERED QUESTION ACCORDION (60% Desktop) */}
              <div className="lg:col-span-7 space-y-6">
                {/* AI Candidate Brief Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-indigo-600 font-semibold uppercase tracking-wider">Candidate AI Brief</div>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">{brief?.candidate?.name || "Target Candidate"}</h2>
                      <p className="text-xs text-slate-500">{brief?.job?.title || "Senior Software Engineer"}</p>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${getScoreBadgeClass(brief?.candidate?.matchScore || 85)}`}>
                      {brief?.candidate?.matchScore || 85}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                    {brief?.candidate?.aiSummary || "Strong backend engineering background with microservices, Redis, and high-throughput systems experience."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Key Strengths:</span>
                      <div className="flex flex-wrap gap-1">
                        {(brief?.candidate?.strengths || ["Node.js", "Redis", "System Design"]).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Detected Skill Gaps:</span>
                      <div className="flex flex-wrap gap-1">
                        {(brief?.candidate?.weaknesses || ["Kafka", "GraphQL"]).map((g) => (
                          <span key={g} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono">
                            Gap: {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiered Question Bank Accordion */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Tiered Interview Question Bank</span>
                  </div>

                  {QUESTION_CATEGORIES.map((cat) => {
                    const isOpen = openAccordions[cat.id];
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                          onClick={() => toggleAccordion(cat.id)}
                          className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-colors text-left"
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-indigo-600" />
                            {cat.title}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-4 border-t border-slate-100 text-xs">
                            {cat.questions.map((item, idx) => (
                              <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="font-semibold text-slate-900">{item.q}</p>
                                <p className="text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded border border-indigo-100 leading-relaxed font-mono">
                                  💡 <strong>What to look for:</strong> {item.lookup}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: STRUCTURED EVALUATION FORM (40% Desktop) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Structured Evaluation Sheet</h2>
                  <p className="text-xs text-slate-500 mt-1">Grade candidate performance across key dimensions.</p>
                </div>

                {/* 1-5 Star / Rating Controls */}
                <div className="space-y-4">
                  {[
                    { key: "coding", label: "Coding & Problem Solving" },
                    { key: "systemDesign", label: "System Design & Architecture" },
                    { key: "communication", label: "Communication & Clarity" },
                    { key: "problemSolving", label: "Cultural Fit & Engineering Rigor" }
                  ].map((rubric) => (
                    <div key={rubric.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{rubric.label}</span>
                        <span className="font-bold font-mono text-indigo-600">{ratings[rubric.key]} / 5</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setRatings({ ...ratings, [rubric.key]: score })}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border ${
                              ratings[rubric.key] === score
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {score} ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation Radio Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Final Recommendation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Strong Hire", label: "Strong Hire", color: "border-emerald-600 text-emerald-800 bg-emerald-50" },
                      { id: "Hire", label: "Hire", color: "border-emerald-500 text-emerald-700 bg-emerald-50/50" },
                      { id: "Hold", label: "Hold", color: "border-amber-500 text-amber-800 bg-amber-50" },
                      { id: "Reject", label: "Reject", color: "border-rose-500 text-rose-800 bg-rose-50" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRecommendation(opt.id)}
                        className={`py-3 px-3 rounded-lg font-bold text-xs text-center border-2 transition-all ${
                          recommendation === opt.id
                            ? `${opt.color} shadow-sm ring-2 ring-indigo-500/20`
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualitative Notes Textarea */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Interviewer Notes & Rationale
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    placeholder="Summarize key technical performance, trade-off discussions, and areas for improvement..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit Action */}
                <button
                  disabled={loading || !selectedId}
                  onClick={submitFeedback}
                  className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Submitting Evaluation..." : "Submit Final Evaluation & Sync Brief"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
