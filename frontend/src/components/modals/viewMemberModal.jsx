
import { useState } from "react";
import { useDashboardData } from "../../context/DataContext";
import { useModal } from "../../context/ModalContext";

export default function ViewMemberModal({

    member = {
        id:null, 
        nickname: "",
        rank_id: ""
    }
}
) {
    const {ranksById, dashboardData, isLoading, error, reloadData, membersById } = useDashboardData();
    
     console.log(member)
    const { closeModal } = useModal();

    const summitHandler = async ()=>{

            closeModal('Miembro Creado')

    }

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 backdrop-blur-sm">

            <div className="w-[90%] max-w-lg bg-dashboard-card rounded-dashboard border border-dashboard-accent shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-center relative px-6 py-4 border-b border-dashboard-border">

                    <div>
                        <h2 className="mb-0! p-0 text-xl">
                            Ver Miembro
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
                <div className="px-6 py-6">

                    <div className="space-y-5">

                        {/* ICON */}
                        <span className="flex justify-center items-center 
                        rounded-full border border-dashboard-accent/50  h-15 w-15 m-auto
                        text-dashboard-accent text-2xl text-center leading-none">
                            {member.nickname[0]}
                        </span>

                        {/* ID */}



                        {/* Nickname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre / Nickname {member.nickname}
                            </label>

                        </div>


                        {/* Rango */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Rango
                            </label>

                        </div>

                    </div>

                </div>


                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-dashboard-border">

                    <button
                        onClick={() => closeModal()}
                        className="btn-secondary"
                    >
                        Cerrar
                    </button>

                    <button 
                        disabled={false}
                        onClick={() => summitHandler()}
                        className={`
                            btn-primary 
                            
                            ${true ? '':'cursor-not-allowed opacity-35'}`}
                    >
                        Editar Miembro
                    </button>

                </div>

            </div>

        </div>
    );
}
