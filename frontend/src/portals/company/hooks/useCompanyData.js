import { useState, useCallback, useEffect } from "react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";

export function useCompanyData() {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, jobsData, orgData] = await Promise.all([
        api("/api/org/members", {}, token).catch(() => []),
        api("/api/jobs", {}, token).catch(() => []),
        api("/api/org/me", {}, token).catch(() => null)
      ]);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setOrg(orgData);
      // Fetch candidates pipeline separately
      try {
        const pipeline = await api("/api/recruiter/candidates", {}, token);
        setCandidates(Array.isArray(pipeline) ? pipeline : []);
      } catch { setCandidates([]); }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [token]);

  return { members, jobs, candidates, org, loading, error, refresh };
}
