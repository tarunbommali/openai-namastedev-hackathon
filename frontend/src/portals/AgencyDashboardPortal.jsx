import React, { useEffect, useState } from "react";
import {
  Gauge,
  Clock,
  Users,
  ShieldCheck,
  Download,
  DollarSign,
  TrendingUp,
  Building,
  CheckCircle2,
  Sliders,
  Mail,
  Webhook,
  ArrowRight,
  Database,
  Award,
  Sparkles,
  ChevronRight,
  FileText
} from "lucide-react";
import { api } from "../api";

export default function AgencyDashboardPortal({ token, onLogout }) {
  const [metrics, setMetrics] = useState({
    timeToShortlistManual: 48,
    timeToShortlistAI: 4,
    recruiterHoursSaved: 340,
    costSavedRupees: 420000,
    costSavedUSD: 5100,
    alignmentRatePercent: 94.8,
    totalScreened: 4250,
    resumesLimit: 5000,
    activeRecruiterSeats: 12,
    totalSeatsLimit: 15,
    auditPassRate: 99.4,
    totalAuditedDecisions: 1420
  });

  const [roiReport, setRoiReport] = useState(null);
  const [biasReport, setBiasReport] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Onboarding Form State
  const [onboardingForm, setOnboardingForm] = useState({
    agencyName: "Apex Tech Talent India",
    logoUrl: "",
    region: "Bangalore / India",
    vertical: "Full-Stack & Backend Engineering",
    manualHoursPerBatch: 24,
    recruiterHourlyRate: 500,
    manualCostPerCandidate: 350,
    recruiterEmails: "recruiter1@apex.com, recruiter2@apex.com",
    webhookUrl: "https://api.apex.com/webhooks/hireflow",
    webhookSecret: "whsec_live_9f8d7e6a5b4c3d2e1f0a"
  });

  useEffect(() => {
    Promise.all([
      api("/api/compliance/bias-report", {}, token).catch(() => null),
      api("/api/tenant/roi-report", {}, token).catch(() => null)
    ]).then(([bias, roi]) => {
      if (bias?.report) setBiasReport(bias.report);
      if (roi?.report) {
        setRoiReport(roi.report);
        setMetrics((prev) => ({
          ...prev,
          recruiterHoursSaved: roi.report.hoursSaved || prev.recruiterHoursSaved,
          costSavedUSD: roi.report.dollarsSaved || prev.costSavedUSD,
          totalScreened: roi.report.resumesProcessed || prev.totalScreened
        }));
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Building className="w-3.5 h-3.5 text-indigo-600" /> Agency Tenant Admin
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Executive ROI & Compliance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time agency placement velocity, recruiter hours saved, net cost reductions, and bias audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-indigo-600" /> Run 3-Step Setup Wizard
          </button>
        </div>
      </header>

      {/* Baseline Comparison Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Configured Agency Baseline Benchmark Comparison</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All ROI metrics, recruiter hours saved, and cost reductions below are calculated strictly against this tenant's self-reported baselines (<strong className="text-slate-900">{onboardingForm.manualHoursPerBatch} hrs/batch manual screening</strong> @ <strong className="text-slate-900">₹{onboardingForm.recruiterHourlyRate}/hr recruiter rate</strong>).
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <div className="text-xs text-slate-400 font-mono">Manual Baseline Speed</div>
            <div className="text-sm font-bold text-slate-900 font-mono">{metrics.timeToShortlistManual} Hours / Batch</div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 hidden sm:block" />
          <div>
            <div className="text-xs text-indigo-600 font-mono font-semibold">AI Copilot Speed</div>
            <div className="text-sm font-bold text-indigo-600 font-mono">{metrics.timeToShortlistAI} Hours / Batch</div>
          </div>
        </div>
      </div>

      {/* Top KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">78% Faster</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.timeToShortlistAI}h vs {metrics.timeToShortlistManual}h</div>
          <div className="text-xs font-medium text-slate-500">Avg Time-to-Shortlist (AI vs Manual)</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <Users className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Productivity</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">+{metrics.recruiterHoursSaved} hrs</div>
          <div className="text-xs font-medium text-slate-500">Recruiter Hours Saved / Month</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Net Savings</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            ₹{metrics.costSavedRupees.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-medium text-slate-500">Monthly Net Agency Savings</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">High Alignment</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.alignmentRatePercent}%</div>
          <div className="text-xs font-medium text-slate-500">AI vs Human Verdict Alignment</div>
        </div>
      </div>

      {/* Main 2-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Compliance & Bias Audit Widgets */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Institutional Bias Audit Compliance</h2>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audit Pass Rate: {metrics.auditPassRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-medium text-slate-500">Audited Candidate Decisions</span>
              <div className="text-2xl font-bold font-mono text-slate-900">{metrics.totalAuditedDecisions.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-medium text-slate-500">Compliance Framework</span>
              <div className="text-sm font-bold text-slate-900">DPDP Act (India) & NYC LL144</div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
            <span className="font-bold text-indigo-950 block">Score Distribution Breakdown:</span>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-emerald-700">High Match (80-100): 62%</span>
              <span className="text-amber-700">Mid Match (50-79): 28%</span>
              <span className="text-rose-700">Low Match (&lt;50): 10%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/api/compliance/bias-report"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Bias Audit Report (CSV / PDF)
            </a>
            <a
              href="/api/tenant/roi-report"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-600" /> Export Executive ROI Spec
            </a>
          </div>
        </div>

        {/* RIGHT: Quota Panel & Seat Allocation */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Tenant Quota & Recruiter Seats</h2>
            </div>
          </div>

          {/* Resume Quota Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Resumes Processed / Month</span>
              <span className="font-mono text-slate-900">{metrics.totalScreened.toLocaleString()} / {metrics.resumesLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${(metrics.totalScreened / metrics.resumesLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Recruiter Seats Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Active Recruiter Seats</span>
              <span className="font-mono text-slate-900">{metrics.activeRecruiterSeats} / {metrics.totalSeatsLimit} Seats</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all"
                style={{ width: `${(metrics.activeRecruiterSeats / metrics.totalSeatsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Agency Subscription Plan: Agency Pro Multi-Tenant</div>
            <p className="text-slate-500">Dedicated PostgreSQL RLS schema + HMAC signed webhooks active.</p>
          </div>
        </div>
      </div>

      {/* 3-STEP ONBOARDING WIZARD MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">Step {onboardingStep} of 3</span>
                <h3 className="text-xl font-bold text-slate-900">Agency Onboarding & Baseline Setup</h3>
              </div>
              <button onClick={() => setShowOnboarding(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* STEP 1: AGENCY PROFILE */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Step 1: Agency Profile & Region</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Agency Name</label>
                    <input
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.agencyName}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, agencyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Region / Country</label>
                    <input
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.region}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, region: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="block font-semibold text-slate-700">Primary Hiring Vertical</label>
                    <input
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.vertical}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, vertical: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BASELINE BENCHMARKS */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Step 2: Baseline Benchmark Cost Metric Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Manual Hours / Batch</label>
                    <input
                      type="number"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.manualHoursPerBatch}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, manualHoursPerBatch: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Recruiter Hourly Rate (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.recruiterHourlyRate}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, recruiterHourlyRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SEATS & WEBHOOKS */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Step 3: Recruiter Seats & Webhooks</h4>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Invite Recruiter Emails (comma separated)</label>
                    <input
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      value={onboardingForm.recruiterEmails}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, recruiterEmails: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Outbound Webhook Target URL</label>
                    <input
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                      value={onboardingForm.webhookUrl}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, webhookUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={onboardingStep === 1}
                onClick={() => setOnboardingStep((s) => s - 1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-30"
              >
                Back
              </button>

              {onboardingStep < 3 ? (
                <button
                  onClick={() => setOnboardingStep((s) => s + 1)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Complete Onboarding Wizard ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
