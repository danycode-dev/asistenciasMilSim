import { Router } from "express";
<<<<<<< HEAD
import { raizPost, getAttendance, patchEvent } from "../controllers/events.controller.js";
=======
>>>>>>> 4bb12e1 (feat: implement member update functionality with patchMember endpoint and EditMemberModal integration)
import { requireAuth } from "../auth/auth.middleware.js";
import { patchMember } from "../controllers/members.controller.js";

const router = Router();

// POST /events para crear un nuevo miembro
//router.post("/", requireAuth, raizPost);

// GET /events/:eventId/attendance para obtener las asistencias de un evento específico 
//router.get("/:eventId/attendance", getAttendance);

// PATCH /event/:eventId   # para editar un usario
router.patch("/:memberId", requireAuth, patchMember);

export default router;