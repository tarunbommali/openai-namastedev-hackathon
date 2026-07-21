import React, { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import {
  ShieldCheck,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Bot,
  UserCheck,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Database,
  Lock,
  ExternalLink
} from "lucide-react";
import { api } from "../api";

export default function ComplianceAuditPage({ token, onBack }) {
  const [logs, setLogs] = useState([
    {
      id: "aud_9001",
      timestamp: "2026-07-20 14:22:10 IST",
      candidate: "Rohan Sharma",
      jobTitle: "Senior Backend Engineer",
      aiVerdict: "Hire",
      aiScore: 92,
      humanVerdict: "Hire",
      isOverride: false,
      overrideReason: "AI recommendation aligned with interviewer coding score.",
      traceId: "tr_exec_8831"
    },
    {
      id: "aud_9002",
      timestamp: "2026-07-20 13:45:02 IST",
      candidate: "Priya Patel",
      jobTitle: "Campus Tech Trainee",
      aiVerdict: "Hold",
      aiScore: 74,
      humanVerdict: "Hire",
      isOverride: true,
      overrideReason: "Upgraded due to exceptional competitive programming awards missing from PDF resume text parser.",
      traceId: "tr_exec_8832"
    },
    {
      id: "aud_9003",
      timestamp: "2026-07-20 12:10:44 IST",
      candidate: "Ankit Verma",
      jobTitle: "DevOps / Infrastructure Lead",
      aiVerdict: "Reject",
      aiScore: 42,
      humanVerdict: "Reject",
      isOverride: false,
      overrideReason: "Lacks required Kubernetes production cluster management experience.",
      traceId: "tr_exec_8833"
    },
    {
      id: "aud_9004",
      timestamp: "2026-07-20 10:15:30 IST",
      candidate: "Neha Gupta",
      jobTitle: "Senior Backend Engineer",
      aiVerdict: "Hire",
      aiScore: 88,
      humanVerdict: "Hold",
      isOverride: true,
      overrideReason: "Candidate requested delayed start date; holding for Q4 team headcount approval.",
      traceId: "tr_exec_8834"
    }
  ]);

  const [dateFilter, setDateFilter] = useState("30d");
  const [jobFilter, setJobFilter] = useState("all");
  const [overrideFilter, setOverrideFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [msg, setMsg] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (searchQuery && !log.candidate.toLowerCase().includes(searchQuery.toLowerCase()) && !log.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (overrideFilter === "override_only" && !log.isOverride) return false;
    if (overrideFilter === "aligned_only" && log.isOverride) return false;
    return true;
  });

  const SAMPLE_AGENT_CHAIN = [
    { agent: "1. Intent Parsing Agent", action: "Extracted role requirements & seniority weights", status: "Success", duration: "140ms" },
    { agent: "2. Resume Screening Agent", action: "Parsed PDF document & extracted skill vector", status: "Success", duration: "210ms" },
    { agent: "3. Skill Matching Agent", action: "Calculated 92% weighted vector similarity match score", status: "Success", duration: "180ms" },
    { agent: "4. Question Gen Agent", action: "Generated technical prompts for Redis & Distributed Systems", status: "Success", duration: "310ms" },
    { agent: "5. Scheduling Agent", action: "Assigned slot for Wednesday 2:30 PM IST with Lead Interviewer", status: "Success", duration: "110ms" },
    { agent: "6. Decision Engine Agent", action: "Aggregated 4/5 interviewer rubric ratings and recommended HIRE", status: "Success", duration: "90ms" },
    { agent: "7. Offer & Audit Agent", action: "Generated offer letter draft & signed HMAC audit record", status: "Success", duration: "150ms" }
  ];

  const getVerdictBadge = (verdict) => {
    if (verdict === "Hire") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (verdict === "Hold") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <PageContainer className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Portal Workspace
            </button>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Regulatory & Legal Compliance Vault
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Compliance & Decision Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable audit logging for candidate screening, human recruiter overrides, and multi-agent execution traces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/compliance/bias-report"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 text-decoration-none"
          >
            <Download className="w-4 h-4" /> Export Bias Report (CSV/PDF)
          </a>
        </div>
      </header>

      {/* Summary Header (3 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">100% Compliant</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">99.4%</div>
          <div className="text-xs font-medium text-slate-500">Overall Bias Audit Pass Rate (DPDP / NYC LL144)</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <Activity className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Score Distribution</span>
          </div>
          <div className="flex items-center gap-2 pt-1 font-mono text-xs">
            <span className="text-emerald-700 font-bold">High: 62%</span>
            <span className="text-amber-700 font-bold">Mid: 28%</span>
            <span className="text-rose-700 font-bold">Low: 10%</span>
          </div>
          <div className="text-xs font-medium text-slate-500">Candidate Match Score Distribution</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Logged & Audited</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">42 Overrides</div>
          <div className="text-xs font-medium text-slate-500">Human Recruiter Override Logged Count</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search candidate or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Quarter to Date</option>
        </select>

        <select
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
          value={overrideFilter}
          onChange={(e) => setOverrideFilter(e.target.value)}
        >
          <option value="all">All Verdicts</option>
          <option value="override_only">Human Overridden Only</option>
          <option value="aligned_only">AI Verdict Accepted Only</option>
        </select>

        <div className="flex items-center justify-end text-xs font-mono text-slate-400">
          Showing {filteredLogs.length} Log Entries
        </div>
      </div>

      {/* Decision Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Decision Audit Log</h2>
          <span className="text-xs text-slate-400 font-mono">HMAC SHA-256 Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">AI Recommendation</th>
                <th className="p-3">Human Final Verdict</th>
                <th className="p-3">Override Reason / Audit Log</th>
                <th className="p-3 text-right">Agent Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{log.candidate}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {log.id}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{log.jobTitle}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getVerdictBadge(log.aiVerdict)}`}>
                      {log.aiVerdict} ({log.aiScore}%)
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getVerdictBadge(log.humanVerdict)}`}>
                        {log.humanVerdict}
                      </span>
                      {log.isOverride && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                          Override
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 italic leading-relaxed max-w-xs">
                      "{log.overrideReason}"
                    </p>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedTrace(log)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 font-semibold rounded-md text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" /> Inspect Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Trace Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">CrewAI 7-Agent Execution Trace</h3>
                  <p className="text-xs text-slate-500">Trace ID: <span className="font-mono text-indigo-600">{selectedTrace.traceId}</span> for candidate <strong className="text-slate-900">{selectedTrace.candidate}</strong></p>
                </div>
              </div>
              <button onClick={() => setSelectedTrace(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Visual Step-by-Step Node Chain */}
            <div className="space-y-3 font-mono text-xs">
              {SAMPLE_AGENT_CHAIN.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 relative pl-8 before:absolute before:left-3 before:top-4 before:w-2.5 before:h-2.5 before:rounded-full before:bg-indigo-600">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{step.agent}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{step.duration}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">{step.status}</span>
                    </div>
                  </div>
                  <p className="font-sans text-[11px] text-slate-600">{step.action}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                Close Trace Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
