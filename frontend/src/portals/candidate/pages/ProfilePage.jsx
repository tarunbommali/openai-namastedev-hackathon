import React, { useState } from "react";
import { FileUp, FileText, Sparkles } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCandidateContext } from "../CandidateLayout";
import { LoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function ProfilePage() {
  const { auth, token } = useAuth();
  const { profile, setProfile, refresh, addToast } = useCandidateContext();
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      const combinedName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.name;
      const cleanWhoami = (profile.whoami || "").slice(0, 20);
      await api("/api/candidate/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: combinedName,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          whoami: cleanWhoami,
          tagline: cleanWhoami,
          describeMe: profile.describeMe || "",
          bio: profile.describeMe || "",
          location: profile.location || "",
          skills: (profile.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
          experience: profile.experience || "",
          education: profile.education || "",
          certifications: (profile.certifications || "").split(",").map((s) => s.trim()).filter(Boolean)
        })
      }, token);
      addToast("Profile saved successfully!", "success");
      await refresh();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const P = (props) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{props.label}</label>
      {props.children}
    </div>
  );

  const Input = ({ value, onChange, placeholder, type = "text", disabled = false }) => (
    <input
      type={type}
      disabled={disabled}
      className={`w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-slate-50"}`}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  );

  return (
    <div className="space-y-8 w-full">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Candidate Profile</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your resume, personal details, and skills for job applications.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Profile Active</span>
      </div>

      {/* Resume Upload */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-indigo-600" /> Resume & Document Upload
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Attach your primary resume. Evaluated automatically by AI screening.</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-100">1 Resume Limit</span>
        </div>

        {file ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{file.name}</p>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">Primary</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors">
              Replace Resume
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center transition-colors space-y-3 bg-slate-50/50">
            <FileUp className="w-10 h-10 mx-auto text-indigo-600" />
            <label className="cursor-pointer text-sm font-bold text-indigo-600 hover:underline">
              Click to upload your primary resume file
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <p className="text-xs text-slate-500">Supports PDF, DOCX, or TXT (max 10MB)</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Or Paste Raw Resume Text</label>
          <textarea
            rows={4}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            placeholder="Paste resume experience summary, technical skills, or bio here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
      </div>

      {/* Personal Details Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Personal & Professional Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <P label="First Name">
            <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="First Name" />
          </P>
          <P label="Last Name">
            <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Last Name" />
          </P>

          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Who Am I (Short Role Title)</label>
              <span className="text-[11px] font-mono text-slate-400">{(profile.whoami || "").length}/20 chars</span>
            </div>
            <input
              maxLength={20}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={profile.whoami || ""}
              onChange={(e) => setProfile({ ...profile, whoami: e.target.value.slice(0, 20) })}
              placeholder="e.g. Backend Developer"
            />
          </div>

          <P label="Location" className="sm:col-span-2">
            <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g. Bangalore, India or Remote" />
          </P>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Describe Me (Bio & Summary)</label>
            <textarea
              rows={4}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              value={profile.describeMe || ""}
              onChange={(e) => setProfile({ ...profile, describeMe: e.target.value })}
              placeholder="Describe your background, career goals, technical passions, or key achievements..."
            />
          </div>

          <P label="Technical Skills (comma separated)" className="sm:col-span-2">
            <Input value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="e.g. React, Node.js, Python, TypeScript, Docker" />
          </P>

          <P label="Experience Summary">
            <Input value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} placeholder="e.g. 5 years as Senior Software Engineer" />
          </P>

          <P label="Education">
            <Input value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} placeholder="e.g. B.Tech in Computer Science" />
          </P>

          <P label="Certifications (comma separated)" className="sm:col-span-2">
            <Input value={profile.certifications} onChange={(e) => setProfile({ ...profile, certifications: e.target.value })} placeholder="e.g. AWS Certified Developer, CKA" />
          </P>
        </div>

        <div className="pt-2">
          <button
            disabled={saving}
            onClick={saveProfile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
