import { getAttendanceByEventId, newEvent, parcialUpdateEvent } from "../services/events.service.js";
import { parcialUpdateMember } from "../services/members.service.js";




export async function patchMember(req, res){
  try{


    const { memberId } = req.params;
    if (!memberId) return res.status(400).json({ok:false, error:'falta el memberId'})

    if (!req.body) {
      return res.status(400).json({ ok: false, error: "Body requerido" });
    }

<<<<<<< HEAD
    const { nickname, rank_id } = req.body;

    if (!nickname && !rank_id) {
=======
    const val = req.body;
    
    if (!val.nickname && !val.rank_id) {
>>>>>>> 4bb12e1 (feat: implement member update functionality with patchMember endpoint and EditMemberModal integration)
      return res.status(400).json(
        { 
          ok: false, error: "Datos incompletos del evento tiene que haber porlomenos un parametro a cambiar",
          example: {
            "nickname": "Raul",
<<<<<<< HEAD
            "rankId": 5,
=======
            "rank_id": 5,
>>>>>>> 4bb12e1 (feat: implement member update functionality with patchMember endpoint and EditMemberModal integration)
          }
        }
      );
    }


		// service
<<<<<<< HEAD
		const memberEdit = parcialUpdateMember({nickname, rank_id}, memberId)
=======
		const memberEdit =await parcialUpdateMember(val, memberId)
>>>>>>> 4bb12e1 (feat: implement member update functionality with patchMember endpoint and EditMemberModal integration)
		if (memberEdit){
    	res.json({ ok : true, });

		}


  }catch(e){
		return res.status(500).json({ ok: false, error: "Error inesperado en api" });
	}


}