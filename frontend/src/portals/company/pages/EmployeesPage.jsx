import React, { useState } from "react";
import { Users, Plus, KeyRound, Trash2, UserCheck } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCompanyContext } from "../CompanyLayout";
import { LoadingSpinner, PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

function InviteModal({ onClose, onSuccess, addToast, token }) {
  const [form, setForm] = useState({ name: "", email: "", role: "recruiter", tempPassword: "Password123!" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/org/invite", {
        method: "POST",
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), role: form.role, tempPassword: form.tempPassword })
      }, token);
      addToast(`${form.name} invited as ${form.role === "recruiter" ? "Recruiter" : "Technical Interviewer"}`, "success");
      onSuccess();
      onClose();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Invite Team Member
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
            { label: "Email Address", key: "email", type: "email", placeholder: "jane@company.com" },
            { label: "Temporary Password", key: "tempPassword", type: "text", placeholder: "Min. 8 characters" }
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                required
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Role</label>
            <select
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="recruiter">Recruiter</option>
              <option value="interviewer">Technical Interviewer</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <UserCheck className="w-4 h-4" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { token } = useAuth();
  const { members, loading, refresh, addToast } = useCompanyContext();
  const [showInvite, setShowInvite] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  async function updateRole(userId, role) {
    setActionLoading(userId);
    try {
      await api(`/api/org/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token);
      addToast("Role updated", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionLoading(null); }
  }

  async function deactivate(userId) {
    if (!confirm("Deactivate this member? Their sessions will be revoked.")) return;
    setActionLoading(userId);
    try {
      await api(`/api/org/users/${userId}/deactivate`, { method: "PATCH" }, token);
      addToast("Member deactivated", "success");
      await refresh();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionLoading(null); }
  }

  async function resetPassword(userId) {
    const tempPassword = prompt("Enter a new temporary password (min 8 chars):");
    if (!tempPassword || tempPassword.length < 8) return;
    setActionLoading(userId);
    try {
      await api(`/api/org/users/${userId}/reset-password`, { method: "POST", body: JSON.stringify({ tempPassword }) }, token);
      addToast("Password reset. Member must change on next login.", "success");
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionLoading(null); }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? "s" : ""} in your organization</p>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Team Members Yet</p>
          <p className="text-xs text-slate-500">Invite recruiters and technical interviewers to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Member", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {m.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{m.email}</p>
                        {m.whoami && <p className="text-[11px] text-indigo-600 font-medium">{m.whoami}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={m.role}
                      onChange={(e) => updateRole(m.id, e.target.value)}
                      disabled={!!actionLoading}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="interviewer">Interviewer</option>
                      <option value="company_admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${m.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resetPassword(m.id)}
                        disabled={!!actionLoading}
                        title="Reset password"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      {m.isActive && (
                        <button
                          onClick={() => deactivate(m.id)}
                          disabled={!!actionLoading}
                          title="Deactivate"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          {actionLoading === m.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={refresh}
          addToast={addToast}
          token={token}
        />
      )}
    </div>
  );
}
