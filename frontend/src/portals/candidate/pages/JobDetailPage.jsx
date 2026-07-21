import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building, MapPin, Clock, Sparkles, ChevronRight, CheckCircle2, BriefcaseBusiness } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCandidateContext } from "../CandidateLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { hasApplied, jobs } = useCandidateContext();
  const [job, setJob] = useState(() => jobs.find((j) => String(j.id) === String(jobId)) || null);
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      setLoading(true);
      api(`/api/candidate/jobs/${jobId}`, {}, token)
        .then((data) => setJob(data))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [jobId, token]);

  if (loading) return <PageLoadingSpinner />;
  if (error) return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">{error}</div>
  );
  if (!job) return (
    <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
      <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
      <p className="text-sm font-semibold text-slate-700">Job not found</p>
    </div>
  );

  const applied = hasApplied(job.id || job.publicId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {job.team || "Engineering"}
              </span>
              <span className="text-xs font-mono text-slate-400">Job ID: {job.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1"><Building className="w-4 h-4 text-slate-400" /> {job.company || "HireFlow Org"}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {job.location || "Bangalore / Remote"}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {job.employmentType || "Full-Time"}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" /> AI Verified
          </span>
        </div>

        {/* Overview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Role Overview</h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {job.summary || "Join our high-performing engineering team to build scalable software products and multi-agent AI systems."}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Required Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requirements || ["React", "Node.js", "System Design"]).map((req) => (
              <span key={req} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold font-mono rounded-lg border border-indigo-100">
                {req}
              </span>
            ))}
          </div>
        </div>

        {/* Department / Salary info if available */}
        {(job.department || job.salaryRange) && (
          <div className="grid grid-cols-2 gap-4">
            {job.department && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Department</p>
                <p className="text-sm font-bold text-slate-900">{job.department}</p>
              </div>
            )}
            {job.salaryRange && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Salary Range</p>
                <p className="text-sm font-bold text-slate-900">{job.salaryRange}</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Apply CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {applied ? "Application already submitted for this position" : "Ready to submit your application?"}
          </span>
          {applied ? (
            <button disabled className="bg-emerald-50 text-emerald-700 font-bold text-xs px-5 py-2.5 rounded-lg border border-emerald-200 cursor-default flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied
            </button>
          ) : (
            <button
              onClick={() => navigate(`/candidate/jobs/${job.id || job.publicId}/apply`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              Apply Now <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
