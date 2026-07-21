import React, { useState, useEffect } from "react";
import { Sparkles, Send, Code2, Cpu, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useInterviewerContext } from "../InterviewerLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

const QUESTION_CATEGORIES = [
  {
    id: "coding", title: "1. Coding & Data Structures", icon: Code2,
    questions: [
      { q: "How would you handle concurrent cache invalidation in a distributed Node.js service using Redis?", lookup: "Look for atomic operations (Lua scripts, redis transactions), TTL strategies, cache-aside pattern." },
      { q: "Explain how you optimize database query execution plans for high-throughput pagination.", lookup: "Look for cursor-based (keyset) pagination over OFFSET/LIMIT, indexing strategy, query profiling." }
    ]
  },
  {
    id: "system", title: "2. System Design & Architecture", icon: Cpu,
    questions: [
      { q: "Design an asynchronous background queue system capable of handling 50,000 resume parsing jobs per hour.", lookup: "Evaluate worker pool scaling, dead letter queues (DLQ), idempotency, backpressure handling." },
      { q: "How do you enforce multi-tenant isolation and data security in PostgreSQL?", lookup: "Row-Level Security (RLS) policies, schema-per-tenant vs column-level tenant_id filtering, Vault secrets." }
    ]
  },
  {
    id: "behavioral", title: "3. Cultural & Behavioral Alignment", icon: MessageSquare,
    questions: [
      { q: "Describe a situation where an AI tool gave an uncertain recommendation and how you applied human override judgment.", lookup: "Assesses critical thinking, unwillingness to blindly trust model outputs, accountability." }
    ]
  }
];

const RUBRICS = [
  { key: "coding",        label: "Coding & Problem Solving" },
  { key: "systemDesign", label: "System Design & Architecture" },
  { key: "communication", label: "Communication & Clarity" },
  { key: "problemSolving", label: "Cultural Fit & Engineering Rigor" }
];

function scoreBadge(score) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function EvaluationPage() {
  const { token } = useAuth();
  const { interviews, loading, refresh, addToast } = useInterviewerContext();

  const [selectedId, setSelectedId] = useState("");
  const [brief, setBrief] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({ coding: true, system: true, behavioral: false });
  const [ratings, setRatings] = useState({ coding: 4, systemDesign: 4, communication: 4, problemSolving: 5 });
  const [recommendation, setRecommendation] = useState("Hire");
  const [notes, setNotes] = useState("Candidate demonstrated clear understanding of distributed caching and DB query optimization.");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const currentId = selectedId || interviews[0]?.id;

  useEffect(() => {
    if (currentId) {
      api(`/api/interviewer/interviews/${currentId}/brief`, {}, token)
        .then(setBrief)
        .catch(() => setBrief(null));
    }
  }, [currentId, token]);

  const toggleAccordion = (id) => setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));

  async function submitFeedback() {
    setSubmitting(true);
    try {
      const data = await api("/api/interviewer/feedback", {
        method: "POST",
        body: JSON.stringify({
          interviewId: currentId,
          feedbackText: notes,
          ratings: { ...ratings, recommendation }
        })
      }, token);
      setResult(data);
      addToast("Evaluation submitted â€” synced to recruiter inbox", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setSubmitting(false); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-4">
      {/* Candidate selector if multiple */}
      {interviews.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Select Candidate</label>
          <select
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {interviews.map((iv) => (
              <option key={iv.id} value={iv.id}>{iv.candidate} â€” {iv.round}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: AI Brief + Question Bank */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Candidate Brief */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-indigo-600 font-semibold uppercase tracking-wider">Candidate AI Brief</div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{brief?.candidate?.name || "Target Candidate"}</h2>
                <p className="text-xs text-slate-500">{brief?.job?.title || "Senior Software Engineer"}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${scoreBadge(brief?.candidate?.matchScore || 85)}`}>
                {brief?.candidate?.matchScore || 85}% Match
              </span>
            </div>
            <p className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
              {brief?.candidate?.aiSummary || "Strong backend engineering background with microservices, Redis, and high-throughput systems experience."}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Key Strengths:</span>
                <div className="flex flex-wrap gap-1">
                  {(brief?.candidate?.strengths || ["Node.js", "Redis", "System Design"]).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-800 block mb-1">Skill Gaps:</span>
                <div className="flex flex-wrap gap-1">
                  {(brief?.candidate?.weaknesses || ["Kafka", "GraphQL"]).map((g) => (
                    <span key={g} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono">Gap: {g}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tiered Question Bank Accordion */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Tiered Interview Question Bank
            </div>
            {QUESTION_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openAccordions[cat.id];
              return (
                <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(cat.id)}
                    className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><Icon className="w-4 h-4 text-indigo-600" />{cat.title}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 space-y-4 border-t border-slate-100 text-xs">
                      {cat.questions.map((item, idx) => (
                        <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="font-semibold text-slate-900">{item.q}</p>
                          <p className="text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded border border-indigo-100 leading-relaxed font-mono">
                            ðŸ’¡ <strong>What to look for:</strong> {item.lookup}
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

        {/* RIGHT: Evaluation Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Structured Evaluation Sheet</h2>
            <p className="text-xs text-slate-500 mt-1">Grade candidate performance across key dimensions.</p>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            {RUBRICS.map((rubric) => (
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
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border ${ratings[rubric.key] === score ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`}
                    >
                      {score} â˜…
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Final Recommendation</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "Strong Hire", color: "border-emerald-600 text-emerald-800 bg-emerald-50" },
                { id: "Hire",        color: "border-emerald-500 text-emerald-700 bg-emerald-50/50" },
                { id: "Hold",        color: "border-amber-500 text-amber-800 bg-amber-50" },
                { id: "Reject",      color: "border-rose-500 text-rose-800 bg-rose-50" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecommendation(opt.id)}
                  className={`py-3 px-3 rounded-lg font-bold text-xs text-center border-2 transition-all ${recommendation === opt.id ? `${opt.color} shadow-sm ring-2 ring-indigo-500/20` : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {opt.id}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Interviewer Notes</label>
            <textarea
              rows={4}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              placeholder="Summarize key technical performance, trade-off discussions, and areas for improvement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            disabled={submitting || !currentId}
            onClick={submitFeedback}
            className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting Evaluationâ€¦" : "Submit Final Evaluation & Sync Brief"}
          </button>

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold">
              âœ“ Evaluation submitted and synced to recruiter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
