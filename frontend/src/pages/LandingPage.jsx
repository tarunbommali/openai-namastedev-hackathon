import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Building2,
  UserCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileCode,
  Activity,
  ChevronRight,
  Sliders,
  Users,
  Layers,
  Database,
  Key,
  Bot
} from "lucide-react";

export default function LandingPage({ onNavigateAuth, apiOnline }) {
  const [resumesPerMonth, setResumesPerMonth] = useState(5000);
  const [recruiterCostPerHour, setRecruiterCostPerHour] = useState(500);

  // ROI Calculations
  const manualHours = Math.round((resumesPerMonth * 15) / 60); // 15 mins per resume manually
  const aiHours = Math.round(manualHours * 0.22); // 78% faster
  const hoursSaved = manualHours - aiHours;
  const rupeeSavings = Math.round(hoursSaved * recruiterCostPerHour);

  const CREW_AGENTS = [
    { name: "Intent Parsing Agent", status: "Active", desc: "Extracts tech stack & seniority requirements" },
    { name: "Resume Screening Agent", status: "Active", desc: "Parses multi-format PDFs/DOCX at 500/min" },
    { name: "Skill Matching Agent", status: "Processing", desc: "Weighted vector similarity scoring" },
    { name: "Question Gen Agent", status: "Queued", desc: "Generates tailored coding & system design prompts" },
    { name: "Scheduling Agent", status: "Queued", desc: "Coordinates slot availability & calendar sync" },
    { name: "Decision Engine Agent", status: "Queued", desc: "Aggregates recruiter overrides & verdicts" },
    { name: "Offer & Audit Agent", status: "Queued", desc: "Emits signed HMAC webhooks & bias logs" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased selection:bg-indigo-500 selection:text-white">
      {/* 0. Top Announcement Bar */}
      <div className="bg-slate-900 text-indigo-200 text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] uppercase tracking-wide border border-indigo-500/30">
          v2.4 Live
        </span>
        <span>Multi-Tenant Agent Orchestration & Real-Time HMAC Webhooks Released.</span>
        <button
          onClick={() => onNavigateAuth("register", "recruiter")}
          className="underline hover:text-white transition-colors text-xs font-semibold ml-1 flex items-center gap-0.5"
        >
          Start 6-Week Pilot <ChevronRight className="w-3 h-3 inline" />
        </button>
      </div>

      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">HireFlow</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">AI</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#architecture" className="hover:text-slate-900 transition-colors">Multi-Agent Pipeline</a>
          <a href="#solutions" className="hover:text-slate-900 transition-colors">Who It's For</a>
          <a href="#automations" className="hover:text-slate-900 transition-colors">Automations</a>
          <a href="#security" className="hover:text-slate-900 transition-colors">Security & Multi-Tenant</a>
          <a href="#calculator" className="hover:text-slate-900 transition-colors">ROI Calculator</a>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            apiOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            API {apiOnline ? "Online" : "Offline"}
          </div>

          <button
            onClick={() => onNavigateAuth("login")}
            className="text-slate-700 hover:text-slate-900 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigateAuth("register", "recruiter")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Start 6-Week Pilot
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multi-tenant AI copilot for Indian tech recruitment & campus</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Accelerate shortlist velocity with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-teal-600 to-indigo-800">
                  multi-agent AI hiring precision.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Automate resume screening, domain skill matching, custom question generation, and bias-audited shortlists while maintaining strict tenant data isolation and HMAC-secured webhooks.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigateAuth("register", "recruiter")}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2 text-base"
                >
                  Start 6-Week Pilot <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigateAuth("login", "recruiter")}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all gap-2 text-base"
                >
                  View Interactive Demo
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-medium text-slate-500 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tenant Data Isolation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Human-in-the-Loop Overrides</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>HMAC Verified Webhooks</span>
                </div>
              </div>
            </div>

            {/* Right Architecture Visualizer */}
            <div className="lg:col-span-5" id="architecture">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl shadow-indigo-950/30 text-slate-100 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Multi-Agent CrewAI Stream
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Live AI Orchestration
                  </div>
                </div>

                {/* Agent Process List */}
                <div className="space-y-3 font-mono text-xs">
                  {CREW_AGENTS.map((agent, i) => (
                    <div
                      key={agent.name}
                      className={`p-3 rounded-lg border transition-colors ${
                        i === 2
                          ? "bg-slate-800/90 border-teal-500/50 text-white shadow-sm"
                          : i < 2
                          ? "bg-slate-800/40 border-slate-700/50 text-slate-300"
                          : "bg-slate-900/50 border-slate-800/80 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            i === 2 ? "bg-teal-400 animate-ping" : i < 2 ? "bg-emerald-400" : "bg-slate-600"
                          }`} />
                          {agent.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          i === 2
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : i < 2
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{agent.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Footer Status Log */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Batch #IND-2026-CAMPUS</span>
                  <span className="text-teal-400 font-semibold">500 candidates / min</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics Bar */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md space-y-1 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">78% Faster</div>
            <div className="text-xs font-medium text-slate-500">Time-to-shortlist (48h → 4h)</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md space-y-1 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Savings</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">70% Lower</div>
            <div className="text-xs font-medium text-slate-500">Screening cost per candidate</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md space-y-1 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Audited</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">100% Compliant</div>
            <div className="text-xs font-medium text-slate-500">Bias audit pass rate & log trails</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md space-y-1 hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Cpu className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Campus</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">500+ / min</div>
            <div className="text-xs font-medium text-slate-500">Async batch resume screening</div>
          </div>
        </div>
      </section>

      {/* 4. Section: Who It's For */}
      <section className="py-20 bg-slate-50" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Built specifically for Indian tech recruitment workflows
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Designed for decision support and high-velocity recruitment without data overload.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Business & Company Leaders</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Streamline engineering hiring, enforce tenant isolation across multi-team accounts, and deliver branded AI shortlist briefs directly to hiring managers.
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Tenant Accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Client Quota Limits</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Enterprise TA Directors</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standardize skill match rubrics, monitor recruiter alignment scores, and ensure 100% audit readiness for institutional compliance.
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role Weighting Sliders</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Human Override Logs</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Campus Hiring Partners</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter 50,000+ university applicant resumes asynchronously in background queues without recruiter burnout or system lag.
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> High-Volume Batch Import</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant Interview Slotting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Automations Grid */}
      <section className="py-20 bg-white border-y border-slate-200" id="automations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              End-to-End Recruitment Lifecycle Automation
            </h2>
            <p className="text-sm font-medium text-slate-500">
              From intent parsing to signed HMAC webhooks and compliance audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <Sliders className="w-6 h-6 text-indigo-600" />
              <h4 className="font-semibold text-slate-900">Role Weighting Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure custom weight sliders for Skill Match %, Experience %, and Seniority % tailored to every client role.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <Layers className="w-6 h-6 text-teal-600" />
              <h4 className="font-semibold text-slate-900">Async Batch Queue</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload thousands of candidate resumes via CSV/ZIP; Redis screening queues process candidates in background jobs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <FileCode className="w-6 h-6 text-indigo-600" />
              <h4 className="font-semibold text-slate-900">Dynamic Technical Briefs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Auto-generates structured interview questions for Coding, System Design, and Behavioral evaluations with scoring rubrics.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <Users className="w-6 h-6 text-teal-600" />
              <h4 className="font-semibold text-slate-900">Human Override Logs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters retain full control to override AI candidate decisions, backed by mandatory audit reason capture.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <Activity className="w-6 h-6 text-indigo-600" />
              <h4 className="font-semibold text-slate-900">Signed HMAC Webhooks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stream real-time screening events (`candidate.screened`, `verdict.overridden`) securely to your company ATS.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <h4 className="font-semibold text-slate-900">Bias Audit Dashboard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated statistical audit graphs ensuring demographic neutrality and instant export of bias report PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Security & Multi-Tenant Isolation */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="security">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Lock className="w-3.5 h-3.5" /> Enterprise Safety & Tenant Isolation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Isolated data. Encrypted secrets. Compliant audit trails.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every business and company operates inside an isolated tenant environment with dedicated cryptographic boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <Database className="w-6 h-6 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Tenant Isolation (RLS)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict database Row-Level Security ensures your company data, resumes, and scoring rubrics are never mixed or exposed to other businesses.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <Key className="w-6 h-6 text-teal-400" />
              <h3 className="font-bold text-white text-base">AES-256 Encrypted Secrets</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                API credentials, recruiter access tokens, and webhook secrets are encrypted at rest using AES-256 cryptographic standards.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 space-y-3">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Human-in-the-Loop Policy</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                AI agents act strictly as decision-support copilots. Recruiters approve or override all final shortlist recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: ROI Pilot Calculator */}
      <section className="py-20 bg-slate-50 border-b border-slate-200" id="calculator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Calculate Your Company's Pilot ROI
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Estimate recruiter hours saved and net cost reductions using HireFlow AI.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Monthly Candidates Screened: <span className="font-bold text-indigo-600">{resumesPerMonth.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={resumesPerMonth}
                  onChange={(e) => setResumesPerMonth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Recruiter Hourly Cost (₹): <span className="font-bold text-indigo-600">₹{recruiterCostPerHour} / hr</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={recruiterCostPerHour}
                  onChange={(e) => setRecruiterCostPerHour(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <p className="font-semibold">Baseline Calculation Logic:</p>
                <p>Based on manual screening benchmark of 15 mins / resume vs AI copilot speed of ~3 mins.</p>
              </div>
            </div>

            <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-6 space-y-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Estimated Monthly Pilot Savings</span>
              <div>
                <div className="text-4xl font-extrabold text-teal-400 font-mono tracking-tight">
                  ₹{rupeeSavings.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-400 mt-1">Net company cost savings per month</div>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="text-slate-400">Recruiter Hours Saved</div>
                  <div className="text-lg font-bold text-white">{hoursSaved} hrs / mo</div>
                </div>
                <div>
                  <div className="text-slate-400">Time-to-Shortlist</div>
                  <div className="text-lg font-bold text-emerald-400">78% Faster</div>
                </div>
              </div>

              <button
                onClick={() => onNavigateAuth("register", "recruiter")}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs uppercase tracking-wider transition-colors shadow-md text-white mt-2"
              >
                Claim 6-Week Pilot Setup →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Conversion Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to transform your recruitment velocity?
          </h2>
          <p className="text-indigo-100 text-base max-w-2xl mx-auto">
            Join Indian tech companies, growing businesses, and campus hiring leaders scaling candidate screening with 7-agent AI copilot precision.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigateAuth("register", "recruiter")}
              className="px-8 py-4 rounded-xl font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl transition-all hover:scale-105"
            >
              Start 6-Week Pilot Free
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>HireFlow AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Multi-tenant AI hiring copilot designed for fast-growing businesses, tech companies, and campus partners.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 text-sm mb-1">Portals</div>
            <button onClick={() => onNavigateAuth("login", "candidate")} className="block hover:text-white transition-colors">Candidate Portal</button>
            <button onClick={() => onNavigateAuth("login", "recruiter")} className="block hover:text-white transition-colors">Recruiter Portal</button>
            <button onClick={() => onNavigateAuth("login", "interviewer")} className="block hover:text-white transition-colors">Interviewer Portal</button>
            <button onClick={() => onNavigateAuth("login", "admin")} className="block hover:text-white transition-colors">Business Admin Portal</button>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 text-sm mb-1">Developer & API</div>
            <a href="#security" className="block hover:text-white transition-colors">HMAC Webhooks Guide</a>
            <a href="#automations" className="block hover:text-white transition-colors">CrewAI 7-Agent Pipeline</a>
            <a href="#security" className="block hover:text-white transition-colors">Multi-Tenant Isolation Spec</a>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 text-sm mb-1">Compliance & Seed Info</div>
            <p>Seeded Test Accounts:</p>
            <p className="font-mono text-[11px] text-slate-300">candidate@hireflow.ai</p>
            <p className="font-mono text-[11px] text-slate-300">recruiter@hireflow.ai</p>
            <p className="font-mono text-[11px] text-slate-300">interviewer@hireflow.ai</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-slate-500">
          © 2026 HireFlow AI Inc. Built for Indian Tech Recruitment & High-Volume Campus Hiring. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
