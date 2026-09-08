
import { useMemo, useState } from "react";
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
    
    const [inputArea, setInputArea] = useState('')
    const InputAreaHandler = (input)=>{
        setInputArea(input)
    }

    const hinputError = ()=>{
        if(inputArea ==="" || isValidJSON(inputArea)) return false        
        return true
    }
    const inputError= hinputError()

    function isValidJSON(string) {
    try {
        const result = JSON.parse(string)
        return typeof result === "object" && result !== null && typeof result.attendance ==="object"
    } catch {
        return false
    }
}
    const [copied, setCopied] = useState(false)

    const buildIaPrompt = () => {
        const pre = structuredClone(event)
        const pre2 = {
                attendance:Object.fromEntries(
                    Object.entries(pre.attendance).map(([memberId, ate]) =>{
                        
                        const member = membersById[memberId]
                        return [
                            memberId,
                            {
                                rank_name:ranksById[member.rank_id].short_name,
                                nickname:member.nickname,
                                ...ate
                            }
                        ]
                    })
                ),
                date:pre.date,
                name:pre.name,
                description:pre.description            }
                
        const prompt = "Quiero que registres la asistencia del evento utilizando la información proporcionada por el usuario.\n\nRecibirás un JSON con la lista de participantes y la información necesaria para identificar a cada uno.\n\nLos estados permitidos son:\nP = Presente\nA = Ausente\nJ = Justificado\n\nDetermina el estado de cada participante según la información proporcionada por el usuario.\n\nSi una persona estuvo presente, establece su estado como P.\nSi estuvo ausente, establece su estado como A.\nSi tuvo una justificación o permiso, establece su estado como J y coloca el motivo en comentario cuando corresponda.\n\nInterpreta expresiones como \"fueron\", \"asistieron\", \"faltaron\", \"no fueron\", \"tenía permiso\", \"estaba justificado\", etc.\n\nSi el usuario indica quiénes estuvieron presentes y no menciona al resto, considera ausentes a los no mencionados.\n\nSi el usuario indica que todos estuvieron presentes excepto determinadas personas, considera presentes a todos los demás.\n\nLos identificadores numéricos son las claves del objeto y son obligatorios.\n\nDEBES conservar exactamente todos los identificadores recibidos.\nNO puedes agregar identificadores.\nNO puedes eliminar identificadores.\nNO puedes modificar identificadores.\n\nEl identificador numérico es la única referencia que debes utilizar para construir el resultado.\n\nLos campos nickname, rank_name u otros datos descriptivos sirven únicamente para identificar visualmente a la persona. NO deben aparecer en el resultado final.\n\nEl resultado debe contener únicamente:\n- estado\n- comentario\n\nNo devuelvas nickname.\nNo devuelvas rank_name.\nNo devuelvas ningún otro campo de los participantes.\n\nNo modifiques date.\n\nPuedes modificar name y description únicamente si el usuario proporciona explícitamente nuevos valores.\n\nREGLA CRÍTICA SOBRE EL FORMATO:\n\nLa respuesta DEBE ser un JSON válido y parseable directamente mediante JSON.parse().\n\nNO escribas Markdown.\nNO escribas ```json.\nNO escribas explicaciones.\nNO escribas texto antes ni después del JSON.\n\nUtiliza exclusivamente comillas dobles para las claves y strings JSON.\n\nSi algún texto que debas colocar dentro de un string contiene comillas, debes escaparlas correctamente.\n\nAntes de responder, verifica mentalmente que el resultado completo pueda ser procesado directamente mediante JSON.parse() sin producir ningún error.\n\nLa estructura de salida debe ser exactamente:\n\n{\n  \"attendance\": {\n    \"ID\": {\n      \"estado\": \"P\",\n      \"comentario\": \"\"\n    }\n  },\n  \"name\": \"\",\n  \"description\": \"\"\n}\n\nJSON de entrada:"
        return prompt + JSON.stringify(pre2)
    }
    const finalPrompt = useMemo(()=>{
        return(
            buildIaPrompt()
        )
    },[event, membersById, ranksById]) 
    
    const clipboardHandler = async () => {
        await navigator.clipboard.writeText(finalPrompt)
        
        setCopied(true)
        
        setTimeout(() => {
            setCopied(false)
        }, 1500)
    }

    const { closeModal } = useModal();
    const summitHandler = async ()=>{

        
        try{
            const inputParse= JSON.parse(inputArea)
            let newEvent = {
                ...structuredClone(event),
                attendance:Object.fromEntries(
                    Object.entries(inputParse.attendance)
                ),
                name:inputParse.name? inputParse.name : event.name,
                description: inputParse.description? inputParse.description : event.description
            }   
            saveEventFunction(newEvent)
            closeModal('assitencia Aplicada')
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
                    overflow-y-scroll py-3 px-1 h-40 min-h-30 
                   bg-black/15 w-full whitespace-pre-wrap break-all
                   ">
                    {finalPrompt}
                  </pre>
                  <button
                      onClick={()=>clipboardHandler()}
                      className={`
                          btn-primary w-40 h-7 p-0 m-auto mt-3
                          flex justify-center items-center gap-2
                          transition-all duration-200 ease-out
                          active:scale-90
                          ${copied
                              ? "scale-105"
                              : "hover:scale-105 hover:shadow-lg"
                          }
                      `}
                  >
                      <span
                          className={`
                              transition-all duration-200
                              ${copied ? "scale-110" : ""}
                          `}
                      >
                          {copied ? "✓" : "⧉"}
                      </span>
                          
                      <span
                          className="transition-all duration-200"
                      >
                          {copied ? "¡Copiado!" : "Copiar"}
                      </span>
                  </button>

                  <label className="flex flex-col mt-7 gap-1">
                    <span>Insertar JSON Aqui:</span>
                    <textarea 
                        value={inputArea}
                        onChange={e=>InputAreaHandler(e.target.value)}
                        className={`${inputError ? 'border border-red-600 focus:border-red-600 focus:outline-2 focus:outline-red-600':''}`}
                    ></textarea>
                  </label>
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
                        disabled={!(inputArea!=='' && !inputError)}
                        onClick={() => summitHandler()}
                        className={`
                            btn-primary 
                            
                            ${(inputArea!=='' && !inputError) ? '':'cursor-not-allowed opacity-35'}`}
                    >
                        Aplicar Cambios
                    </button>

                </div>

            </div>

        </div>
    );
}
