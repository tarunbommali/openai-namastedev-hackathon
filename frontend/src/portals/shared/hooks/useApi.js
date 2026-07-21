import { useState, useCallback } from "react";
import { api } from "../../../api";
import { useAuth } from "./useAuth";

/**
 * useApi — thin wrapper around api() with per-call loading state.
 * Usage:
 *   const { call, loading, error } = useApi();
 *   const data = await call("/api/some/endpoint", { method: "POST", body: JSON.stringify(x) });
 */
export function useApi() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(
    async (path, options = {}, overrideToken) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api(path, options, overrideToken ?? token);
        return result;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { call, loading, error };
}
