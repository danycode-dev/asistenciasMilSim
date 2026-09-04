import { parcialUpdateMember } from "../services/members.service.js";




export async function patchMember(req, res){
  try{


    const { memberId } = req.params;
    if (!memberId) return res.status(400).json({ok:false, error:'falta el memberId'})

    if (!req.body) {
      return res.status(400).json({ ok: false, error: "Body requerido" });
    }

    const val = req.body;
    
    if (!val.nickname && !val.rank_id) {
      return res.status(400).json(
        { 
          ok: false, error: "Datos incompletos del evento tiene que haber porlomenos un parametro a cambiar",
          example: {
            "nickname": "Raul",
            "rank_id": 5,
          }
        }
      );
    }


		// service
		const memberEdit =await parcialUpdateMember(val, memberId)
		if (memberEdit){
    	res.json({ ok : true, });

		}


  }catch(e){
		return res.status(500).json({ ok: false, error: "Error inesperado en api" });
	}


}