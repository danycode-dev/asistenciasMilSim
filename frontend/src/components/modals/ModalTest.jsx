import { useModal } from "../../context/ModalContext";

export default function TestModal({ title = "Modal de prueba" }) {

    const { closeModal } = useModal();
    // sirve como una plantilla para crear todo tipo de modals
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">

            <div className="w-[90%] max-w-lg bg-dashboard-card rounded-dashboard border border-dashboard-accent shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">

                    <h2 className="mb-0!">
                        {title}
                    </h2>

                    <button
                        onClick={() => closeModal()}
                        className="
                            text-2xl
                            leading-none
                            text-gray-500
                            hover:text-white
                            transition
                        "
                    >
                        ×
                    </button>

                </div>


                {/* Contenido */}
                <div className="px-6 py-8">

                    <div className="flex flex-col items-center text-center gap-3">

                        <h3 className="border-0 mb-0 pb-0">
                            ¡Modal de ejemplo!
                        </h3>

                        <p className="text-sm text-dashboard-text">
                            el contenido va aqui.
                        </p>

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
                        onClick={() => closeModal("confirmado")}
                        className="btn-primary"
                    >
                        Confirmar
                    </button>

                </div>

            </div>

        </div>
    );
}