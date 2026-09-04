import pool from "../db/pool.js";

const ejemploBody = {} 
    

//export async function newEvent(eventData) {
//
//    if (!eventData.name || !eventData.date) {
//        throw new Error("Datos incompletos del evento");
//    }
//    eventData.description = eventData.description || "";
//    const client = await pool.connect();
//
//    try {
//        await client.query('BEGIN');
//        
//        const insertEventText = 'INSERT INTO events(name, description, event_date) VALUES($1, $2, $3) RETURNING id';
//        const insertEventValues = [eventData.name, eventData.description, eventData.date];
//        const res = await client.query(insertEventText, insertEventValues);
//        const eventId = res.rows[0].id;
//
//        const insertAttendanceText = 'INSERT INTO event_attendance(event_id, member_id, status, justification) VALUES($1, $2, $3, $4)';
//        for (const memberId in eventData.attendance) {
//            console.log(eventData.attendance[memberId])
//            const { estado, comentario } = eventData.attendance[memberId];
//            const coment = estado === "J" ? comentario : "";
//            console.log(`Insertando asistencia ${memberId}: estado=${estado}, comentario=${coment}`);
//            const insertAttendanceValues = [eventId, memberId, trueValuesStatus(estado), coment];
//            await client.query(insertAttendanceText, insertAttendanceValues);
//        }
//
//        await client.query('COMMIT');
//
//
//    return { eventId }
//    } catch (error) {
//        await client.query('ROLLBACK');
//        console.error("Error creating event:", error);
//        throw error;
//    } finally {
//        client.release();
//    }
//
//
//}

const allowedFields = {
    nickname: 'nickname',
    rank_id: 'rank_id',
};
export async function parcialUpdateMember(data, memberId) {
    const client = await pool.connect();
    const fields = []
    const values = []
    for(const [key, value] of Object.entries(data)){
        if (!allowedFields[key]) continue
        fields.push( `${allowedFields[key]} = $${values.length + 1}`)
        values.push(value)
    }
    values.push(memberId)
    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }
    try{
        await client.query('BEGIN');
        
        const query = `
            UPDATE members
            SET ${fields.join(', ')}
            WHERE id = $${values.length}
            RETURNING *;
        `;
        
        const {rows} = await client.query(query, values);
        
        await client.query('COMMIT');
        return rows[0];


    }catch(e){
        await client.query('ROLLBACK');
        console.error(e)
        throw new Error("error al procesar solicitud en service");
        

        

    }finally {
        client.release();
    }
    


    
}