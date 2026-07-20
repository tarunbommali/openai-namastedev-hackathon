import React, { useState } from "react";
import { Building2, Users, FileSpreadsheet, CheckCircle } from "lucide-react";
import { api } from "../api";

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [agency, setAgency] = useState({ name: "", email: "", size: "10-50", primaryRole: "Engineering / Tech" });
  const [recruiters, setRecruiters] = useState(["recruiter1@agency.com"]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAgencySubmit = (e) => {
    e.preventDefault();
    if (!agency.name || !agency.email) return;
    setStep(2);
  };

  const addRecruiter = () => {
    if (!newEmail || recruiters.includes(newEmail)) return;
    setRecruiters([...recruiters, newEmail]);
    setNewEmail("");
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      setMsg("Agency tenant setup complete!");
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ maxWidth: "600px", margin: "3rem auto", padding: "2rem", background: "#ffffff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a" }}>Welcome to HireFlow AI for Agencies</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Set up your recruitment agency workspace in 3 simple steps</p>
      </header>

      {/* Step Progress Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        {[
          { num: 1, label: "Agency Profile", icon: Building2 },
          { num: 2, label: "Invite Team", icon: Users },
          { num: 3, label: "First Batch", icon: FileSpreadsheet }
        ].map((s) => {
          const Icon = s.icon;
          const active = step >= s.num;
          return (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: active ? 1 : 0.4 }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: active ? "#2563eb" : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" }}>
                {s.num}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: active ? "600" : "normal" }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <form onSubmit={handleAgencySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Agency Name
            <input required className="text-input" placeholder="e.g. TalentFirst India" value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} />
          </label>
          <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Admin Work Email
            <input required type="email" className="text-input" placeholder="admin@talentfirst.in" value={agency.email} onChange={(e) => setAgency({ ...agency, email: e.target.value })} />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <label style={{ flex: 1, fontSize: "0.85rem", fontWeight: "600" }}>Manual Hours/Batch
              <input type="number" className="text-input" value={agency.manualHoursPerBatch || 16} onChange={(e) => setAgency({ ...agency, manualHoursPerBatch: Number(e.target.value) })} />
            </label>
            <label style={{ flex: 1, fontSize: "0.85rem", fontWeight: "600" }}>Recruiter Rate ($/hr)
              <input type="number" className="text-input" value={agency.recruiterHourlyRateUSD || 35} onChange={(e) => setAgency({ ...agency, recruiterHourlyRateUSD: Number(e.target.value) })} />
            </label>
          </div>
          <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Primary Hiring Vertical
            <select className="text-input" value={agency.primaryRole} onChange={(e) => setAgency({ ...agency, primaryRole: e.target.value })}>
              <option>Engineering / Tech</option>
              <option>Campus / Entry Level</option>
              <option>Sales & Operations</option>
              <option>Executive Search</option>
            </select>
          </label>
          <button type="submit" className="primary-btn" style={{ marginTop: "1rem" }}>Continue to Team Setup →</button>
        </form>
      )}


      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1rem" }}>Invite Recruiter Seats</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input className="text-input" placeholder="recruiter@agency.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button className="ghost-btn" onClick={addRecruiter}>Add</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recruiters.map((email) => (
              <div key={email} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#f8fafc", borderRadius: "6px", fontSize: "0.85rem" }}>
                <span>{email}</span>
                <span style={{ color: "#16a34a", fontSize: "0.75rem" }}>Seat Provisioned</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="ghost-btn" onClick={() => setStep(1)}>← Back</button>
            <button className="primary-btn" onClick={() => setStep(3)}>Continue to Batch Setup →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
          <CheckCircle size={48} color="#16a34a" style={{ margin: "0 auto" }} />
          <h3>Ready for Your First Candidate Batch!</h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Your agency workspace is configured. You can now import jobs and candidate resumes via CSV or start live screening.
          </p>
          {msg && <div className="app-success">{msg}</div>}
          <button className="primary-btn" disabled={loading} onClick={finishOnboarding}>
            Launch Agency Dashboard 🚀
          </button>
        </div>
      )}
    </div>
  );
}
