import { Router } from "express";
import { getAuditLogsController } from "../controllers/audit_logs.controller.js";

const router = Router();

// falta agregar el middleware
router.get("/", getAuditLogsController);


export default router;