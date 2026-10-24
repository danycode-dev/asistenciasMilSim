
import { useEffect, useState } from 'react'
import { useDashboardData } from '../../context/DataContext';
import { useModal } from '../../context/ModalContext';
import { useUser } from '../../context/UserContext';
import { ALERT_TYPES, useAlertGlobal } from '../../context/AlertContext';
import { User } from '../../entities/user.entity';

export default function MemberTab({}) {

  const { dashboardData, deleteMember, reloadData, membersById, unitsById } = useDashboardData();
  
  /** @type {{ user: User | undefined }} */
  const { user } = useUser();
  const {addGlobalAlert} = useAlertGlobal();
  


  const { openModal } = useModal();

  const editMemberHandler = async(id)=>{
    if (!user.hasPermission('members.edit')){
      return addGlobalAlert({
        estado:ALERT_TYPES.ERROR,
        msg: "No tienes permisos para editar miembros"
      })
    }
    console.log(membersById)
    const member = membersById[id]
    await openModal('edit-member',{
      member
    })
  }
  const viewMemberHandler = async(id)=>{
    const member = membersById[id]
    await openModal('view-member',{
      member
    })
  }
  const newMemberHandler = async() =>{
    if (!user.hasPermission('members.create')){
      return addGlobalAlert({
        estado:ALERT_TYPES.ERROR,
        msg: "No tienes permisos para crear miembros"
      })
    }
    await openModal('new-member',{})
  }
  const noDisponible = async()=>{
    return addGlobalAlert({
        estado:ALERT_TYPES.ERROR,
        msg: "No disponible"
      })
  }

  const deleteMemberHandler = async (id) => {
    if (!user.hasPermission('members.delete')){
      return addGlobalAlert({
        estado:ALERT_TYPES.ERROR,
        msg: "No tienes permisos para eliminar miembros"
      })
    }
    const member = membersById[id];
    

    const confirmed = await openModal("confirm", {
      title: "Eliminar miembro",
      message: `¿Estás seguro de que quieres eliminar a ${member.nickname}?`,
      confirmText: "Eliminar",
      danger: true
    });

    if (!confirmed) return;

    await deleteMember(id)
  };
  
return (
  <>
    <div id="miembros" className="tab-content active">
      <div className="section-card">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="mb-1">Gestión de Miembros</h2>
            <p className="text-sm text-gray-500">
              Administra los miembros, rangos y categorías de la organización.
            </p>
          </div>

          {/* Buscador - visual por ahora */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar miembro..."
              className="w-64"
            />

            <button className="btn-primary" onClick={()=>{newMemberHandler()}} >
              + Agregar miembro
            </button>
          </div>
        </div>


        {/* Resumen */}
        <div className="flex justify-around gap-4 mb-6">

          <div className="bg-[#363636] rounded-lg p-4 border border-[#444] w-full max-w-110">
            <div className="text-sm text-gray-500">
              Miembros
            </div>

            <div className="text-2xl font-bold text-dashboard-accent">
              {dashboardData?.members?.length || 0}
            </div>
          </div>


          <div className="bg-[#363636] rounded-lg p-4 border border-[#444]  w-full max-w-110">
            <div className="text-sm text-gray-500">
              Categorías
            </div>

            <div className="text-2xl font-bold text-dashboard-accent">
              {dashboardData?.ranks?.length || 0}
            </div>
          </div>




        </div>


        {/* Miembros por rango */}
        <div className="space-y-6">

          {dashboardData?.ranks?.map((rank) => {
            
            const members = dashboardData?.membersByRank?.[rank.id] || [];

            if (members.length === 0) return null;

            return (
              <div
                key={rank.id}
                className="bg-[#242424] rounded-lg border border-[#444] overflow-hidden"
              >

                {/* Header del rango */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#333] border-b border-[#444]">

                  <div className="flex items-center gap-3">

                    <div
                      className="w-1 h-7 rounded-full bg-dashboard-accent"
                    />

                    <div>
                      <h3 className="border-0 p-0 mb-0">
                        {rank.plural_name}
                      </h3>

                      <span className="text-xs text-gray-500">
                        {members.length}{" "}
                        {members.length === 1 ? "miembro" : "miembros"}
                      </span>
                    </div>

                  </div>


                  {/* Botón visual */}
                  <button onClick={noDisponible} className="btn-secondary text-sm">
                    Gestionar rango
                  </button>

                </div>


                {/* Lista */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">

                  {members.map((member) => (

                    <MemberRow 
                      key={member.id}
                      member={member} 
                      editMemberHandler={editMemberHandler} 
                      viewMemberHandler={viewMemberHandler}
                      rank={rank}
                      unitsById={unitsById}
                      deleteMemberHandler={deleteMemberHandler}
                    />

                  ))}

                </div>

              </div>
            );

          })}

        </div>


        {/* Sin miembros */}
        {(!dashboardData?.members || dashboardData.members.length === 0) && (

          <div className="text-center py-16 text-gray-500">

            <div className="text-4xl mb-3">
              👥
            </div>
            <p className="text-lg">
              No hay miembros registrados
            </p>

            <p className="text-sm mt-1">
              Los miembros aparecerán aquí cuando sean registrados.
            </p>

          </div>

        )}

      </div>
    </div>
  </>
);
}



function MemberRow({
  member,
  viewMemberHandler,
  editMemberHandler,
  rank,
  unitsById,
  deleteMemberHandler

}){
return(
  

    <div
      key={member.id}
      className="
        group
        flex
        flex-wrap
        items-center
        justify-between
        gap-4
        bg-[#303030]
        hover:bg-[#383838]
        border
        border-[#444]
        rounded-lg
        p-4
        transition
      "
    >
      {/* Información principal */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div
          className="
            flex
            items-center
            justify-center
            shrink-0
            w-11
            h-11
            rounded-full
            bg-[#454545]
            border
            border-[#555]
            font-bold
            text-dashboard-accent
          "
        >
          {member.nickname?.charAt(0)?.toUpperCase() || "?"}
        </div>
        {/* Datos */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className='font-semibold text-gray-400'>{rank.short_name !==''? `[${rank.short_name}] `:''}</span>
            <span className="font-semibold text-gray-200 truncate">
              {member.nickname}
            </span>
            {/* Estado */}
            {
              /*
              <span
              className="
                text-[10px]
                px-2
                py-0.5
                rounded-full
                bg-green-900/30
                text-[var(--success-color)]
                border
                border-green-800
              "
            >
              ACTIVO
            </span>
              */ 
            }
            
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
            <span>
              ID: {member.id}
            </span>
            <span>
              Rango: {rank.name}
            </span>
            {/* unidad  */}
              {unitsById[member.unit_id]?.logo_url && (
                <span
                  className="
                    ml-0
                    h-5 w-5
                    shrink-0
                    rounded-full
                    bg-[#2b2b2b]
                    border border-[#555]
                    p-0.05
                    flex items-center justify-center
                    overflow-hidden
                    transition
                   
                    hover:scale-350
                  "
                  title={unitsById[member.unit_id]?.name || "Unidad"}
                >
                  <img
                    src={unitsById[member.unit_id]?.logo_url}
                    alt={unitsById[member.unit_id]?.name || "Unidad"}
                    className="
                      h-full w-full
                      rounded-full
                      object-cover
                    "
                  />
                </span>
              )}
          </div>
        </div>
      </div>
      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0">
                <button
          onClick={()=>{deleteMemberHandler(member.id)}}
          className="
            px-2
            py-2
            text-xs
            rounded
bg-red-900/20 text-red-400 hover:bg-red-900/50 border border-red-900 
            transition
            "                   
        >
          Eliminar
        </button>

        <button
          onClick={()=>{editMemberHandler(member.id)}}
          className="
            px-3
            py-2
            text-xs
            rounded
            bg-[#444]
            text-gray-300
            hover:bg-[#505050]
            transition
            "                   
        >
          Editar
        </button>
        <button
          onClick={()=>{viewMemberHandler(member.id)}}
          className="
            px-3
            py-2
            text-xs
            rounded
            bg-[#444]
            text-gray-300
            hover:bg-[#505050]
            transition
          "
        >
          Ver Miembro
        </button>
      </div>
    </div>

)
}