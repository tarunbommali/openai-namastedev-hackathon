import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Cpu, KeyRound, Mail, Building2, Globe, Users, Briefcase,
  MapPin, Eye, EyeOff, ArrowLeft, CheckCircle2
} from "lucide-react";

const INDUSTRIES = [
  "Technology", "Staffing & Recruitment", "BFSI", "E-Commerce",
  "EdTech", "Healthcare", "Manufacturing", "Other"
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Singapore",
  "Australia", "Canada", "Germany", "Other"
];

export default function WorkLoginPage({ onAuth, onRegisterCompany, loading, error, apiOnline }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get("mode") === "register" ? "register" : "login"
  );

  // ── Login state ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // ── Registration state ──
  const [reg, setReg] = useState({
    companyName: "",
    companyEmail: "",
    companyDomain: "",
    industry: "",
    companySize: "",
    country: "India",
    password: "",
    confirmPassword: ""
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [regError, setRegError] = useState("");

  function updateReg(field, value) {
    setReg((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogin(e) {
    e?.preventDefault();
    await onAuth({ mode: "login", email, password });
  }

  async function handleForgot(e) {
    e?.preventDefault();
    const msg = await onAuth({ mode: "forgot", email });
    if (msg) setForgotMsg(msg);
  }

  async function handleRegister(e) {
    e?.preventDefault();
    setRegError("");
    if (!reg.companyName.trim()) return setRegError("Company name is required.");
    if (!reg.companyEmail.trim()) return setRegError("Company email is required.");
    if (!reg.industry) return setRegError("Please select your industry.");
    if (!reg.companySize) return setRegError("Please select your company size.");
    if (!reg.country) return setRegError("Please select your country.");
    if (reg.password.length < 8) return setRegError("Password must be at least 8 characters.");
    if (reg.password !== reg.confirmPassword) return setRegError("Passwords do not match.");

    await onRegisterCompany({
      companyName: reg.companyName.trim(),
      email: reg.companyEmail.trim(),
      domain: reg.companyDomain.trim() || undefined,
      industry: reg.industry,
      size: reg.companySize,
      country: reg.country,
      password: reg.password
    });
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 h-14 px-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-base tracking-tight">HireFlow</span>
          <span className="font-black text-indigo-600 text-base">/Work</span>
        </button>

        <button
          onClick={() => navigate("/access-type")}
          className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Access type
        </button>

        <div
          className={`ml-4 hidden sm:flex items-center gap-1.5 text-xs font-mono ${
            apiOnline ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          API {apiOnline ? "Online" : "Offline"}
        </div>
      </header>

      {/* ── Two-panel layout ── */}
      <div className="flex-1 flex">
        {/* ─── LEFT: Form ─── */}
        <div className="flex-1 flex items-start justify-center pt-14 pb-12 px-8 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6">

            {/* ── Forgot password sub-view ── */}
            {forgotMode ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your company email to receive a reset link.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Company Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {forgotMsg && (
                  <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {forgotMsg}
                  </div>
                )}

                <button
                  onClick={handleForgot}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
                <button
                  onClick={() => { setForgotMode(false); setForgotMsg(""); }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  ← Back to login
                </button>
              </>
            ) : (
              <>
                {/* ── Tab row ── */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setMode("login")}
                    className={`pb-2.5 mr-6 text-sm font-semibold transition-colors ${
                      mode === "login"
                        ? "border-b-2 border-indigo-600 text-indigo-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("register")}
                    className={`pb-2.5 text-sm font-semibold transition-colors ${
                      mode === "register"
                        ? "border-b-2 border-indigo-600 text-indigo-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Create Work Account
                  </button>
                </div>

                {/* ════════════ LOGIN FORM ════════════ */}
                {mode === "login" && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <p className="text-sm text-slate-500">
                        Sign in to your company workspace. Your role is determined automatically.
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Company Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotMode(true)}
                          className="text-xs text-indigo-600 hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPw ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 font-semibold">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? "Signing in…" : "Sign In"}
                    </button>

                    <p className="text-sm text-slate-500 text-center">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Create Work Account
                      </button>
                    </p>

                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <div className="flex-1 h-px bg-slate-200" />
                      or
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/candidate/login")}
                      className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Developer? Sign in here →
                    </button>
                  </form>
                )}

                {/* ════════════ REGISTRATION FORM ════════════ */}
                {mode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Create your company workspace. You'll become the Company Admin and can
                        invite recruiters and interviewers.
                      </p>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Company Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Acme Recruiting Pvt. Ltd."
                          value={reg.companyName}
                          onChange={(e) => updateReg("companyName", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Company Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Company Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="admin@acme.com"
                          value={reg.companyEmail}
                          onChange={(e) => updateReg("companyEmail", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Company Domain — optional */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Company Domain{" "}
                        <span className="text-slate-400 font-normal normal-case">(optional)</span>
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="acme.com"
                          value={reg.companyDomain}
                          onChange={(e) => updateReg("companyDomain", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Industry + Company Size — 2 col */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Industry <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <select
                            required
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white appearance-none"
                            value={reg.industry}
                            onChange={(e) => updateReg("industry", e.target.value)}
                          >
                            <option value="">Select…</option>
                            {INDUSTRIES.map((i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Size <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                          <select
                            required
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white appearance-none"
                            value={reg.companySize}
                            onChange={(e) => updateReg("companySize", e.target.value)}
                          >
                            <option value="">Select…</option>
                            {COMPANY_SIZES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Country <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <select
                          required
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white appearance-none"
                          value={reg.country}
                          onChange={(e) => updateReg("country", e.target.value)}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPw ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="At least 8 characters"
                          value={reg.password}
                          onChange={(e) => updateReg("password", e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPw((v) => !v)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          autoComplete="new-password"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Repeat password"
                          value={reg.confirmPassword}
                          onChange={(e) => updateReg("confirmPassword", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Errors */}
                    {(regError || error) && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 font-semibold">
                        {regError || error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? "Creating workspace…" : "Create Work Account"}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      By creating an account you agree to our Terms of Service and Privacy Policy.
                    </p>

                    <p className="text-sm text-slate-500 text-center">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Info panel ─── */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-slate-50 px-12 py-16 border-l border-slate-200">
          <div className="max-w-sm w-full space-y-8">
            {mode === "register" ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    What you get
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
                    Your company workspace,<br />ready in minutes.
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "Company Admin role", desc: "Full control over users, jobs, and billing." },
                    { title: "Invite your team", desc: "Add Recruiters and Interviewers from your dashboard." },
                    { title: "AI hiring pipeline", desc: "Multi-agent screening from day one — no setup required." },
                    { title: "Tenant isolation", desc: "Your data is fully isolated from other companies." }
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Did you know?
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-900 leading-snug">
                    HireFlow AI shortlists one candidate every{" "}
                    <span className="text-indigo-600">3 seconds.</span>
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Thank you for choosing HireFlow AI.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300">
                  {[
                    { value: "78%", label: "Faster shortlist" },
                    { value: "500+", label: "Resumes / min" },
                    { value: "100%", label: "Bias audited" }
                  ].map((stat, i) => (
                    <div key={i} className={`text-center ${i === 1 ? "border-x border-slate-300" : ""}`}>
                      <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
