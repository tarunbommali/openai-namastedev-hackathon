import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, FileText, FileUp, Send, Sparkles } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCandidateContext } from "../CandidateLayout";
import { LoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { auth, token } = useAuth();
  const { jobs, profile, refresh, addToast } = useCandidateContext();

  const [job, setJob] = useState(() => jobs.find((j) => String(j.id) === String(jobId)) || null);
  const [resumeChoice, setResumeChoice] = useState("profile");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId && !job) {
      api(`/api/candidate/jobs/${jobId}`, {}, token)
        .then(setJob)
        .catch((e) => setError(e.message));
    }
  }, [jobId, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let data;
      if (resumeChoice === "custom" && file) {
        const form = new FormData();
        form.append("resume", file);
        form.append("jobId", jobId);
        if (resumeText) form.append("resumeText", resumeText);
        if (phone) form.append("phone", phone);
        data = await api("/api/candidate/apply", { method: "POST", body: form }, token);
      } else {
        const text = resumeText || `${profile.name} - Email: ${auth.user.email} - Skills: ${profile.skills} - Experience: ${profile.experience}`;
        data = await api("/api/candidate/apply", {
          method: "POST",
          body: JSON.stringify({ resumeText: text, jobId, phone })
        }, token);
      }
      setAnalysis(data);
      addToast(data.message || `Application for ${job?.title || "job"} submitted!`, "success");
      await refresh();
      setTimeout(() => navigate("/candidate/applications"), 1200);
    } catch (e) {
      setError(e.message);
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Applying for {job?.team || "Engineering"}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{job?.title || "Job Application"}</h2>
          <p className="text-xs text-slate-500 mt-1">Fill out your contact details and select your resume to complete your application.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                disabled
                className="w-full text-xs p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                value={profile.name || auth.user?.name || ""}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled
                className="w-full text-xs p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-mono"
                value={auth.user?.email || ""}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Select Resume</label>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${resumeChoice === "profile" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name="resumeOption" value="profile" checked={resumeChoice === "profile"} onChange={() => setResumeChoice("profile")} className="mt-1 accent-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Use Profile Resume & Skills
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">Saved skills: {profile.skills || "not set â€” update your profile"}</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${resumeChoice === "custom" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name="resumeOption" value="custom" checked={resumeChoice === "custom"} onChange={() => setResumeChoice("custom")} className="mt-1 accent-indigo-600" />
                <div className="space-y-3 flex-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-indigo-600" /> Upload a Different Resume / Paste Text
                  </span>
                  {resumeChoice === "custom" && (
                    <div className="space-y-3 pt-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <textarea
                        rows={3}
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Or paste custom resume text for this application..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button type="button" onClick={() => navigate(`/candidate/jobs/${jobId}`)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>

      {analysis && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>AI Resume Analysis Result</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900">Calculated Match Score:</span>
              <span className="text-2xl font-bold font-mono text-indigo-600">{analysis.resumeScore || analysis.application?.matchScore || 85}%</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Status:</span>
              <span className="text-sm font-bold text-emerald-700">{analysis.status || "Application Submitted"}</span>
            </div>
          </div>
          <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-64 border border-slate-800">
            {JSON.stringify(analysis.parsedResume || analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
