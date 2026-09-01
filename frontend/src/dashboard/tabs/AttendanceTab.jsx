
import { useEffect, useState } from 'react'
import { useDashboardData } from '../../context/DataContext';

const newDefEvent ={
      isNew: true,
      date: new Date().toISOString().split("T")[0], // formato YYYY-MM-DD
      attendance: {}, // "member_id": { estado: 'P', comentario: '' }
      internalId: null, // solo para eventos existentes, no para nuevos
      name: "nuevo_evento" ,
      description: ""
    
    }

export default function AttendanceTab({


}) {

  const [change, setChange] =useState(null) // cuando hay cambios gurdar los objetos cambiados aqui{}
  const [inmutableEvent, setInmutableEvent] = useState(null) // cuando el evento ya existe y se quiere editar y comparar con el original


  const [commentsVisible, setCommentsVisible] = useState({});   
  const [AllSelector, setAllSelector] = useState("A"); // "P", "A", "C"
  const { dashboardData, isLoading, error, saveNewEventAndAttendace, loadAttendancebyId, reloadData, updateEventAndAttendace } = useDashboardData();
  
  const [currentEvent, setCurrentEvent] = useState(newDefEvent);
  const [selectCurrentEvent, setSelectCurrentEvent] = useState('new');
    
  




useEffect(() => {
  if (!AllSelector || !dashboardData?.members) return;

  setCurrentEvent(prev => {
    if (!prev.isNew) return prev;

    const estado = AllSelector;
    const attendance = prev.attendance


    dashboardData.members.forEach(m => {
      attendance[m.id] = {
        estado,
        comentario: attendance[m.id]?.comentario || ""
      };
    });
    console.log('attendace modf:', structuredClone(attendance))
    return {
      ...prev,
      attendance
    };
  });

}, [AllSelector, dashboardData]);

  // useefect vacio 
  useEffect(() => {
    console.log("changed:", structuredClone(currentEvent));
  }, [currentEvent]);

  
  const toggleMemberAttendance = (member, estado, comentario) => {
    // Si el estado es "J", mostrar el textarea de comentarios, sino ocultarlo

    setCommentsVisible(prev => ({
      ...prev,
      [member.id]: estado === "J"
    }));

    // Actualizar el estado de asistencia del miembro
    setCurrentEvent(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [member.id]: {
          estado,
          comentario: comentario || prev?.attendance[member.id]?.comentario || ''
        }
      }
    }));

    if (!inmutableEvent || currentEvent.isNew) return;

    const original = inmutableEvent.attendance[member.id];

    const isDifferent =
      original?.estado !== estado ||
      original?.comentario !== comentario;

    setChange(prev => {
      const newChanges = { ...prev };

      if (isDifferent) {
        newChanges.attendance = {
          ...(prev?.attendance || {}),
          [member.id]: { estado, comentario }
        };
      } else {
        // eliminar si volvió al estado original
        if (prev.attendance) {
          const { [member.id]: _, ...rest } = prev.attendance;

          if (Object.keys(rest).length === 0) {
            delete newChanges.attendance;
          } else {
            newChanges.attendance = rest;
          }
        }
      }

      return newChanges;
    });

  };



  const loadAttendanceForDate = (e) => {
    const selectedDate = e.target.value;
    setCurrentEvent(prev => ({
      ...prev,
      date: selectedDate
    }));

  };
  const saveAttendanceHandler = async () => {
      if(isBlock) return
      if (!currentEvent.isNew) {
        await updateEventAndAttendace(change, inmutableEvent.internalId)
        alert("ok, recarga la pagina para ver los cambios(todavia no se implemeta un reload automatico)");
        return;
      }
      const id =await saveNewEventAndAttendace(currentEvent);
      if (id && id !== "error") {
        setSelectCurrentEvent(`${id}`);
      }



  };

  useEffect(() => {
    const logicselect= async () => {
      
      const eventId = selectCurrentEvent;
      if (eventId==='new')return


      let attendance = dashboardData.attendances[eventId] || null;

      if (attendance===null) {
        attendance = await loadAttendancebyId(eventId);
      }
      const event= dashboardData.events.find(ev => ev.id === parseInt(eventId))

      const date = event?.event_date.split("T")[0] || new Date().toISOString().split("T")[0]
      const name =event?.name || "evento_desconocido"
      const description = event?.description || ""
      const cloneAttendace= structuredClone(attendance || {})
      setCurrentEvent({
        isNew: false,
        date:date ,
        attendance: structuredClone(cloneAttendace),
        internalId: eventId,
        name: name,
        description: description
      });
      setInmutableEvent({
        date: date,
        attendance: cloneAttendace,
        internalId: eventId,
        name: name,

      })
    }

    logicselect();
  }, [selectCurrentEvent]);

  let textSumit = currentEvent.isNew  ? "Guardar Nuevo Evento" : "Actualizar Evento Existente";

  const setCurrentEventHandler = async (eventId) => {
    setSelectCurrentEvent(eventId);
      if (eventId === "new" && !currentEvent?.isNew) {
        setCurrentEvent(newDefEvent);
        setInmutableEvent(null)
      }
  }

  const cancelEditHandler = async ()=>{
    setCurrentEvent({
      ...structuredClone(inmutableEvent),
      isNew:false
    }) 
    setChange(null)
  }


  let isBlock=false
  if (!currentEvent.isNew){
    isBlock= (!change || Object.keys(change).length === 0) ? true : false
  }
    



  return (
    <>
      {/* TAB: REGISTRO DIARIO */}
      <div id="registro" className="tab-content active">
        <div className="section-card">
          {/* Selector de evento */}
          <div className="date-container">
            <label>Crear nuevo evento o editar uno existente</label>

            <select
              value={selectCurrentEvent}
              style={{
                width: 200,
                background: "#271a1a",
                color: "#fff",
                border: "1px solid #555"
              }}
              onChange={(e) => setCurrentEventHandler(e.target.value)}
            >
              {dashboardData?.events?.map(ev => (
                <option key={`options${ev.id}`} value={ev.id}>
                  {ev.name} - {ev.event_date.split("T")[0]}
                </option>
              ))}

              <option value="new">Nuevo Evento</option>
            </select>
          </div>
          {/* Fecha */}
          <div className="date-container">
            <label>📅 Fecha del Evento:</label>
            <input
              type="date"
              id="dateSelector"
              onChange={loadAttendanceForDate}
              value={currentEvent.date}
              style={{ maxWidth: "250px" }}
              readOnly={!currentEvent.isNew}
            />
          </div>

          {/* Nombre del evento */}
          <div className="date-container">
            <label>Nombre Del Evento:</label>

            <input
              type="text"
              id="eventName"
              value={currentEvent.name}
              onChange={e =>
                setCurrentEvent(prev => ({
                  ...prev,
                  name: e.target.value
                }))
              }
              style={{ maxWidth: "350px" }}
              readOnly={!currentEvent.isNew}
            />
          </div>

          {/* Selector global */}
          {currentEvent.isNew && (
            <div className="attendance-row">
              <div className="attendance-main">
                <div className="member-name"></div>

                <div className="attendance-options">
                  {["P", "A", "C"].map(val => (
                    <label
                      key={val}
                      className="option-label"
                      style={
                        val === "C"
                          ? { color: "#888" }
                          : val === "P"
                            ? { color: "var(--success-color)" }
                            : { color: "var(--danger-color)" }
                      }
                    >
                      <input
                        type="radio"
                        name={`allSelector_${val}`}
                        checked={AllSelector === val}
                        onChange={() => setAllSelector(val)}
                      />

                      {val === "C" ? "Clear" : val}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de asistencia */}
          <div id="attendanceFormsContainer">

            {dashboardData?.ranks?.map(rank => {
              // Ahora usamos el ID del rango
              const membersInRank =
                dashboardData?.membersByRank?.[rank.id] || [];

              if (membersInRank.length === 0) return null;

              return (
                <div
                  key={rank.id}
                  style={{ marginBottom: 25 }}
                >

                  {/* Header del rango */}
                  <h4
                    style={{
                      background: "#333",
                      padding: "5px 10px",
                      borderLeft: "4px solid var(--accent-color)"
                    }}
                  >
                    {rank.plural_name}
                  </h4>


                  {/* Miembros */}
                  {membersInRank.map(member => {

                    const entry =
                      currentEvent.attendance?.[member.id] || {
                        estado: "",
                        comentario: ""
                      };

                    const visible =
                      commentsVisible[member.id] ??
                      entry.estado === "J";

                    return (
                      <div
                        className="attendance-row"
                        key={member.id}
                      >

                        <div className="attendance-main">

                          {/* Nombre + rango abreviado */}
                          <div className="member-name">

                            {rank.short_name !== ""
                              ? `[${rank.short_name}] `
                              : ""}

                            {member.nickname}

                          </div>


                          {/* Opciones de asistencia */}
                          <div className="attendance-options">

                            {["P", "A", "J"].map(val => (

                              <label
                                key={val}
                                className="option-label"
                                style={
                                  val === "J"
                                    ? {
                                        color:
                                          "var(--warning-color)"
                                      }
                                    : val === "P"
                                      ? {
                                          color:
                                            "var(--success-color)"
                                        }
                                      : {
                                          color:
                                            "var(--danger-color)"
                                        }
                                }
                              >

                                <input
                                  type="radio"
                                  name={`att_${member.id}`}
                                  value={val}
                                  checked={entry.estado === val}
                                  onChange={() =>
                                    toggleMemberAttendance(
                                      member,
                                      val,
                                      ""
                                    )
                                  }
                                />

                                {val === "J" ? "Aviso" : val}

                              </label>

                            ))}
                          </div>
                        </div>

                        {/* Comentario */}
                        {visible && (
                          <div className="comment-box visible">
                            <textarea
                              value={entry.comentario || ""}
                              onChange={e =>
                                toggleMemberAttendance(
                                  member,
                                  entry.estado,
                                  e.target.value
                                )
                              }
                              placeholder="Escribe el motivo del aviso..."
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>


          {/* Botones */}
          <div className="flex gap-3 justify-end">

            {(!isBlock && !currentEvent.isNew) && (
              <button
                onClick={cancelEditHandler}
                className="bg-red-500 text-black rounded px-3 font-bold"
              >
                Cancelar Cambios
              </button>
            )}

            <button
              className="btn-primary"
              style={{
                backgroundColor: isBlock
                  ? "var(--btn-block)"
                  : "var(--accent-color)",

                cursor: isBlock
                  ? "not-allowed"
                  : "pointer",

                opacity: isBlock ? 0.6 : 1
              }}
              onClick={() => saveAttendanceHandler()}
            >
              {textSumit}
            </button>
          </div>
        </div>
      </div>
    </>
  );

}
