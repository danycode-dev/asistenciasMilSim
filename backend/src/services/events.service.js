import pool from "../db/pool.js";
import { createAuditLog } from "./auditLog.service.js";

const truvalues = {
  P: "present",
  A: "absent",
  J: "justified"
};

const trueValuesStatus = (input) => {
  if (!input) return null;

  const key = String(input).toUpperCase().trim();
  return truvalues[key] ?? null;
};
const ejemploBody ={
    "name": "Evento de prueba",
    "description": "Descripción del evento de prueba",
    "date": "2024-07-01T18:00:00.000Z",
    "attendance": {
        "1": { "estado": "P", "comentario": "" },
        "2": { "estado": "A", "comentario": "" },
        "3": { "estado": "J", "comentario": "justificacion" }
    },
    "type_id": 1
}
export async function newEvent(eventData, user) {

    if (!eventData.name || !eventData.date) {
        throw new Error("Datos incompletos del evento");
    }
    eventData.description = eventData.description || "";
    eventData.type_id = eventData.type_id || null
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const insertEventText = 'INSERT INTO events(name, description, event_date, type_id) VALUES($1, $2, $3, $4) RETURNING id';
        const insertEventValues = [eventData.name, eventData.description, eventData.date, eventData.type_id];
        const res = await client.query(insertEventText, insertEventValues);
        const eventId = res.rows[0].id;
        const attendanceLog = {};
        const affected_members = []

        const insertAttendanceText = 'INSERT INTO event_attendance(event_id, member_id, status, justification) VALUES($1, $2, $3, $4)';
        for (const memberId in eventData.attendance) {
            console.log(eventData.attendance[memberId])
            const { estado, comentario } = eventData.attendance[memberId];

            if (!["P", "A", "J"].includes(estado)) continue; // Ignorar estados inválidos  se tomaran como no participantes del evento 
            const coment = estado === "J" ? comentario : "";
            console.log(`Insertando asistencia ${memberId}: estado=${estado}, comentario=${coment}`);
            const insertAttendanceValues = [eventId, memberId, trueValuesStatus(estado), coment];
            await client.query(insertAttendanceText, insertAttendanceValues);
            attendanceLog[memberId] = {
                estado,
                comentario: coment
            };
            affected_members.push(memberId)
        }

        await createAuditLog(client, {
            actorId:user.id,
            action: "event.create",
            entityType: "event",
            entityId: eventId,
            entityName: eventData.name,
            oldData: null,
            newData: {
                name: eventData.name,
                description: eventData.description,
                date: eventData.date,
                type_id: eventData.type_id,
                attendance: attendanceLog
            },
            affectedMembers:affected_members
        });

        await client.query('COMMIT');


    return { eventId }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating event:", error);
        throw error;
    } finally {
        client.release();
    }


}

export async function getAttendanceByEventId(eventId) {
    const exapleResponse = {
        "{idUse}": { "estado": "P", "comentario": "" },
    }
    const client = await pool.connect();
    try {
        const queryText = 'SELECT member_id, status, justification FROM event_attendance WHERE event_id = $1';
        const res = await client.query(queryText, [eventId]);
        const attendanceData = {};
        res.rows.forEach(row => {
            attendanceData[row.member_id] = {
                estado: row.status === "present" ? "P" : row.status === "absent" ? "A" : "J",
                comentario: row.justification || ""
            };
        });
        return attendanceData;
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw error;
    } finally {
        client.release();
    }


}


export async function parcialUpdateEvent(data, eventId, user) {
    const client = await pool.connect();

    try{
        await client.query('BEGIN');
        // ========== OBTENER ESTADO ORIGINAL ==========
        const oldEventRes = await client.query(
            `SELECT name, description, event_date, type_id
             FROM events WHERE id = $1 FOR UPDATE`,
            [eventId]
        );

        if (!oldEventRes.rows.length) {
            throw new Error("Evento no encontrado");
        }

        const oldEvent = oldEventRes.rows[0];
        // se gurdan solo los datos que cambiaron
        const oldData = {};
        const newData = {};

        // =======================================================
        let keys = ''
        const values=[]

        if(data.name){
            values.push(data.name)
            keys+=`name=$${values.length},`
        }
        if(data.description){
            values.push(data.description)
            keys+=`description=$${values.length},`
        }
        if(data.date){
            values.push(data.date)
            keys+=`event_date=$${values.length},`
        }
        if(data.type_id){
            values.push(data.type_id)
            keys+=`type_id=$${values.length},`
        }
        if(keys.length>0){
            const updateEventText = `UPDATE events SET ${keys.slice(0,-1)} WHERE id=$${values.length+1}`;
            values.push(eventId)
            await client.query(updateEventText, values);
        }
        const affected_members = []
        if(data.attendance){

            // ========== obtener las ASISTENCIAS ORIGINALES ==========
            const memberIds = Object.keys(data.attendance);

            const oldAttendanceMap = new Map();

            if (memberIds.length > 0) {
                const oldAttendanceRes = await client.query(
                    `SELECT member_id, status, justification
                     FROM event_attendance
                     WHERE event_id = $1
                     AND member_id = ANY($2::int[])`,
                    [eventId, memberIds]
                );

                for (const row of oldAttendanceRes.rows) {
                    oldAttendanceMap.set(String(row.member_id), row);
                }
            }

            const oldAttendance = {};
            const newAttendance = {};

            // =====================================================

            const upsertAttendanceText = `
  INSERT INTO event_attendance (event_id, member_id, status, justification)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (event_id, member_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    justification = EXCLUDED.justification
`;
            for(const memberId in data.attendance){
                const {estado, comentario}= data.attendance[memberId]

                const newEstado = trueValuesStatus(estado)
                if (!newEstado) {
                    throw new Error(`Estado inválido para member ${memberId}`);
                }
                const newComentario = (newEstado==='justified')? comentario||'' :''

                await client.query(upsertAttendanceText, [eventId, memberId, newEstado, newComentario]);

                // ========== COMPARAR ASISTENCIAS ==========
                const old = oldAttendanceMap.get(String(memberId));

                if (
                    !old ||
                    old.status !== newEstado ||
                    old.justification !== newComentario
                ) {
                    oldAttendance[memberId] = old ? {
                        estado: old.status,
                        comentario: old.justification
                    } : null;

                    newAttendance[memberId] = {
                        estado: newEstado,
                        comentario: newComentario
                    };
                    affected_members.push(memberId);
                }

            }

            if (Object.keys(newAttendance).length > 0) {
                oldData.attendance = oldAttendance;
                newData.attendance = newAttendance;
            }
            
        }


        if (Object.keys(newData).length > 0) {
            await createAuditLog(client, {
                actorId:user.id,
                action: "event.update",
                entityType: "event",
                entityId: eventId,
                entityName: newData.name || oldEvent.name,
                oldData,
                newData,
                affectedMembers:affected_members
            });
        }


        await client.query('COMMIT');
        return true


    }catch(e){
        await client.query('ROLLBACK');
        console.error(e)
        throw new Error("error al procesar solicitud en service");
        

        

    }finally {
        client.release();
    }
    


    
}