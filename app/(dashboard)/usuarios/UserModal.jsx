"use client";

import { useEffect, useMemo, useState } from "react";
import { X, UserRound, Mail, Lock, ShieldCheck } from "lucide-react";
import { listarRoles } from "../../lib/roles";

const EMPTY_FORM = {
  nombres: "",
  correo: "",
  idRol: "",
  estado: true,
  password: "",
};

// mode: "create" | "edit" — mismo formulario para ambos casos
export default function UserModal({ open, mode = "create", user = null, onClose, onSave }) {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (!open) return;
    listarRoles()
      .then(setRoles)
      .catch((err) => {
        console.error(err);
        setRoles([]);
      });
  }, [open]);

  const initialForm = useMemo(() => {
    if (mode === "edit" && user) {
      return {
        nombres: user.nombres ?? "",
        correo: user.correo ?? "",
        idRol: user.idRol ?? "",
        estado: user.estado ?? true,
        password: "",
      };
    }
    return EMPTY_FORM;
  }, [mode, user]);

  const [form, setForm] = useState(initialForm);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-[#0F2C22]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-[#14201B]">
              {mode === "create" ? "Nuevo usuario" : "Editar usuario"}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {mode === "create"
                ? "Registra un nuevo usuario en el sistema"
                : `Actualizando a ${user?.nombres ?? ""}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Nombre completo
            </label>
            <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
              <UserRound className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={form.nombres}
                onChange={update("nombres")}
                placeholder="Ej. María Perez"
                className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Correo electrónico
            </label>
            <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
              <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                type="email"
                value={form.correo}
                onChange={update("correo")}
                placeholder="correo@gmail.com"
                className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Rol
            </label>
            <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
              <ShieldCheck className="h-4 w-4 text-neutral-400 shrink-0" />
              <select
                value={form.idRol}
                onChange={update("idRol")}
                className="w-full bg-transparent text-sm text-[#14201B] outline-none"
              >
                <option value="" disabled>
                  Selecciona un rol
                </option>
                {roles.map((r) => (
                  <option key={r.idRol} value={r.idRol}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              {mode === "create" ? "Contraseña temporal" : "Nueva contraseña (opcional)"}
            </label>
            <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
              <Lock className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder={mode === "create" ? "••••••••" : "Dejar en blanco para no cambiarla"}
                className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          {/* estado — solo visible al editar */}
          {mode === "edit" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Estado
              </label>
              <div className="flex gap-2">
                {[
                  { value: true, label: "activo" },
                  { value: false, label: "inactivo" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, estado: s.value }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      form.estado === s.value
                        ? s.value
                          ? "border-[#40916C] bg-[#D8F3DC] text-[#1B4332]"
                          : "border-neutral-300 bg-neutral-100 text-neutral-600"
                        : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave?.({ ...form, idRol: Number(form.idRol) })}
            className="px-4 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors"
          >
            {mode === "create" ? "Crear usuario" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}