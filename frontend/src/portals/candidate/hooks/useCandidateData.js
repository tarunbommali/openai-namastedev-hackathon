import { useState, useCallback, useEffect } from "react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";

/**
 * useCandidateData â€” centralised state for the Candidate Portal.
 * Fetches jobs + full portal data (applications, interviews, offers, candidate profile).
 */
export function useCandidateData(filters = {}) {
  const { token, auth } = useAuth();
  const { q = "", skill = "", location = "" } = filters;

  const [jobs, setJobs] = useState([]);
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    name: auth?.user?.name || "",
    firstName: (auth?.user?.name || "").split(" ")[0] || "",
    lastName: (auth?.user?.name || "").split(" ").slice(1).join(" ") || "",
    whoami: "",
    describeMe: "",
    location: "",
    skills: "",
    experience: "",
    education: "",
    certifications: ""
  });

  const refresh = useCallback(
    async (overrideFilters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const resolvedQ = overrideFilters.q ?? q;
        const resolvedSkill = overrideFilters.skill ?? skill;
        const resolvedLoc = overrideFilters.location ?? location;

        const [jobList, p] = await Promise.all([
          api(
            `/api/candidate/jobs?q=${encodeURIComponent(resolvedQ)}&skill=${encodeURIComponent(resolvedSkill)}&location=${encodeURIComponent(resolvedLoc)}`,
            {},
            token
          ),
          api("/api/candidate/portal", {}, token)
        ]);

        setJobs(jobList);
        setPortal(p);

        if (p?.candidate) {
          const full = p.candidate.name || auth?.user?.name || "";
          const parts = full.split(" ");
          setProfile({
            name: full,
            firstName: p.candidate.firstName || parts[0] || "",
            lastName: p.candidate.lastName || parts.slice(1).join(" ") || "",
            whoami: (p.candidate.whoami || p.candidate.tagline || "").slice(0, 20),
            describeMe: p.candidate.describeMe || p.candidate.bio || p.candidate.summary || "",
            location: p.candidate.location || "",
            skills: (p.candidate.skills || p.candidate.parsedResume?.skills || []).join(", "),
            experience: p.candidate.experience || "",
            education: p.candidate.education || p.candidate.parsedResume?.education || "",
            certifications: (p.candidate.certifications || []).join(", ")
          });
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [token, q, skill, location, auth?.user?.name]
  );

  useEffect(() => {
    refresh();
  }, [token]);

  const hasApplied = useCallback(
    (jobId) => {
      if (!portal?.applications || !jobId) return false;
      return portal.applications.some(
        (app) => String(app.jobId || app.job?.id || app.job) === String(jobId)
      );
    },
    [portal]
  );

  return {
    jobs,
    portal,
    profile,
    setProfile,
    loading,
    error,
    refresh,
    hasApplied,
    applications: portal?.applications || [],
    interviews: portal?.interviews || [],
    offers: portal?.offers || []
  };
}
