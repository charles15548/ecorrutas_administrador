"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  User,
  Calendar,
  Tag,
  ImageIcon,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";

export const ESTADO_META = {
  recibido:   { label: "Recibido",    color: "bg-[#E3EAFC] text-[#2C4A9E]" },
  en_proceso: { label: "En proceso",  color: "bg-[#FFE8CC] text-[#8A5A00]" },
  resuelto:   { label: "Resuelto",    color: "bg-[#D8F3DC] text-[#1B4332]" },
  rechazado:  { label: "Rechazado",   color: "bg-[#FDE8E8] text-[#8A0000]" },
};

export const TIPO_META = {
  organico:    { label: "Orgánico",    color: "bg-[#D8F3DC] text-[#1B4332]" },
  inorganico:  { label: "Inorgánico", color: "bg-[#E3EAFC] text-[#2C4A9E]" },
  peligroso:   { label: "Peligroso",  color: "bg-[#FDE8E8] text-[#8A0000]" },
  especial:    { label: "Especial",   color: "bg-[#FFE8CC] text-[#8A5A00]" },
};

const ESTADOS = Object.entries(ESTADO_META).map(([value, meta]) => ({ value, ...meta }));

// mode: "ver" → solo lectura + botón "Responder" inline
// mode: "responder" → habilita el form de respuesta
export default function ReporteModal({ open, reporte, onClose, onResponder }) {
  const [mode, setMode] = useState("ver");
  const [estado, setEstado] = useState(reporte?.estado ?? "recibido");
  const [respuesta, setRespuesta] = useState(reporte?.respuesta_admin ?? "");

  useEffect(() => {
    if (open) {
      setMode(reporte?.respuesta_admin ? "responder" : "ver");
      setEstado(reporte?.estado ?? "recibido");
      setRespuesta(reporte?.respuesta_admin ?? "");
    }
  }, [open, reporte]);

  if (!open || !reporte) return null;

  const estadoMeta = ESTADO_META[estado] ?? ESTADO_META.recibido;
  const tipoMeta = TIPO_META[reporte.tipo_residuo] ?? { label: reporte.tipo_residuo, color: "bg-neutral-100 text-neutral-600" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0F2C22]/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tipoMeta.color}`}>
                {tipoMeta.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoMeta.color}`}>
                {estadoMeta.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#14201B] truncate">{reporte.titulo}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">ID: {reporte.id.slice(0, 8)}…</p>
          </div>
          <button type="button" onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* meta chips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <User className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Vecino</p>
                <p className="text-sm font-medium text-[#14201B]">{reporte.vecino}</p>
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Zona</p>
                <p className="text-sm font-medium text-[#14201B]">{reporte.zona}</p>
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Fecha</p>
                <p className="text-sm font-medium text-[#14201B]">{reporte.creado_en}</p>
              </div>
            </div>
            {reporte.latitud && (
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
                <Tag className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Coordenadas</p>
                  <p className="text-sm font-medium text-[#14201B]">{reporte.latitud}, {reporte.longitud}</p>
                </div>
              </div>
            )}
          </div>

          {/* descripcion */}
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Descripción</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{reporte.descripcion}</p>
          </div>

          {/* foto placeholder */}
          {reporte.foto_url && (
            <div className="rounded-lg border border-neutral-200 overflow-hidden">
              <div className="h-40 bg-neutral-100 flex items-center justify-center gap-2 text-neutral-400">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">Foto adjunta</span>
              </div>
            </div>
          )}

          {/* divider */}
          <div className="border-t border-dashed border-neutral-200" />

          {/* respuesta admin */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-[#1B4332]" />
                <p className="text-sm font-semibold text-[#14201B]">Respuesta del administrador</p>
              </div>
              {mode === "ver" && (
                <button
                  type="button"
                  onClick={() => setMode("responder")}
                  className="text-xs font-semibold text-[#40916C] hover:text-[#1B4332] transition-colors"
                >
                  {reporte.respuesta_admin ? "Editar respuesta" : "+ Agregar respuesta"}
                </button>
              )}
            </div>

            {mode === "ver" ? (
              reporte.respuesta_admin ? (
                <div className="rounded-lg bg-[#F0FAF4] border border-[#B7D9C2] px-4 py-3">
                  <p className="text-sm text-[#1B4332] leading-relaxed">{reporte.respuesta_admin}</p>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">Sin respuesta aún.</p>
              )
            ) : (
              <div className="space-y-3">
                {/* cambiar estado */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Actualizar estado
                  </label>
                  <div className="relative">
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-neutral-200 pl-3.5 pr-9 py-2.5 text-sm text-[#14201B] outline-none focus:border-[#40916C] focus:ring-1 focus:ring-[#40916C] transition-colors"
                    >
                      {ESTADOS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* texto respuesta */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Mensaje al vecino
                  </label>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    rows={4}
                    placeholder="Ej. Hemos recibido su reporte y el equipo de recolección atenderá la zona el día..."
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-[#14201B] placeholder:text-neutral-400 outline-none focus:border-[#40916C] focus:ring-1 focus:ring-[#40916C] transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100 shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors">
            {mode === "ver" ? "Cerrar" : "Cancelar"}
          </button>
          {mode === "responder" && (
            <button
              type="button"
              onClick={() => onResponder?.({ estado, respuesta_admin: respuesta })}
              className="px-4 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors"
            >
              Guardar respuesta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}