import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { memberPost, patchMember } from "../controllers/members.controller.js";

const router = Router();

// POST /member para crear un nuevo miembro
router.post("/", requireAuth, memberPost);

// GET /events/:eventId/attendance para obtener las asistencias de un evento específico 
//router.get("/:eventId/attendance", getAttendance);

// PATCH /event/:eventId   # para editar un usario
router.patch("/:memberId", requireAuth, patchMember);

export default router;