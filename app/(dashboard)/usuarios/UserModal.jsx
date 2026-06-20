"use client";

import { useState, useEffect } from "react";
import { X, UserRound, Mail, Phone, Lock, ShieldCheck } from "lucide-react";

const ROLES = [
  { value: "administrador", label: "Administrador" },
  { value: "conductor", label: "Conductor" },
  { value: "ciudadano", label: "Ciudadano" },
];

const EMPTY_FORM = {
  nombre: "",
  correo: "",
  telefono: "",
  rol: "ciudadano",
  estado: "activo",
  password: "",
};

// mode: "create" | "edit" — mismo formulario para ambos casos
export default function UserModal({ open, mode = "create", user = null, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        nombre: user.nombre ?? "",
        correo: user.correo ?? "",
        telefono: user.telefono ?? "",
        rol: user.rol ?? "ciudadano",
        estado: user.estado ?? "activo",
        password: "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, user, open]);

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
                : `Actualizando a ${user?.nombre ?? ""}`}
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
                value={form.nombre}
                onChange={update("nombre")}
                placeholder="Ej. María Quispe"
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
                placeholder="correo@independencia.gob.pe"
                className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Teléfono
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
                <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={update("telefono")}
                  placeholder="999 999 999"
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
                  value={form.rol}
                  onChange={update("rol")}
                  className="w-full bg-transparent text-sm text-[#14201B] outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Contraseña temporal
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
                <Lock className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* estado — solo visible al editar */}
          {mode === "edit" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Estado
              </label>
              <div className="flex gap-2">
                {["activo", "inactivo"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, estado: s }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      form.estado === s
                        ? s === "activo"
                          ? "border-[#40916C] bg-[#D8F3DC] text-[#1B4332]"
                          : "border-neutral-300 bg-neutral-100 text-neutral-600"
                        : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    {s}
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
            onClick={() => onSave?.(form)}
            className="px-4 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors"
          >
            {mode === "create" ? "Crear usuario" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}