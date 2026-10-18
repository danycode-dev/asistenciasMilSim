export default async function createAuditLog(client, {
  actorId,
  action,
  entityType,
  entityId,
  entityName,
  oldData,
  newData
}) {
  await client.query(
    `INSERT INTO audit_logs
     (actor_id, action, entity_type, entity_id,
      entity_name, old_data, new_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      actorId,
      action,
      entityType,
      entityId,
      entityName,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null
    ]
  );
}