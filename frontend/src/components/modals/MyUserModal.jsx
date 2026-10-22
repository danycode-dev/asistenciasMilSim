
import { useState } from "react";
import { useDashboardData } from "../../context/DataContext";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../context/ModalContext";

export default function MyUserModal() {
  const { user, changePassword } = useUser();
  const { rolesById } = useDashboardData();
  const { closeModal } = useModal();

  const [changingPassword, setChangingPassword] = useState(false);

  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const valueChangeHandler = (key, value) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));

    setError(null);
    setSuccess(null);
  };

  const resetPasswordForm = () => {
    setValues({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setError(null);
    setShowPasswords(false);
    setChangingPassword(false);
  };

  // VALIDACIONES
  const passwordLengthValid = values.newPassword.length >= 8;

  const passwordsMatch =
    values.newPassword !== "" &&
    values.newPassword === values.confirmPassword;

  const passwordIsDifferent =
    values.newPassword !== values.currentPassword;

  const canSubmit =
    values.currentPassword !== "" &&
    passwordLengthValid &&
    passwordsMatch &&
    passwordIsDifferent &&
    !saving;

  // CAMBIAR CONTRASEÑA
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {

      await changePassword(values);
      setSuccess("Contraseña actualizada correctamente.");

      // Limpiar las contraseñas del formulario
      setValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setChangingPassword(false);
      setShowPasswords(false);

    } catch (err) {
      console.error("Error cambiando contraseña:", err);

      setError(
        err.message || "Ocurrió un error inesperado"
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-dashboard-card rounded-dashboard border border-dashboard-accent shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-center relative px-6 py-4 border-b border-dashboard-border">

          <h2 className="mb-0! p-0 text-xl">
            Mi Cuenta
          </h2>

          <button
            type="button"
            onClick={() => closeModal()}
            className="text-3xl leading-none text-gray-500 hover:text-white transition p-5 absolute right-0"
          >
            ×
          </button>

        </div>

        {/* CONTENIDO */}
        <div className="px-6 py-6 space-y-6">

          {/* PERFIL */}
          <div className="flex items-center gap-4 justify-center">

            <div className="w-14 h-14 shrink-0 rounded-full bg-dashboard-button border border-dashboard-border flex items-center justify-center text-2xl font-bold text-dashboard-accent">
              {user?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-200 mb-0 p-0 border-0">
                {user?.username || "Usuario"}
              </h3>

              <p className="text-sm text-gray-500">
                {user?.email || "Sin correo registrado"}
              </p>
            </div>

          </div>

          {/* INFORMACIÓN DE CUENTA */}
          <div className="bg-dashboard-item border border-dashboard-border rounded-lg p-4 space-y-3">

            <h3 className="text-sm font-semibold text-dashboard-accent mb-3 border-0 p-0">
              Información de la cuenta
            </h3>

            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Usuario</span>
              <span className="text-gray-200">
                {user?.username || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Rol</span>
              <span className="text-gray-200">
                {rolesById?.[user?.role_id]?.name ??
                  user?.role_id ??
                  "Sin rol"}
              </span>
            </div>


            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500">Acceso a unidades</span>
              <span className="text-gray-200">
                {user?.all_units
                  ? "Todas"
                  : `${user?.units?.length ?? 0} asignadas`}
              </span>
            </div>

          </div>

          {/* SECCIÓN SEGURIDAD */}
          <div className="space-y-4">

            <div className="flex items-center justify-center gap-3">

              <div>
                <h3 className="text-sm font-semibold text-dashboard-accent mb-1 border-0 p-0">
                  Seguridad
                </h3>

                <p className="text-xs text-gray-500">
                  Administra la contraseña de tu cuenta.
                </p>
              </div>

            </div>

            {/* BOTÓN CAMBIAR CONTRASEÑA */}
            {!changingPassword && (
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(true);
                  setSuccess(null);
                }}
                className="btn-secondary w-full"
              >
                Cambiar contraseña
              </button>
            )}

            {/* FORMULARIO */}
            {changingPassword && (
              <form
                id="my-user-password-form"
                onSubmit={submitHandler}
                className="bg-dashboard-item border border-dashboard-border rounded-lg p-4 space-y-5"
              >

                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-1 border-0 p-0">
                    Cambiar contraseña
                  </h3>

                  <p className="text-xs text-gray-500">
                    Ingresa tu contraseña actual para confirmar tu identidad.
                  </p>
                </div>

                {/* CONTRASEÑA ACTUAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña actual
                  </label>

                  <input
                    type={showPasswords ? "text" : "password"}
                    className="w-full"
                    placeholder="Ingrese su contraseña actual"
                    autoComplete="current-password"
                    value={values.currentPassword}
                    onChange={(e) =>
                      valueChangeHandler(
                        "currentPassword",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                {/* CONTRASEÑA NUEVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva contraseña
                  </label>

                  <input
                    type={showPasswords ? "text" : "password"}
                    className="w-full"
                    placeholder="Ingrese una nueva contraseña"
                    autoComplete="new-password"
                    value={values.newPassword}
                    onChange={(e) =>
                      valueChangeHandler(
                        "newPassword",
                        e.target.value
                      )
                    }
                    minLength={8}
                    required
                  />

                  <p className={`text-xs mt-2 ${
                    values.newPassword.length === 0
                      ? "text-gray-500"
                      : passwordLengthValid
                        ? "text-dashboard-success"
                        : "text-dashboard-danger"
                  }`}>
                    Mínimo 8 caracteres
                  </p>
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar nueva contraseña
                  </label>

                  <input
                    type={showPasswords ? "text" : "password"}
                    className="w-full"
                    placeholder="Repita su nueva contraseña"
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={(e) =>
                      valueChangeHandler(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    required
                  />

                  {values.confirmPassword !== "" && (
                    <p className={`text-xs mt-2 ${
                      passwordsMatch
                        ? "text-dashboard-success"
                        : "text-dashboard-danger"
                    }`}>
                      {passwordsMatch
                        ? "Las contraseñas coinciden"
                        : "Las contraseñas no coinciden"}
                    </p>
                  )}
                </div>

                {/* MOSTRAR CONTRASEÑAS */}
                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) =>
                      setShowPasswords(e.target.checked)
                    }
                    className="accent-dashboard-accent"
                  />

                  <span className="text-xs text-gray-400">
                    Mostrar contraseñas
                  </span>

                </label>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2"
                  >
                    <p className="text-sm text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* BOTONES */}
                <div className="flex justify-end gap-3 pt-3 border-t border-dashboard-border">

                  <button
                    type="button"
                    disabled={saving}
                    className="btn-secondary"
                    onClick={resetPasswordForm}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`btn-primary ${
                      !canSubmit
                        ? "cursor-not-allowed opacity-35"
                        : ""
                    }`}
                  >
                    {saving
                      ? "Guardando..."
                      : "Actualizar contraseña"}
                  </button>

                </div>

              </form>
            )}

            {/* MENSAJE DE ÉXITO */}
            {success && (
              <div
                role="status"
                className="bg-green-900/20 border border-green-800 rounded-lg px-3 py-3"
              >
                <p className="text-sm text-green-400">
                  {success}
                </p>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-dashboard-border">

          <button
            type="button"
            onClick={() => closeModal()}
            className="btn-secondary"
          >
            Cerrar
          </button>

        </div>

      </div>
    </div>
  );
}
