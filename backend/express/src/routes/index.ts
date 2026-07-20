import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { orgIsolation } from "../middlewares/orgIsolation";
import { authController } from "../controllers/authController";
import { compatController } from "../controllers/compatController";
import { roleController } from "../controllers/roleController";
import { orgController } from "../controllers/orgController";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /text\//.test(file.mimetype) ||
      /\.(txt|md|text)$/i.test(file.originalname) ||
      file.mimetype === "application/pdf";
    cb(null, ok);
  }
});

export const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// Health & Public AI endpoints
// ──────────────────────────────────────────────────────────────────────────────
router.get("/health", compatController.health);
router.get("/agents/logs", compatController.agentLogs);
router.post("/command", compatController.command);
router.post("/resumes", upload.single("resume"), compatController.resumes);
router.post("/questions", compatController.questions);
router.post("/interviews/preview", compatController.interviewPreview);
router.post("/interviews/schedule", compatController.interviewSchedule);
router.get("/interviews", compatController.interviews);
router.post("/feedback", compatController.feedback);
router.get("/jobs", compatController.jobs);
router.get("/applications", compatController.applications);

// ──────────────────────────────────────────────────────────────────────────────
// SaaS Integration & Outbound Webhooks
// ──────────────────────────────────────────────────────────────────────────────
router.post("/integrations/csv/import-candidates", upload.single("file"), compatController.importCandidatesCsv);
router.post("/integrations/csv/import-jobs", upload.single("file"), compatController.importJobsCsv);
router.get("/integrations/csv/export-screening", compatController.exportScreeningCsv);
router.get("/integrations/csv/export-screening/:jobId", compatController.exportScreeningCsv);
router.post("/integrations/webhooks", compatController.registerWebhook);
router.get("/integrations/webhooks", compatController.listWebhooks);

router.post("/recruiter/screen/batch-async", compatController.batchScreenAsync);
router.get("/recruiter/screen/job-status/:jobId", compatController.getScreeningJobStatus);

// ──────────────────────────────────────────────────────────────────────────────
// Compliance & Audit
// ──────────────────────────────────────────────────────────────────────────────
router.get("/compliance/audit-logs", compatController.getAuditLogs);
router.get("/compliance/bias-report", compatController.getBiasAuditReport);

// ──────────────────────────────────────────────────────────────────────────────
// Tenant / Org Baseline & ROI
// ──────────────────────────────────────────────────────────────────────────────
router.post("/tenant/baseline", compatController.updateTenantBaseline);
router.get("/tenant/roi-report", compatController.getExecutiveRoiReport);

// ──────────────────────────────────────────────────────────────────────────────
// AUTH — Public
// ──────────────────────────────────────────────────────────────────────────────
// New split endpoints
router.post("/auth/register/company",   authController.registerCompany);
router.post("/auth/register/developer", authController.registerDeveloper);

// Legacy endpoint — developer-only, backward compat
router.post("/auth/register", authController.register);

router.post("/auth/login",           authController.login);
router.post("/auth/refresh",         authController.refresh);
router.post("/auth/logout",          authController.logout);
router.post("/auth/forgot-password", authController.forgotPassword);

// AUTH — Protected
router.get("/auth/me",       authenticate, authController.me);
router.patch("/auth/profile", authenticate, authController.updateProfile);

// ──────────────────────────────────────────────────────────────────────────────
// ORGANIZATION — Company Admin routes
// ──────────────────────────────────────────────────────────────────────────────
const companyAdmin = [authenticate, authorize("company_admin", "admin"), orgIsolation] as const;

router.get("/org/me",                       ...companyAdmin, orgController.getOrg);
router.get("/org/users",                    ...companyAdmin, orgController.listUsers);
router.post("/org/invite",                  ...companyAdmin, orgController.inviteUser);
router.patch("/org/users/:id/role",         ...companyAdmin, orgController.updateUserRole);
router.patch("/org/users/:id/deactivate",   ...companyAdmin, orgController.deactivateUser);
router.post("/org/users/:id/reset-password",...companyAdmin, orgController.resetUserPassword);

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN portal (legacy alias — company_admin has same access)
// ──────────────────────────────────────────────────────────────────────────────
const adminGuard = [authenticate, authorize("company_admin", "admin"), orgIsolation] as const;

router.get("/admin/users",     ...adminGuard, roleController.adminUsers);
router.get("/admin/jobs",      ...adminGuard, roleController.adminJobs);
router.get("/admin/ai/logs",   ...adminGuard, roleController.adminAiLogs);
router.get("/admin/dashboard", ...adminGuard, roleController.adminDashboard);

// ──────────────────────────────────────────────────────────────────────────────
// RECRUITER portal
// ──────────────────────────────────────────────────────────────────────────────
const recruiter = [authenticate, authorize("recruiter", "company_admin", "admin"), orgIsolation] as const;

router.get("/recruiter/dashboard",          ...recruiter, roleController.recruiterDashboard);
router.get("/recruiter/jobs",               ...recruiter, roleController.recruiterJobs);
router.post("/recruiter/jobs",              ...recruiter, roleController.recruiterCreateJob);
router.patch("/recruiter/jobs/:id",         ...recruiter, roleController.recruiterUpdateJob);
router.post("/recruiter/jobs/:id/close",    ...recruiter, roleController.recruiterCloseJob);
router.delete("/recruiter/jobs/:id",        ...recruiter, roleController.recruiterDeleteJob);
router.get("/recruiter/candidates",         ...recruiter, roleController.recruiterCandidates);
router.get("/recruiter/applications",       ...recruiter, roleController.recruiterApplications);
router.post("/recruiter/screen",            ...recruiter, roleController.recruiterScreen);
router.post("/recruiter/questions",         ...recruiter, roleController.recruiterQuestions);
router.post("/recruiter/schedule",          ...recruiter, roleController.recruiterSchedule);
router.get("/recruiter/feedback",           ...recruiter, roleController.recruiterFeedback);
router.post("/recruiter/decide",            ...recruiter, roleController.recruiterDecide);
router.post("/recruiter/application-status",...recruiter, roleController.recruiterSetStatus);

// ──────────────────────────────────────────────────────────────────────────────
// INTERVIEWER portal
// ──────────────────────────────────────────────────────────────────────────────
const interviewer = [authenticate, authorize("interviewer", "company_admin", "admin"), orgIsolation] as const;

router.get("/interviewer/interviews",           ...interviewer, roleController.interviewerAssigned);
router.get("/interviewer/interviews/:id/brief", ...interviewer, roleController.interviewerBrief);
router.post("/interviewer/feedback",            ...interviewer, roleController.interviewerFeedback);

// ──────────────────────────────────────────────────────────────────────────────
// DEVELOPER / CANDIDATE portal (no org isolation — developer sees only own data)
// ──────────────────────────────────────────────────────────────────────────────
const developer = [authenticate, authorize("developer", "candidate", "admin")] as const;

router.get("/candidate/jobs",                       ...developer, roleController.candidateJobs);
router.post("/candidate/apply", upload.single("resume"), ...developer, roleController.candidateApply);
router.get("/candidate/portal",                     ...developer, roleController.candidatePortal);
router.get("/candidate/applications",               ...developer, roleController.candidateApplications);
router.get("/candidate/schedule",                   ...developer, roleController.candidateSchedule);
router.get("/candidate/offers",                     ...developer, roleController.candidateOffers);
router.patch("/candidate/profile",                  ...developer, roleController.candidateProfile);
router.post("/candidate/offers/:id/respond",        ...developer, roleController.candidateOfferRespond);
router.post("/candidate/interviews/:id/reschedule", ...developer, roleController.candidateReschedule);
