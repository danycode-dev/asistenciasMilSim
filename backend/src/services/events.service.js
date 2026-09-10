import pool from "../db/pool.js";

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
    }
}
export async function newEvent(eventData) {

    if (!eventData.name || !eventData.date) {
        throw new Error("Datos incompletos del evento");
    }
    eventData.description = eventData.description || "";
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const insertEventText = 'INSERT INTO events(name, description, event_date) VALUES($1, $2, $3) RETURNING id';
        const insertEventValues = [eventData.name, eventData.description, eventData.date];
        const res = await client.query(insertEventText, insertEventValues);
        const eventId = res.rows[0].id;

        const insertAttendanceText = 'INSERT INTO event_attendance(event_id, member_id, status, justification) VALUES($1, $2, $3, $4)';
        for (const memberId in eventData.attendance) {
            console.log(eventData.attendance[memberId])
            const { estado, comentario } = eventData.attendance[memberId];
            const coment = estado === "J" ? comentario : "";
            console.log(`Insertando asistencia ${memberId}: estado=${estado}, comentario=${coment}`);
            const insertAttendanceValues = [eventId, memberId, trueValuesStatus(estado), coment];
            await client.query(insertAttendanceText, insertAttendanceValues);
        }

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


export async function parcialUpdateEvent(data, eventId) {
    const client = await pool.connect();

    try{
        await client.query('BEGIN');
        
        if(data.attendance){
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

            }
            
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