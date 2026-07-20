import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu, Building2, UserCheck, ArrowRight } from "lucide-react";

export default function AccessTypePage({ apiOnline }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans antialiased flex flex-col">
      {/* ── Slim header ── */}
      <header className="border-b border-slate-200 h-16 px-6 lg:px-10 flex items-center justify-between sticky top-0 bg-white z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">HireFlow</span>
          <span className="font-black text-indigo-600 text-lg">AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
          <a href="/" className="hover:text-slate-900 transition-colors">Product</a>
          <a href="/" className="hover:text-slate-900 transition-colors">Docs</a>
        </nav>

        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs font-mono ${
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
          <button
            onClick={() => navigate("/work/login")}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/work/login?mode=register")}
            className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Request Demo
          </button>
        </div>
      </header>

      {/* ── Two-column chooser ── */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT — For Companies */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center px-8 py-20 border-r border-slate-200 hover:bg-slate-50/70 transition-colors"
        >
          <div className="max-w-xs text-center space-y-7">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              Business
            </span>

            <div>
              <h2 className="text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                For Companies
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                Hire, screen, interview and manage software engineers using
                AI-powered recruiting workflows.
              </p>
            </div>

            {/* Login button */}
            <button
              onClick={() => navigate("/work/login")}
              className="w-full py-3 rounded bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Login
            </button>

            {/* Register link */}
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/work/login?mode=register")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Create Work Account
              </button>
            </p>
          </div>
        </motion.div>

        {/* RIGHT — For Developers */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center px-8 py-20 hover:bg-slate-50/70 transition-colors"
        >
          <div className="max-w-xs text-center space-y-7">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-teal-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              <UserCheck className="w-3.5 h-3.5" />
              Developer
            </span>

            <div>
              <h2 className="text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                For Developers
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                Apply for software engineering jobs, upload your resume, track
                interview status and receive offers.
              </p>
            </div>

            {/* Login button */}
            <button
              onClick={() => navigate("/candidate/login")}
              className="w-full py-3 rounded bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Login
            </button>

            {/* Register link */}
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/candidate/login?mode=register")}
                className="text-teal-600 font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Subtle bg glow — non-interactive */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
