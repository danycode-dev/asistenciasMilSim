import pool from "../db/pool.js";
export async function createAuditLog(client, {
    actorId,
    action,
    entityType,
    entityId,
    entityName,
    oldData,
    newData,
    affectedMembers = []
}) {
    await client.query(
        `INSERT INTO audit_logs (
            actor_id, action, entity_type, entity_id,
            entity_name, old_data, new_data, affected_members
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            actorId,
            action,
            entityType,
            entityId,
            entityName,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            affectedMembers
        ]
    );
}



export async function getAuditLogsService({
    limit = 20,
    offset = 0,
    actorId = null,
    action = null,
    entityType = null,
    entityId = null
} = {}) {

    const client = await pool.connect();
    console.log("Fetching audit logs with filters:", {
        limit,
        offset,
        actorId,
        action,
        entityType,
        entityId
    });

    try {
        const values = [];
        const conditions = [];

        // Filtros
        if (actorId != null) {
            values.push(actorId);
            conditions.push(`a.actor_id = $${values.length}`);
        }

        if (action) {
            values.push(action);
            conditions.push(`a.action = $${values.length}`);
        }

        if (entityType) {
            values.push(entityType);
            conditions.push(`a.entity_type = $${values.length}`);
        }

        if (entityId != null) {
            values.push(entityId);
            conditions.push(`a.entity_id = $${values.length}`);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        // Paginación
        limit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        offset = Math.max(Number(offset) || 0, 0);

        values.push(limit, offset);

        // Obtener logs y autor
        const query = `
            SELECT
                a.*,

                CASE
                    WHEN u.id IS NOT NULL THEN
                        jsonb_build_object(
                            'id', u.id,
                            'username', u.username
                        )
                    ELSE NULL
                END AS actor

            FROM audit_logs a

            LEFT JOIN users u ON u.id = a.actor_id

            ${where}

            ORDER BY a.created_at DESC, a.id DESC

            LIMIT $${values.length - 1}
            OFFSET $${values.length}
        `;

        const { rows: logs } = await client.query(query, values);

        const memberIds = [
            ...new Set(
                logs.flatMap(log => log.affected_members || [])
            )
        ];

        // devolver solo logs si no hay memebrs
        if (memberIds.length === 0) {
            return logs.map(log => ({
                ...log,
                implicated_members: []
            }));
        }


        const { rows: members } = await client.query(
            `SELECT id, nickname
             FROM members
             WHERE id = ANY($1::int[])`,
            [memberIds]
        );

        const membersMap = new Map(
            members.map(member => [member.id, member])
        );
        return logs.map(log => ({
            ...log,

            implicated_members: (log.affected_members || []).map(
                id => membersMap.get(id) || {
                    id,
                    nickname: null
                }
            )
        }));

    } catch (error) {
        console.error("Error obteniendo logs de auditoría:", error);
        throw error;

    } finally {
        client.release();
    }
}