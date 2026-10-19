import { Router } from "express";
import { getAuditLogsController } from "../controllers/audit_logs.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getAuditLogsController);


export default router;