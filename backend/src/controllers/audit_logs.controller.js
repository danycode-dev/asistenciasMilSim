import { User } from "../entities/user.entity.js";
import { getAuditLogsService } from "../services/auditLog.service.js";


// endpoint Get
// falta verificar que el usuario tenga permisos para ver los logs
export async function getAuditLogsController(req, res) {
    /** @type {User | undefined} */
    const user = req.user
    if (!user.permissions.includes('audit_logs.view')) return res.sendStatus(403);
    try {
        const data = await getAuditLogsService(req.query);
        res.json({ok: true, data:data});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}