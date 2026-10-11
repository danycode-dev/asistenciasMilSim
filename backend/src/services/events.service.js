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
    },
    "type_id": 1
}
export async function newEvent(eventData) {

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