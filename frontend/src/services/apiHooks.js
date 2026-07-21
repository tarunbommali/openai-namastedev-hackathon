import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const queryKeys = {
  profile:      ["profile"],
  jobs:         (filters) => ["jobs", filters ?? {}],
  job:          (id)      => ["jobs", id],
  candidates:   ["candidates"],
  applications: ["applications"],
  interviews:   ["interviews"],
  offers:       ["offers"],
  company:      ["company"],
  members:      ["members"],
  feedback:     ["feedback"],
  dashboard:    (role)    => ["dashboard", role],
};

// ─── Generic hooks ────────────────────────────────────────────────────────────
export const useApiQuery = (key, endpoint, options = {}) => {
  const { token } = useAuth();
  const { enabled = true, ...rest } = options;
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn:  () => apiClient.get(endpoint, token),
    enabled:  enabled && !!token,
    ...rest,
  });
};

export const useApiMutation = (mutationFn, options = {}) => {
  const toast = useToast();
  return useMutation({
    mutationFn,
    onError: (err) => {
      toast.error(err.message || "An error occurred");
      options.onError?.(err);
    },
    ...options,
  });
};

// ─── Candidate Hooks ─────────────────────────────────────────────────────────
export const useProfile = () =>
  useApiQuery(queryKeys.profile, "/api/candidate/profile");

export const useUpdateProfile = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => apiClient.patch("/api/candidate/profile", data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Profile updated successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to update profile"),
  });
};

export const useJobs = (filters = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined))
  ).toString();
  const endpoint = `/api/candidate/jobs${params ? `?${params}` : ""}`;
  return useApiQuery(queryKeys.jobs(filters), endpoint);
};

export const useJobDetail = (jobId) =>
  useApiQuery(queryKeys.job(jobId), `/api/candidate/jobs/${jobId}`, { enabled: !!jobId });

export const useApplyToJob = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => {
      if (data.file && data.resumeChoice === "custom") {
        const fd = new FormData();
        fd.append("resume", data.file);
        if (data.jobId)      fd.append("jobId", data.jobId);
        if (data.resumeText) fd.append("resumeText", data.resumeText);
        if (data.phone)      fd.append("phone", data.phone);
        return apiClient.upload("/api/candidate/apply", fd, token);
      }
      return apiClient.post("/api/candidate/apply", data, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.applications });
      toast.success("Application submitted successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to submit application"),
  });
};

// ─── Company Hooks ────────────────────────────────────────────────────────────
export const useOrgMembers = () =>
  useApiQuery(queryKeys.members, "/api/org/members");

export const useInviteMember = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => apiClient.post("/api/org/invite", data, token),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.members });
      toast.success(`${vars.name} invited as ${vars.role}`);
    },
    onError: (err) => toast.error(err.message),
  });
};

// ─── Recruiter Hooks ──────────────────────────────────────────────────────────
export const useRecruiterDashboard = () =>
  useApiQuery(queryKeys.dashboard("recruiter"), "/api/recruiter/dashboard");

export const useRecruiterCandidates = () =>
  useApiQuery(queryKeys.candidates, "/api/recruiter/candidates");

export const useRunScreening = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => apiClient.post("/api/recruiter/screen", data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.candidates });
      toast.success("AI screening batch executed");
    },
    onError: (err) => toast.error(err.message),
  });
};
