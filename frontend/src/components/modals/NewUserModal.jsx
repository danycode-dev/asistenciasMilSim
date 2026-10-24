
import { useState } from "react";
import { useDashboardData } from "../../context/DataContext";
import { useModal } from "../../context/ModalContext";

export default function NewUserModal() {
  const { newUser, dashboardData } = useDashboardData();
  const { closeModal } = useModal();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
    active: true,
    all_units: false,
    units: [],
    permissions: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const valueChangeHandler = (key, value) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleUnit = (unitId) => {
    setValues(prev => ({
      ...prev,
      units: prev.units.includes(unitId)
        ? prev.units.filter(id => id !== unitId)
        : [...prev.units, unitId]
    }));
  };

  const canSubmit =
    values.username.trim() !== "" &&
    values.password.length >= 8 &&
    values.role_id !== "" &&
    (values.all_units || values.units.length > 0) &&
    !saving;

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        username: values.username.trim(),
        email: values.email.trim() || null,
        password: values.password,
        role_id: values.role_id,
        active: values.active,
        all_units: values.all_units,
        units: values.all_units ? [] : values.units,
        permissions: values.permissions
      };

      await newUser(payload);

      closeModal("Usuario creado");

    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear usuario");
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
            Nuevo usuario
          </h2>

          <button
            type="button"
            onClick={() => closeModal()}
            className="text-3xl leading-none text-gray-500 hover:text-white transition p-5 absolute right-0"
          >
            ×
          </button>
        </div>

        <form onSubmit={submitHandler}>

          {/* CONTENIDO */}
          <div className="px-6 py-6 space-y-5">

            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de usuario
              </label>

              <input
                type="text"
                className="w-full"
                placeholder="Ingrese nombre de usuario..."
                value={values.username}
                onChange={(e) =>
                  valueChangeHandler("username", e.target.value)
                }
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>

              <input
                type="email"
                className="w-full"
                placeholder="correo@ejemplo.com"
                value={values.email}
                onChange={(e) =>
                  valueChangeHandler("email", e.target.value)
                }
              />
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña inicial
              </label>

              <input
                type="password"
                className="w-full"
                placeholder="Mínimo 8 caracteres"
                value={values.password}
                onChange={(e) =>
                  valueChangeHandler("password", e.target.value)
                }
                minLength={8}
                required
              />
            </div>

            {/* ROL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rol
              </label>

              <select
                value={values.role_id}
                className="w-full py-2 bg-dashboard-item rounded-xs"
                onChange={(e) =>
                  valueChangeHandler("role_id", Number(e.target.value))
                }
                required
              >
                <option value="" disabled>
                  Seleccione un rol
                </option>

                {(dashboardData?.roles ?? []).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ESTADO */}
            <div className="flex items-center justify-between bg-dashboard-item border border-dashboard-border rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-200 font-medium">
                  Usuario activo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Permitir el acceso a la cuenta.
                </p>
              </div>

              <input
                type="checkbox"
                checked={values.active}
                onChange={(e) =>
                  valueChangeHandler("active", e.target.checked)
                }
                className="accent-dashboard-accent w-4 h-4"
              />
            </div>

            {/* UNIDADES */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Acceso a unidades
              </label>

              <label className="flex items-center gap-3 bg-dashboard-item border border-dashboard-border rounded-lg p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.all_units}
                  onChange={(e) =>
                    valueChangeHandler("all_units", e.target.checked)
                  }
                  className="accent-dashboard-accent"
                />
                <span className="text-sm text-gray-300">
                  Acceso a todas las unidades
                </span>
              </label>

              {!values.all_units && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                  {(dashboardData?.units ?? []).map(unit => (
                    <label
                      key={unit.id}
                      className="flex items-center gap-3 bg-[#303030] border border-dashboard-border rounded-lg px-3 py-2 cursor-pointer hover:bg-[#383838]"
                    >
                      <input
                        type="checkbox"
                        checked={values.units.includes(unit.id)}
                        onChange={() => toggleUnit(unit.id)}
                        className="accent-dashboard-accent"
                      />

                      <span className="text-sm text-gray-300">
                        {unit.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-dashboard-danger">
                {error}
              </p>
            )}

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-dashboard-border">

            <button
              type="button"
              onClick={() => closeModal()}
              className="btn-secondary"
              disabled={saving}
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
              {saving ? "Creando..." : "Crear usuario"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
