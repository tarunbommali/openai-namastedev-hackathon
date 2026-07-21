import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCompanyContext } from "../CompanyLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function SettingsPage() {
  const { token } = useAuth();
  const { org, loading, refresh, addToast } = useCompanyContext();

  const [form, setForm] = useState({
    companyDisplayName: org?.companyDisplayName || org?.name || "",
    tagline: org?.settings?.tagline || org?.tagline || "",
    defaultJobLocation: org?.settings?.defaultJobLocation || "",
    allowCandidateSelfApply: org?.settings?.allowCandidateSelfApply ?? true,
    requireResumeOnApply: org?.settings?.requireResumeOnApply ?? true
  });
  const [saving, setSaving] = useState(false);

  // Sync form when org loads
  React.useEffect(() => {
    if (org) {
      setForm({
        companyDisplayName: org.companyDisplayName || org.name || "",
        tagline: org.settings?.tagline || org.tagline || "",
        defaultJobLocation: org.settings?.defaultJobLocation || "",
        allowCandidateSelfApply: org.settings?.allowCandidateSelfApply ?? true,
        requireResumeOnApply: org.settings?.requireResumeOnApply ?? true
      });
    }
  }, [org]);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/org/settings", { method: "PATCH", body: JSON.stringify(form) }, token);
      addToast("Company settings saved!", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setSaving(false); }
  }

  if (loading) return <PageLoadingSpinner />;

  const F = ({ label, hint, children }) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
  const inp = "w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" /> Company Portal Settings
        </h3>

        <form onSubmit={saveSettings} className="space-y-5">
          <F label="Company Display Name" hint="Shown in the portal sidebar header">
            <input className={inp} maxLength={80} value={form.companyDisplayName} onChange={(e) => setForm({ ...form, companyDisplayName: e.target.value })} placeholder="Your Company Name" />
          </F>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Company Tagline (WhoAmI)</label>
              <span className="text-[11px] font-mono text-slate-400">{(form.tagline || "").length}/30 chars</span>
            </div>
            <p className="text-[11px] text-slate-400">Shown below company name in sidebar</p>
            <input
              className={inp}
              maxLength={30}
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value.slice(0, 30) })}
              placeholder="e.g. Enterprise Hiring Admin"
            />
          </div>

          <F label="Default Job Location" hint="Pre-fills job creation form">
            <input className={inp} value={form.defaultJobLocation} onChange={(e) => setForm({ ...form, defaultJobLocation: e.target.value })} placeholder="e.g. Bangalore / Remote" />
          </F>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Settings</h4>
            {[
              { key: "allowCandidateSelfApply", label: "Allow candidates to self-apply to jobs" },
              { key: "requireResumeOnApply", label: "Require resume on job application" }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Read-only org info */}
          {org && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Organization Info (Read-only)</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Industry", value: org.industry },
                  { label: "Size", value: org.size },
                  { label: "Country", value: org.country },
                  { label: "Plan", value: org.plan?.toUpperCase() },
                  { label: "Status", value: org.status },
                  { label: "Admin Email", value: org.adminEmail }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] text-slate-400">{label}</p>
                    <p className="text-xs font-semibold text-slate-900">{value || "â€”"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
