import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  KeyRound,
  User,
  FileText,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Clock
} from "lucide-react";

export default function CandidateAuthPage({ onAuth, loading, error, onBackToB2B }) {
  const [candidateMode, setCandidateMode] = useState("apply"); // 'apply' | 'login'
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("candidate@hireflow.ai");
  const [password, setPassword] = useState("Candidate123!");
  const [resumeFile, setResumeFile] = useState(null);

  function handleQuickFillCandidate() {
    setEmail("candidate@hireflow.ai");
    setPassword("Candidate123!");
    setFirstName("Rohan");
    setLastName("Sharma");
    setName("Rohan Sharma");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased selection:bg-indigo-500 selection:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Candidate Navigation Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">HireFlow AI</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ml-2 border border-teal-100">
              Candidate Portal
            </span>
          </div>
        </div>

        {onBackToB2B && (
          <button
            onClick={onBackToB2B}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            Switch to Company/Business Login →
          </button>
        )}
      </header>

      {/* Main Candidate Assessment Card Container */}
      <div className="max-w-4xl w-full mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
        >
          {/* Left Context Header Banner (HackerRank Test Join Style) */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Briefcase className="w-3.5 h-3.5" /> Apex Recruitment Drive
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Target Job Position</span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Senior Backend Engineer
                </h1>
                <p className="text-xs text-slate-300">
                  Bangalore / Remote · ₹28L - ₹36L CTC
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>AI Resume Screening (~3 mins)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bias-Audited Evaluation Criteria</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Instant Status Timeline & Offer Sync</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 space-y-1 font-mono">
              <span className="text-teal-400 font-bold">Demonstration Account:</span>
              <p>candidate@hireflow.ai · Candidate123!</p>
            </div>
          </div>

          {/* Right Mode Form */}
          <div className="md:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Form Mode Switcher Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCandidateMode("apply")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${candidateMode === "apply"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Continue Application
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateMode("login")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${candidateMode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  Sign In (Returning Candidate)
                </button>
              </div>

              {/* Form Title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {candidateMode === "apply"
                    ? "Apply & Start AI Screening"
                    : "Sign in to your Candidate Account"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {candidateMode === "apply"
                    ? "Upload your resume to trigger multi-agent skill vector screening."
                    : "Track your active applications, scheduled interviews, and offer status."}
                </p>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || name || "Candidate User";
                  onAuth({
                    mode: candidateMode === "apply" ? "register" : "login",
                    email,
                    password,
                    name: fullName,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    role: "candidate"
                  });
                }}
                className="space-y-4"
              >
                {candidateMode === "apply" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">First Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input
                          required
                          type="text"
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Rohan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input
                          required
                          type="text"
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Sharma"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      required
                      type="email"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      placeholder="candidate@hireflow.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      required
                      type="password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {candidateMode === "apply" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Resume PDF/DOCX (Optional for Demo)</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 p-4 rounded-xl text-center bg-slate-50 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-600 font-semibold block">Drop your resume PDF or click to browse</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Supports PDF, DOCX up to 10MB</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading
                    ? "Processing..."
                    : candidateMode === "apply"
                      ? "Submit Application & Start AI Screening"
                      : "Sign In to Candidate Dashboard"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleQuickFillCandidate}
                className="text-teal-600 hover:underline font-semibold"
              >
                Auto-fill Seeded Candidate Demo
              </button>
              <span className="font-mono text-[11px]">v2.4 Candidate Portal</span>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-2 border-t border-slate-200/60">
        © 2026 HireFlow AI Inc. Candidate Assessment & Evaluation Portal.
      </footer>
    </div>
  );
}
