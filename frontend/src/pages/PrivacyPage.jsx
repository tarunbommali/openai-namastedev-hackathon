import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">H</span>
            <span>HireFlow</span>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 flex-1">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" /> Privacy & Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 2026 • Security Certified</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              1. Information We Collect
            </h2>
            <p>
              We collect information provided directly by candidates and recruiter accounts, including name, email address, resume files, skills, professional experience, and application data required for recruitment evaluation.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              2. How Data is Used
            </h2>
            <p>
              Candidate data is utilized exclusively for job matching, candidate portal management, interview scheduling, and application status updates. We do not sell, rent, or trade your personal information to third-party data brokers.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              3. Data Security & Storage
            </h2>
            <p>
              All data transmitted to and stored by HireFlow is encrypted using TLS 1.3 in transit and AES-256 at rest. Access control policy enforces role-based security ensuring candidates only access their own profiles and applications.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              4. Candidate Data Rights
            </h2>
            <p>
              Candidates maintain full control over their uploaded resume and profile information, with rights to request data export, profile updates, or account deletion at any time by contacting privacy@hireflow.ai.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 HireFlow Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-slate-300">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
