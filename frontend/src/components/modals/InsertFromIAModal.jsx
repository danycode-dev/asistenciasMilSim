
import { useState } from "react";
import { useDashboardData } from "../../context/DataContext";
import { useModal } from "../../context/ModalContext";

export default function InsertFromIA(
    {
        event={
            isNew: true,
            date: null,
            attendance: {}, // "member_id": { estado: 'P', comentario: '' }
            internalId: null, // solo para eventos existentes, no para nuevos
            name: "" ,
            description: ""
        },
        saveEventFunction = null
    }
) {
    const {ranksById, dashboardData, isLoading, error, reloadData, membersById } = useDashboardData();
    


    const { closeModal } = useModal();
    const [value, setValues] = useState(
        {
        }
    )
    const pre = structuredClone(event)
    const pre2 = {
            attendance:{},
            date:pre.date,
            name:pre.name,
            description:pre.description
            
        }
    Object.entries(pre.attendance).map(([memberId, ate])=>{
            const member = membersById[memberId]
            pre2.attendance[memberId]={
                rank_name:ranksById[member.rank_id].short_name,
                nickname:member.nickname,
                ...ate
            }
    })
    const prompt =`Quiero que registres la asistencia del evento utilizando la información proporcionada por el usuario.

Recibirás un JSON que contiene la lista de participantes. Cada participante tiene un identificador numérico único, un rango, un nickname, un estado y un comentario.

Los estados permitidos son:

P = Presente
A = Ausente
J = Justificado

Determina el estado de cada participante utilizando la información proporcionada por el usuario.

Si una persona estuvo presente, establece su estado como P.

Si una persona estuvo ausente, establece su estado como A.

Si una persona tuvo una justificación o permiso, establece su estado como J.

Si una persona tiene estado J, utiliza el campo comentario para indicar brevemente el motivo de la justificación cuando el usuario lo haya proporcionado.

El usuario puede describir la asistencia de cualquier manera. Debes interpretar correctamente expresiones como "fueron", "asistieron", "estuvieron presentes", "faltaron", "no fueron", "tenía permiso", "estaba justificado", etc.

Cuando el usuario indique una lista de personas presentes y no indique qué ocurrió con el resto, considera que las personas no mencionadas estuvieron ausentes.

Si el usuario indica que todos estuvieron presentes excepto determinadas personas, considera presentes a todos los demás y aplica el estado correspondiente a las personas mencionadas.

Si existen personas con el mismo nickname, utiliza el rank_name para distinguirlas cuando sea posible.

Los identificadores numéricos son datos internos de la aplicación. Nunca los cambies, intercambies ni reutilices.

Conserva exactamente los identificadores de cada participante.

No elimines participantes.

No agregues participantes.

No modifiques los nickname.

No modifiques los rank_name.

No modifiques la date.

Puedes modificar name si el usuario proporciona un nombre diferente para el evento.

Puedes modificar description si el usuario proporciona una descripción para el evento.

Mantén exactamente la misma estructura del JSON recibido.

El resultado debe ser un JSON válido.

Devuelve únicamente el JSON final, sin explicaciones, sin texto adicional y sin formato Markdown.

JSON:
`
const json = JSON.stringify(pre2)
const prompFinal = prompt + json
    const summitHandler = async ()=>{

        
        try{
            //
            closeModal('assitencia Guardada')
        }catch(e){
            console.error(e)
        }
    }
    const valueChangeHandler=(key, value)=>{
        // pass
    }


    return (
        <div className="fixed inset-0 z-1000 flex items-center  justify-center bg-black/80 backdrop-blur-sm">
        
            <div className="w-[90%] max-w-2xl bg-dashboard-card
            flex flex-col 
            max-h-[90%] rounded-dashboard border border-dashboard-accent shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-center relative px-6 py-4 border-b border-dashboard-border">

                    <div>
                        <h2 className="mb-0! p-0 text-xl">
                            Insertar Asistencia Con IA
                        </h2>
                        {
                        //    <p className="text-sm text-gray-500 mt-1">
                        //    Modifica la información del miembro.
                        //    </p>
                        }
                    </div>

                    <button
                        onClick={() => closeModal()}
                        className="
                            text-3xl
                            leading-none
                            text-gray-500
                            hover:text-white
                            transition
                            p-5
                            absolute
                            right-0
                        "
                    >
                        ×
                    </button>

                </div>


{/* Contenido */}
<div className="px-6 py-6 overflow-y-scroll flex-1 flex flex-col">

  <pre className=" text-sm
    overflow-y-scroll py-3 px-1 h-40 
   bg-black/15 w-full whitespace-pre-wrap break-all">
    {prompFinal}
  </pre>
  <button className="btn-primary w-40 h-7 p-0 flex justify-center items-center m-auto mt-3">Copiar</button>

</div>


                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-dashboard-border">

                    <button
                        onClick={() => closeModal()}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>

                    <button
                        disabled={false}
                        onClick={() => summitHandler()}
                        className={`
                            btn-primary 
                            
                            ${true ? '':'cursor-not-allowed opacity-35'}`}
                    >
                        Guardar cambios
                    </button>

                </div>

            </div>

        </div>
    );
}
