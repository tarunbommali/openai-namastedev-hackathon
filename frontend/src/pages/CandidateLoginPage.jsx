import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  UserCheck, KeyRound, Mail, User, Globe, CheckCircle2,
  Eye, EyeOff, ArrowLeft, Code2
} from "lucide-react";

const SKILLS = ["React", "Node.js", "Python", "Go", "System Design", "DSA", "DevOps"];

export default function CandidateLoginPage({ onAuth, onRegisterCandidate, loading, error }) {
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
    firstName: "",
    lastName: "",
    email: "",
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
    if (!reg.firstName.trim()) return setRegError("First name is required.");
    if (!reg.lastName.trim()) return setRegError("Last name is required.");
    if (!reg.email.trim()) return setRegError("Email is required.");
    if (reg.password.length < 8) return setRegError("Password must be at least 8 characters.");
    if (reg.password !== reg.confirmPassword) return setRegError("Passwords do not match.");

    const fullName = `${reg.firstName.trim()} ${reg.lastName.trim()}`;

    await onRegisterCandidate({
      name: fullName,
      firstName: reg.firstName.trim(),
      lastName: reg.lastName.trim(),
      email: reg.email.trim(),
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
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-base tracking-tight">HireFlow</span>
          <span className="font-black text-teal-600 text-base">/Candidates</span>
        </button>

        <button
          onClick={() => navigate("/access-type")}
          className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Access type
        </button>

        <button
          onClick={() => navigate("/work/login")}
          className="ml-4 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
        >
          Company Login →
        </button>
      </header>

      {/* ── Two-panel layout (reversed: dark left, form right) ── */}
      <div className="flex-1 flex">
        {/* ─── LEFT: Dark visual panel ─── */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-slate-900 px-12 py-16 text-white relative overflow-hidden">
          {/* decorative bg */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-teal-600/15 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-52 h-52 bg-indigo-600/20 rounded-full translate-x-1/4 translate-y-1/4 blur-2xl pointer-events-none" />

          <div className="max-w-sm text-center space-y-8 relative">
            {/* Globe icon */}
            <div className="inline-flex items-center justify-center relative">
              <div className="w-28 h-28 rounded-full border-2 border-teal-600/30 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full border-2 border-teal-400/50 flex items-center justify-center">
                  <Globe className="w-10 h-10 text-teal-400" />
                </div>
              </div>
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-teal-400" />
              <span className="absolute bottom-3 left-1 w-2 h-2 rounded-full bg-indigo-400" />
              <span className="absolute top-8 left-0 w-1.5 h-1.5 rounded-full bg-white/30" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold leading-tight">
                Your tech career,
                <br />
                <span className="text-teal-400">AI-accelerated.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get matched to top tech companies. Receive instant AI-evaluated feedback on your
                resume and interviews.
              </p>
            </div>

            {/* Skill pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-semibold text-teal-300 bg-teal-900/50 border border-teal-700/50 px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Perks */}
            <div className="space-y-2.5 text-left border-t border-white/10 pt-5">
              {[
                "Instant AI resume score & gap analysis",
                "Real-time interview feedback from AI copilot",
                "Track applications across hundreds of companies"
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Auth Form ─── */}
        <div className="flex-1 flex items-start justify-center pt-14 pb-12 px-8 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6">

            {/* ── Forgot sub-view ── */}
            {forgotMode ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your email to receive a reset link.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="you@email.com"
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
                  className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#0f766e" }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
                <button
                  onClick={() => { setForgotMode(false); setForgotMsg(""); }}
                  className="text-xs text-teal-600 hover:underline font-semibold"
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
                    className={`pb-2.5 mr-6 text-sm font-semibold transition-colors ${mode === "login"
                      ? "border-b-2 border-teal-600 text-teal-600"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Candidate Login
                  </button>
                  <button
                    onClick={() => setMode("register")}
                    className={`pb-2.5 text-sm font-semibold transition-colors ${mode === "register"
                      ? "border-b-2 border-teal-600 text-teal-600"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* ════════════ CANDIDATE LOGIN ════════════ */}
                {mode === "login" && (
                  <form onSubmit={handleLogin} className="space-y-5">


                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          placeholder="you@email.com"
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
                          className="text-xs text-teal-600 hover:underline font-semibold"
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
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
                      className="w-full py-3 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: "#0f766e" }}
                    >
                      {loading ? "Signing in…" : "Sign In"}
                    </button>

                    <p className="text-sm text-slate-500 text-center">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Create Account
                      </button>
                    </p>

                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <div className="flex-1 h-px bg-slate-200" />
                      or
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/work/login")}
                      className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Company / Recruiter Login →
                    </button>
                  </form>
                )}

                {/* ════════════ CANDIDATE REGISTRATION ════════════ */}
                {mode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">


                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            autoComplete="given-name"
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            placeholder="Jane"
                            value={reg.firstName}
                            onChange={(e) => updateReg("firstName", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            autoComplete="family-name"
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            placeholder="Candidate"
                            value={reg.lastName}
                            onChange={(e) => updateReg("lastName", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          placeholder="jane@email.com"
                          value={reg.email}
                          onChange={(e) => updateReg("email", e.target.value)}
                        />
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
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          placeholder="Repeat password"
                          value={reg.confirmPassword}
                          onChange={(e) => updateReg("confirmPassword", e.target.value)}
                        />
                      </div>
                    </div>

                    {(regError || error) && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 font-semibold">
                        {regError || error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: "#0f766e" }}
                    >
                      {loading ? "Creating account…" : "Create Candidate Account"}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      By creating an account you agree to our{" "}
                      <Link to="/terms" className="text-teal-600 underline font-semibold">Terms & Conditions</Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-teal-600 underline font-semibold">Privacy Policy</Link>.
                    </p>

                    <p className="text-sm text-slate-500 text-center">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-teal-600 font-semibold hover:underline"
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
      </div>
    </div>
  );
}
