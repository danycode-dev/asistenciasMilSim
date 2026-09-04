import { getAttendanceByEventId, newEvent, parcialUpdateEvent } from "../services/events.service.js";
import { parcialUpdateMember } from "../services/members.service.js";




export async function patchMember(req, res){
  try{


    const { memberId } = req.params;
    if (!memberId) return res.status(400).json({ok:false, error:'falta el memberId'})

    if (!req.body) {
      return res.status(400).json({ ok: false, error: "Body requerido" });
    }

    const { nickname, rank_id } = req.body;

    if (!nickname && !rank_id) {
      return res.status(400).json(
        { 
          ok: false, error: "Datos incompletos del evento tiene que haber porlomenos un parametro a cambiar",
          example: {
            "nickname": "Raul",
            "rankId": 5,
          }
        }
      );
    }


		// service
		const memberEdit = parcialUpdateMember({nickname, rank_id}, memberId)
		if (memberEdit){
    	res.json({ ok : true, });

		}


  }catch(e){
		return res.status(500).json({ ok: false, error: "Error inesperado en api" });
	}


}