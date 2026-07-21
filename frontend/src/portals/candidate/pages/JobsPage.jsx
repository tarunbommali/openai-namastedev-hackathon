import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building, MapPin, Sparkles, ChevronRight, CheckCircle2, BriefcaseBusiness } from "lucide-react";
import { useCandidateContext } from "../CandidateLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function JobsPage() {
  const navigate = useNavigate();
  const { jobs, loading, error, hasApplied, refresh, filters, setFilters } = useCandidateContext();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearch = () => {
    setFilters(localFilters);
    refresh(localFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search job title..."
            value={localFilters.q}
            onChange={(e) => setLocalFilters({ ...localFilters, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <input
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Required Skill (e.g. React)"
          value={localFilters.skill}
          onChange={(e) => setLocalFilters({ ...localFilters, skill: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <input
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Location (e.g. Bangalore / Remote)"
          value={localFilters.location}
          onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "Searching..." : "Filter Jobs"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">{error}</div>
      )}

      <div className="text-xs text-slate-500 font-medium">
        Found {jobs.length} job{jobs.length !== 1 ? "s" : ""}
      </div>

      {loading ? (
        <PageLoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <BriefcaseBusiness className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Jobs Found</p>
          <p className="text-xs text-slate-500">Try adjusting your search filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.team || "Engineering"}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || "Bangalore, India"}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> AI Screened
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{job.summary}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(job.requirements || []).map((req) => (
                    <span key={req} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">{req}</span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {hasApplied(job.id || job.publicId) ? (
                  <button disabled className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-4 py-2 rounded-lg border border-emerald-200 cursor-default flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/candidate/jobs/${job.id}/apply`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    Apply Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
