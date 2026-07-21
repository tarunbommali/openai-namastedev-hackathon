import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5" /> Legal & Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms and Conditions</h1>
          <p className="text-slate-400 text-sm">Last updated: July 2026 • Version 2.4</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, accessing, or using HireFlow’s talent platform and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access or use the platform.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              2. Candidate & Enterprise User Responsibilities
            </h2>
            <p>
              Candidates are responsible for providing truthful, accurate, and up-to-date resume data, professional history, and contact details. Enterprise users and recruiters agree to evaluate candidates in accordance with applicable labor regulations and anti-discrimination standards.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              3. Platform & Service Availability
            </h2>
            <p>
              We strive to maintain continuous platform availability and automated service operations. HireFlow reserves the right to modify, update, or temporarily suspend access to features for routine maintenance, security enhancements, or platform upgrades.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              4. Intellectual Property
            </h2>
            <p>
              All trademarks, platform branding, codebases, software interfaces, and proprietary algorithms hosted on HireFlow are the exclusive intellectual property of HireFlow and its licensors.
            </p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              5. Limitation of Liability
            </h2>
            <p>
              HireFlow shall not be held liable for indirect, incidental, or consequential damages resulting from platform usage, candidate selection decisions, or third-party service interruptions.
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
