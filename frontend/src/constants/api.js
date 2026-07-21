// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API = {
  BASE_URL: "/api",

  ENDPOINTS: {
    // Auth
    LOGIN:              "/auth/login",
    LOGOUT:             "/auth/logout",
    REGISTER_COMPANY:   "/auth/register/company",
    REGISTER_DEVELOPER: "/auth/register/developer",
    FORGOT_PASSWORD:    "/auth/forgot-password",
    RESET_PASSWORD:     "/auth/reset-password",
    VALIDATE:           "/auth/validate",

    // Organization / Company
    ORG_ME:             "/org/me",
    ORG_MEMBERS:        "/org/members",
    ORG_INVITE:         "/org/invite",
    ORG_SETTINGS:       "/org/settings",
    ORG_USER_ROLE:      (id) => `/org/users/${id}/role`,
    ORG_USER_DEACTIVATE:(id) => `/org/users/${id}/deactivate`,
    ORG_USER_RESET_PW:  (id) => `/org/users/${id}/reset-password`,

    // Jobs (shared)
    JOBS:           "/jobs",
    JOB_DETAIL:     (id) => `/jobs/${id}`,

    // Candidate
    CANDIDATE_JOBS:         "/candidate/jobs",
    CANDIDATE_JOB_DETAIL:   (id) => `/candidate/jobs/${id}`,
    CANDIDATE_APPLY:        "/candidate/apply",
    CANDIDATE_APPLICATIONS: "/candidate/applications",
    CANDIDATE_INTERVIEWS:   "/candidate/interviews",
    CANDIDATE_OFFERS:       "/candidate/offers",
    CANDIDATE_PROFILE:      "/candidate/profile",
    CANDIDATE_PORTAL:       "/candidate/portal",
    CANDIDATE_RESCHEDULE:   (id) => `/candidate/interviews/${id}/reschedule`,
    CANDIDATE_OFFER_RESPOND:(id) => `/candidate/offers/${id}/respond`,

    // Recruiter
    RECRUITER_DASHBOARD:    "/recruiter/dashboard",
    RECRUITER_JOBS:         "/recruiter/jobs",
    RECRUITER_JOB_CLOSE:    (id) => `/recruiter/jobs/${id}/close`,
    RECRUITER_CANDIDATES:   "/recruiter/candidates",
    RECRUITER_APPLICATIONS: "/recruiter/applications",
    RECRUITER_FEEDBACK:     "/recruiter/feedback",
    RECRUITER_SCREEN:       "/recruiter/screen",
    RECRUITER_QUESTIONS:    "/recruiter/questions",
    RECRUITER_SCHEDULE:     "/recruiter/schedule",
    RECRUITER_DECIDE:       "/recruiter/decide",

    // Interviewer
    INTERVIEWER_INTERVIEWS: "/interviewer/interviews",
    INTERVIEWER_BRIEF:      (id) => `/interviewer/interviews/${id}/brief`,
    INTERVIEWER_FEEDBACK:   "/interviewer/feedback",
  },
};

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  INTERNAL_SERVER_ERROR: 500,
};
