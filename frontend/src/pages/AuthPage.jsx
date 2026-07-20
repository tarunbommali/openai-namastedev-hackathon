import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Lock,
  Sparkles,
  Building2,
  GraduationCap,
  ArrowRight,
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  Bot,
  Globe,
  Sliders
} from "lucide-react";
import { API } from "../api";

const B2B_ROLES = [
  { role: "recruiter", email: "recruiter@hireflow.ai", password: "Recruiter123!", label: "Recruiter Portal", icon: Building2, tag: "Company / TA" },
  { role: "interviewer", email: "interviewer@hireflow.ai", password: "Interviewer123!", label: "Interviewer Portal", icon: GraduationCap, tag: "Tech Evaluator" }
];

export default function AuthPage({ onAuth, loading, error, apiOnline, initialConfig, onSwitchToCandidateAuth }) {
  const [mode, setMode] = useState(initialConfig?.mode === "register" ? "register" : "login");
  const initialRole = initialConfig?.role || "recruiter";
  const defaultLogin = B2B_ROLES.find((q) => q.role === initialRole) || B2B_ROLES[0];

  const [role, setRole] = useState(defaultLogin.role);
  const [email, setEmail] = useState(defaultLogin.email);
  const [password, setPassword] = useState(defaultLogin.password);
  
  // Registration specific fields
  const [agencyName, setAgencyName] = useState("");
  const [regionVertical, setRegionVertical] = useState("Bangalore / Tech Recruitment");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleRoleSelect = (item) => {
    setRole(item.role);
    setEmail(item.email);
    setPassword(item.password);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased selection:bg-indigo-500 selection:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">HireFlow</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
            apiOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            BFF API: {apiOnline ? "Online" : "Offline"}
          </div>

          {onSwitchToCandidateAuth && (
            <button
              onClick={onSwitchToCandidateAuth}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
            >
              Candidate Assessment Portal →
            </button>
          )}
        </div>
      </header>

      {/* Main B2B Auth Grid */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* LEFT COLUMN: Concise B2B SaaS Info Panel (5-Cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden hidden lg:block"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> B2B Multi-Tenant Platform
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
              HireFlow AI Workspace
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in to access candidate status tracking, recruiter screening, and company ROI dashboards, all with strict tenant data isolation.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tenant Company Accounts</span>
              </div>
              <p className="text-[11px] text-slate-400">Isolated database environments per company backed by PostgreSQL Row-Level Security.</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <Sliders className="w-4 h-4 text-teal-400" />
                <span>AI Screening & Interview Workflows</span>
              </div>
              <p className="text-[11px] text-slate-400">Automated candidate ranking, role weighting sliders, and technical rubric generation.</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Compliance & Executive ROI Dashboards</span>
              </div>
              <p className="text-[11px] text-slate-400">Statistical bias audit graphs and real-time company productivity analytics.</p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Clean B2B Auth Form (7-Cols) */}
        <div className="lg:col-span-7 max-w-xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-6"
          >
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode("login"); setForgotMsg(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setForgotMsg(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Create Work Account
              </button>
            </div>

            {/* Title Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {mode === "forgot"
                  ? "Reset your password"
                  : mode === "register"
                  ? "Register your Work Account"
                  : "Welcome Back"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === "forgot"
                  ? "Enter your business email to receive a password reset link."
                  : mode === "register"
                  ? "Create a multi-tenant company account to launch your AI hiring copilot."
                  : "Enter your company credentials to access your workspace."}
              </p>
            </div>

            {/* Role Workspace Selector (Login Mode Only) */}
            {mode === "login" && (
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Portal Role
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {B2B_ROLES.map((item) => {
                    const Icon = item.icon;
                    const isSelected = role === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleSelect(item)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className="text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-white/80 border border-slate-200">
                            {item.tag}
                          </span>
                        </div>
                        <span className="text-xs font-bold tracking-tight block">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mode === "forgot") {
                  onAuth({ mode: "forgot", email }).then((m) => m && setForgotMsg(m));
                } else {
                  onAuth({
                    mode: mode === "register" ? "register" : "login",
                    email,
                    password,
                    name: agencyName || "Apex Recruitment",
                    role: mode === "register" ? "recruiter" : role
                  });
                }
              }}
              className="space-y-4"
            >
              {mode === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Company Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Apex Recruitment Partners"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Region / Primary Hiring Vertical</label>
                    <select
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={regionVertical}
                      onChange={(e) => setRegionVertical(e.target.value)}
                    >
                      <option value="Bangalore / Tech Recruitment">Bangalore / India Tech Recruitment</option>
                      <option value="Campus Hiring Drive">High-Volume Campus Hiring Drive</option>
                      <option value="Executive Search">Executive & Leadership Search</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Business Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    required
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {mode === "register" && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">Please use a valid work domain email address.</span>
                )}
              </div>

              {mode !== "forgot" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setForgotMsg(""); }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      required
                      type="password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {mode === "forgot" && (
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setForgotMsg(""); }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}

              {/* Error or Success Messages */}
              {(error || forgotMsg) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                  {error || forgotMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Working..." : mode === "forgot" ? "Send Password Reset Link" : mode === "login" ? `Sign In to Workspace` : "Create Work Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 font-mono border-t border-slate-100">
              Demo use only: <span className="text-slate-600 font-semibold">Recruiter123!</span> · <span className="text-slate-600 font-semibold">Interviewer123!</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-400 py-2 border-t border-slate-200/60">
        © 2026 HireFlow AI Inc. B2B Multi-Tenant Platform Gateway.
      </footer>
    </div>
  );
}
