// ─── Route Path Constants ────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  CANDIDATE_LOGIN: "/candidate/login",
  WORK_LOGIN: "/work/login",
  ACCESS_TYPE: "/access-type",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // Protected - Candidate
  CANDIDATE_JOBS: "/candidate/jobs",
  CANDIDATE_APPLICATIONS: "/candidate/applications",
  CANDIDATE_INTERVIEWS: "/candidate/interviews",
  CANDIDATE_OFFERS: "/candidate/offers",
  CANDIDATE_PROFILE: "/candidate/profile",

  // Protected - Company
  COMPANY_DASHBOARD: "/company/dashboard",
  COMPANY_EMPLOYEES: "/company/employees",
  COMPANY_JOBS: "/company/jobs",
  COMPANY_CANDIDATES: "/company/candidates",
  COMPANY_SETTINGS: "/company/settings",

  // Protected - Recruiter
  RECRUITER_DASHBOARD: "/recruiter/dashboard",
  RECRUITER_JOBS: "/recruiter/jobs",
  RECRUITER_SCREENING: "/recruiter/screening",
  RECRUITER_RESULTS: "/recruiter/results",
  RECRUITER_QUESTIONS: "/recruiter/questions",
  RECRUITER_SCHEDULE: "/recruiter/schedule",
  RECRUITER_DECISIONS: "/recruiter/decisions",

  // Protected - Interviewer
  INTERVIEWER_EVALUATION: "/interviewer/evaluation",
  INTERVIEWER_INTERVIEWS: "/interviewer/interviews",
};

// ─── Role → default redirect path ────────────────────────────────────────────
export const ROLE_PATHS = {
  candidate:     ROUTES.CANDIDATE_JOBS,
  company_admin: ROUTES.COMPANY_DASHBOARD,
  admin:         ROUTES.COMPANY_DASHBOARD,
  recruiter:     ROUTES.RECRUITER_DASHBOARD,
  interviewer:   ROUTES.INTERVIEWER_INTERVIEWS,
};

// ─── Role → display label ────────────────────────────────────────────────────
export const ROLE_NAMES = {
  candidate:     "Candidate",
  company_admin: "Company Admin",
  admin:         "Admin",
  recruiter:     "Recruiter",
  interviewer:   "Interviewer",
};

// ─── Roles allowed per portal ─────────────────────────────────────────────────
export const PORTAL_ROLES = {
  candidate:   ["candidate"],
  company:     ["company_admin", "admin"],
  recruiter:   ["recruiter"],
  interviewer: ["interviewer"],
};

// ─── Public routes (no auth required) ────────────────────────────────────────
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.CANDIDATE_LOGIN,
  ROUTES.WORK_LOGIN,
  ROUTES.ACCESS_TYPE,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
];
