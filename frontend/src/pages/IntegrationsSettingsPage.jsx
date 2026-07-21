import React, { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import {
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Code2,
  RefreshCw,
  Trash2,
  Edit2,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronRight,
  Database,
  Lock
} from "lucide-react";
import { api } from "../api";

export default function IntegrationsSettingsPage({ token, onBack }) {
  const [webhooks, setWebhooks] = useState([
    {
      id: "wh_101",
      url: "https://api.apexrecruitment.in/webhooks/hireflow",
      events: ["job.created", "candidate.screened", "verdict.overridden"],
      isActive: true,
      secret: "whsec_live_9f8d7e6a5b4c3d2e1f0a",
      lastDelivery: "2 mins ago",
      lastStatus: 200
    },
    {
      id: "wh_102",
      url: "https://ats.campuspartner.edu/api/events",
      events: ["candidate.screened", "interview.scheduled"],
      isActive: true,
      secret: "whsec_live_4b3c2a1f0e9d8c7b6a5f",
      lastDelivery: "1 hour ago",
      lastStatus: 200
    }
  ]);

  const [activeTab, setActiveTab] = useState("nodejs");
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Drawer / Modal State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [webhookForm, setWebhookForm] = useState({
    url: "",
    events: ["candidate.screened", "verdict.overridden"],
    secret: "whsec_live_" + Math.random().toString(36).substring(2, 15)
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const AVAILABLE_EVENTS = [
    { id: "job.created", label: "job.created (When a new client role is published)" },
    { id: "candidate.screened", label: "candidate.screened (When AI screening finishes)" },
    { id: "interview.scheduled", label: "interview.scheduled (When an interview slot is booked)" },
    { id: "verdict.overridden", label: "verdict.overridden (When a recruiter overrides AI verdict)" },
    { id: "offer.created", label: "offer.created (When an offer letter is issued)" }
  ];

  function handleCopySecret(secretText) {
    navigator.clipboard.writeText(secretText);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  function handleSaveWebhook() {
    if (!webhookForm.url.trim()) return;
    if (editingWebhook) {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === editingWebhook.id ? { ...w, ...webhookForm } : w))
      );
      setMsg("Webhook endpoint updated successfully");
    } else {
      setWebhooks((prev) => [
        ...prev,
        {
          id: "wh_" + Math.floor(Math.random() * 1000),
          url: webhookForm.url,
          events: webhookForm.events,
          isActive: true,
          secret: webhookForm.secret,
          lastDelivery: "Never",
          lastStatus: 200
        }
      ]);
      setMsg("New webhook endpoint added successfully");
    }
    setDrawerOpen(false);
    setEditingWebhook(null);
  }

  function handleToggleWebhook(id) {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  }

  function handleDeleteWebhook(id) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    setMsg("Webhook deleted");
  }

  const NODE_SNIPPET = `// Node.js (Express) - HMAC Webhook Signature Verification
const crypto = require('crypto');

app.post('/webhooks/hireflow', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hireflow-signature'];
  const secret = process.env.HIREFLOW_WEBHOOK_SECRET;

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== hmac) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  const event = JSON.parse(req.body);
  console.log('Verified Event:', event.eventType, event.payload);
  res.status(200).json({ received: true });
});`;

  const PYTHON_SNIPPET = `# Python (FastAPI / Flask) - HMAC Webhook Verification
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/hireflow")
async def handle_hireflow_webhook(request: Request):
    signature = request.headers.get("X-HireFlow-Signature")
    secret = "whsec_live_9f8d7e6a5b4c3d2e1f0a"
    body = await request.body()

    expected_signature = hmac.new(
        secret.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature or "", expected_signature):
        raise HTTPException(status_code=401, detail="Invalid HMAC Signature")

    data = await request.json()
    print("Verified Event Payload:", data)
    return {"status": "success"}`;

  return (
    <PageContainer className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased space-y-8">
      {/* Top Navigation Bar */}
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
            <Webhook className="w-3.5 h-3.5 text-indigo-600" /> Outbound Webhooks & HMAC Integrations
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Integration & Webhook Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated HMAC-signed outbound events (`candidate.screened`, `verdict.overridden`) for client ATS sync without dev assistance.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWebhook(null);
            setWebhookForm({
              url: "",
              events: ["candidate.screened", "verdict.overridden"],
              secret: "whsec_live_" + Math.random().toString(36).substring(2, 15)
            });
            setDrawerOpen(true);
          }}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Webhook Endpoint
        </button>
      </header>

      {/* Notifications */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Webhooks Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Active Webhook Endpoints ({webhooks.length})</h2>
          <span className="text-xs text-slate-400 font-mono">HMAC SHA-256 Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3">Endpoint URL</th>
                <th className="p-3">Subscribed Events</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Delivery</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
                      {wh.url}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">Secret ID: {wh.id}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleWebhook(wh.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        wh.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {wh.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className={`w-2 h-2 rounded-full ${wh.lastStatus === 200 ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="font-bold">{wh.lastStatus} OK</span>
                      <span className="text-slate-400">({wh.lastDelivery})</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingWebhook(wh);
                          setWebhookForm({ url: wh.url, events: wh.events, secret: wh.secret });
                          setDrawerOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Edit Endpoint"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Endpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer HMAC Verification Code Snippet Panel */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">X-HireFlow-Signature HMAC Verification Snippets</h3>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab("nodejs")}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                activeTab === "nodejs" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Node.js Express
            </button>
            <button
              onClick={() => setActiveTab("python")}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                activeTab === "python" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Python FastAPI / Flask
            </button>
          </div>
        </div>

        <pre className="bg-slate-950 text-indigo-300 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
          {activeTab === "nodejs" ? NODE_SNIPPET : PYTHON_SNIPPET}
        </pre>
      </div>

      {/* Slide-over Drawer / Modal for Add & Edit */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingWebhook ? "Edit Webhook Endpoint" : "Add New Webhook Endpoint"}
              </h3>
              <button onClick={() => setDrawerOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">Target Endpoint URL</label>
                <input
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  placeholder="https://your-agency.com/api/webhooks/hireflow"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">Subscribed Events</label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(ev.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookForm((prev) => ({ ...prev, events: [...prev.events, ev.id] }));
                          } else {
                            setWebhookForm((prev) => ({ ...prev, events: prev.events.filter((id) => id !== ev.id) }));
                          }
                        }}
                        className="accent-indigo-600 rounded"
                      />
                      <span>{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">HMAC Signing Secret</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    className="w-full text-xs p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                    value={webhookForm.secret}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopySecret(webhookForm.secret)}
                    className="px-3 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedSecret ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWebhook}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                Save Webhook Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
