import { getAuditLogsService } from "../services/auditLog.service.js";


// endpoint Get
// falta verificar que el usuario tenga permisos para ver los logs
export async function getAuditLogsController(req, res) {
    try {
        const data = await getAuditLogsService(req.query);
        res.json({ok: true, data:data});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
}