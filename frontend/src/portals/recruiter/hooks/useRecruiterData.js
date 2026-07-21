import { useState, useCallback, useEffect } from "react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";

export function useRecruiterData() {
  const { token } = useAuth();
  const [dash, setDash] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, j, c, a, f] = await Promise.all([
        api("/api/recruiter/dashboard", {}, token),
        api("/api/recruiter/jobs", {}, token),
        api("/api/recruiter/candidates", {}, token),
        api("/api/recruiter/applications", {}, token),
        api("/api/recruiter/feedback", {}, token)
      ]);
      setDash(d); setJobs(j); setCandidates(c); setApplications(a); setFeedback(f);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [token]);

  return { dash, jobs, candidates, applications, feedback, loading, error, refresh };
}
