
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

        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-1">
            Registro de Asistencia
          </h2>

          <p className="text-sm text-gray-500">
            Crea o edita eventos y registra la asistencia de los miembros.
          </p>
        </div>


        {/* Configuración del evento */}
        <div className="bg-dashboard-item border border-[#444] rounded-lg p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Evento */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400">
                Evento
              </label>

              <select
                value={selectCurrentEvent}
                onChange={(e) =>
                  setCurrentEventHandler(e.target.value)
                }
                className="
                  w-full
                  bg-[#303030]
                  border border-[#444]
                  text-gray-200
                  rounded-lg
                  px-3
                  py-2
                  outline-none
                  transition
                  focus:border-(--accent-color)
                  focus:ring-1
                  focus:ring-(--accent-color)
                "
              >
                {dashboardData?.events?.map(ev => (
                  <option
                    key={`options${ev.id}`}
                    value={ev.id}
                  >
                    {ev.name} - {ev.event_date.split("T")[0]}
                  </option>
                ))}

                <option value="new">
                  Nuevo Evento
                </option>
              </select>
            </div>


            {/* Fecha */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400">
                📅 Fecha del Evento
              </label>

              <input
                type="date"
                id="dateSelector"
                onChange={loadAttendanceForDate}
                value={currentEvent.date}
                readOnly={!currentEvent.isNew}
                className="
                  w-full
                  bg-[#303030]
                  border border-[#444]
                  text-gray-200
                  rounded-lg
                  px-3
                  py-2
                  outline-none
                  transition
                  focus:border-(--accent-color)
                  focus:ring-1
                  focus:ring-(--accent-color)
                  read-only:opacity-60
                  read-only:cursor-not-allowed
                "
              />
            </div>


            {/* Nombre */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-400">
                Nombre del Evento
              </label>

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
                readOnly={!currentEvent.isNew}
                placeholder="Ej: Entrenamiento semanal"
                className="
                  w-full
                  bg-[#303030]
                  border border-[#444]
                  text-gray-200
                  placeholder:text-gray-600
                  rounded-lg
                  px-3
                  py-2
                  outline-none
                  transition
                  focus:border-(--accent-color)
                  focus:ring-1
                  focus:ring-(--accent-color)
                  read-only:opacity-60
                  read-only:cursor-not-allowed
                "
              />
            </div>

          </div>
        </div>


        {/* Selector global */}
        {currentEvent.isNew && (
          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          bg-dashboard-item
            
            border
            border-[#444]
            rounded-lg
            px-5
            py-4
            mb-6
          ">

            <div>
              <div className="text-sm font-semibold text-gray-300">
                Asistencia global
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Aplica el estado seleccionado a los miembros.
              </div>
            </div>


            <div className="flex items-center gap-2">

              {["P", "A", "C"].map(val => {

                const selected = AllSelector === val;

                return (
                  <label
                    key={val}
                    className={`
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      rounded-lg
                      border
                      cursor-pointer
                      transition
                      text-sm
                      font-semibold

                      ${
                        selected
                          ? val === "P"
                            ? "bg-green-900/30 border-green-700 text-(--success-color)"
                            : val === "A"
                              ? "bg-red-900/30 border-red-700 text-(--danger-color)"
                              : "bg-gray-700/40 border-gray-600 text-gray-300"
                          : "bg-[#303030] border-[#444] text-gray-500 hover:bg-[#383838] hover:text-gray-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={`allSelector_${val}`}
                      checked={selected}
                      onChange={() => setAllSelector(val)}
                      className="accent-(--accent-color)"
                    />

                    {val === "C" ? "Clear" : val}
                  </label>
                );
              })}

            </div>
          </div>
        )}


        {/* Lista de asistencia */}
        <div id="attendanceFormsContainer" className="space-y-6">

          {dashboardData?.ranks?.map(rank => {

            const membersInRank =
              dashboardData?.membersByRank?.[rank.id] || [];

            if (membersInRank.length === 0) return null;

            return (
              <div
                key={rank.id}
                className="
                  bg-[#242424]
                  border
                  border-[#444]
                  rounded-lg
                  overflow-hidden
                "
              >

                {/* Header del rango */}
                <div className="
                  flex
                  items-center
                  justify-between
                  px-5
                  py-3
                  bg-[#333]
                  border-b
                  border-[#444]
                ">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-1
                        h-7
                        rounded-full
                        bg-(--accent-color)
                      "
                    />

                    <div>
                      <h3 className="border-0 p-0 mb-0">
                        {rank.plural_name}
                      </h3>

                      <span className="text-xs text-gray-500">
                        {membersInRank.length}{" "}
                        {membersInRank.length === 1
                          ? "miembro"
                          : "miembros"}
                      </span>
                    </div>

                  </div>

                </div>


                {/* Miembros */}
                <div className="divide-y divide-[#444]">

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
                        key={member.id}
                        className="
                          px-5
                          py-4
                          transition
                          bg-dashboard-item
                          hover:bg-[#3a3a3a]
                        "
                      >

                        {/* Información + asistencia */}
                        <div className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:items-center
                          gap-4
                        ">

                          {/* Nombre */}
                          <div className="flex-1 min-w-0">

                            <div className="
                              flex
                              items-center
                              gap-2
                              min-w-0
                            ">

                              <div
                                className="
                                  w-9
                                  h-9
                                  shrink-0
                                  rounded-full
                                  bg-[#454545]
                                  border
                                  border-[#555]
                                  flex
                                  items-center
                                  justify-center
                                  text-sm
                                  font-bold
                                  text-(--accent-color)
                                "
                              >
                                {member.nickname
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>

                              <div className='text-sm font-semibold text-gray-300 truncate'>
                                <span className='text-gray-500'>
                                  {rank.short_name !== ""
                                  ? `[${rank.short_name}] `
                                  : ""}
                                </span>
                              <span className="">                       

                                {member.nickname}

                              </span>
                              </div>

                            </div>

                          </div>


                          {/* Opciones */}
                          <div className="
                            flex
                            flex-wrap
                            gap-2
                          ">

                            {["P", "A", "J"].map(val => {

                              const selected =
                                entry.estado === val;

                              return (
                                <label
                                  key={val}
                                  className={`
                                    flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-lg
                                    border
                                    cursor-pointer
                                    transition
                                    text-xs
                                    font-semibold

                                    ${
                                      selected
                                        ? val === "P"
                                          ? "bg-green-900/30 border-green-700 text-(--success-color)"
                                          : val === "A"
                                            ? "bg-red-900/30 border-red-700 text-(--danger-color)"
                                            : "bg-yellow-900/30 border-yellow-700 text-(--warning-color)"
                                        : "bg-[#303030] border-[#444] text-gray-500 hover:bg-[#383838] hover:text-gray-300"
                                    }
                                  `}
                                >

                                  <input
                                    type="radio"
                                    name={`att_${member.id}`}
                                    value={val}
                                    checked={selected}
                                    onChange={() =>
                                      toggleMemberAttendance(
                                        member,
                                        val,
                                        ""
                                      )
                                    }
                                    className="accent-(--accent-color)"
                                  />

                                  {val === "J" ? "Aviso" : val}

                                </label>
                              );
                            })}

                          </div>

                        </div>


                        {/* Comentario */}
                        {visible && (
                          <div className="mt-3">

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
                              className="
                                w-full
                                min-h-20
                                bg-[#303030]
                                border
                                border-[#444]
                                text-gray-200
                                placeholder:text-gray-600
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                resize-y
                                outline-none
                                transition
                                focus:border-(--accent-color)
                                focus:ring-1
                                focus:ring-(--accent-color)
                              "
                            />

                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>

              </div>
            );
          })}

        </div>


        {/* Botones */}
        <div className="
          flex
          flex-col-reverse
          sm:flex-row
          gap-3
          justify-end
          mt-6
          pt-5
          border-t
          border-[#444]
        ">

          {(!isBlock && !currentEvent.isNew) && (
            <button
              onClick={cancelEditHandler}
              className="
                px-4
                py-2
                rounded-lg
                bg-[#444]
                border
                border-[#555]
                text-gray-300
                text-sm
                font-semibold
                hover:bg-[#505050]
                hover:text-white
                transition
              "
            >
              Cancelar Cambios
            </button>
          )}

          <button
            onClick={() => saveAttendanceHandler()}
            disabled={isBlock}
            className={`
              px-4
              py-2
              rounded-lg
              text-sm
              font-bold
              transition

              ${
                isBlock
                  ? "bg-[#454545] text-gray-500 cursor-not-allowed opacity-60"
                  : "bg-(--accent-color) text-black hover:opacity-90 cursor-pointer"
              }
            `}
          >
            {textSumit}
          </button>

        </div>

      </div>
    </div>
  </>
);

}
