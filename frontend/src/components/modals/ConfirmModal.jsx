
import { useModal } from "../../context/ModalContext";

export default function ConfirmModal({
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres continuar?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  danger = false
}) {
  const { closeModal } = useModal();

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">

      <div className="w-[90%] max-w-md bg-dashboard-card rounded-dashboard border border-dashboard-accent shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">
          <h2 className="text-xl m-0! p-0">
            {title}
          </h2>

          <button
            onClick={() => closeModal(false)}
            className="text-2xl text-gray-500 hover:text-white transition"
          >
            ×
          </button>
        </div>

        {/* Mensaje */}
        <div className="px-6 py-6">
          <p className="text-sm">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-dashboard-border">
          <button
            onClick={() => closeModal(false)}
            className="btn-secondary"
          >
            {cancelText}
          </button>

          <button
            onClick={() => closeModal(true)}
            className={
              danger
                ? "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                : "btn-primary"
            }
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
