import React, { useState } from "react";
import { NotebookPen, Sparkles } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useRecruiterContext } from "../RecruiterLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function QuestionsPage() {
  const { token } = useAuth();
  const { candidates, loading } = useRecruiterContext();
  const [selectedId, setSelectedId] = useState("");
  const [questions, setQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  async function genQuestions() {
    setGenerating(true);
    setError(null);
    try {
      const data = await api("/api/recruiter/questions", {
        method: "POST",
        body: JSON.stringify({ candidateId: selected?.id })
      }, token);
      setQuestions(data);
    } catch (e) { setError(e.message); }
    finally { setGenerating(false); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-indigo-600" /> Generate AI Interview Brief
        </h3>
        <p className="text-xs text-slate-500">Select a candidate and generate a tailored interview question brief using the AI pipeline.</p>

        <div className="flex items-center gap-3">
          <select
            className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedId || selected?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name} â€” Score: {c.matchScore || 0}%</option>
            ))}
          </select>
          <button
            onClick={genQuestions}
            disabled={generating || !candidates.length}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
          >
            {generating ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generatingâ€¦" : "Generate Brief"}
          </button>
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">{error}</div>}

        {candidates.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">No candidates available. Run a screening batch first.</p>
        )}
      </div>

      {questions && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI-Generated Interview Brief
          </h3>
          <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(questions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
