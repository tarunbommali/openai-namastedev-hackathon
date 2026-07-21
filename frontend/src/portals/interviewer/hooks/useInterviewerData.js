import { useState, useCallback, useEffect } from "react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";

export function useInterviewerData() {
  const { token } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api("/api/interviewer/interviews", {}, token);
      setInterviews(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [token]);

  return { interviews, loading, error, refresh };
}
