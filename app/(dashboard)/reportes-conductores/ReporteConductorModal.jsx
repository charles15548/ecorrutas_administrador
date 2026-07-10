"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, ImageIcon, MapPin, Tag, ChevronDown, X } from "lucide-react";

export const ESTADO_META = {
  PENDIENTE: { label: "Pendiente", color: "bg-[#FFE8CC] text-[#8A5A00]" },
  RESUELTO: { label: "Resuelto", color: "bg-[#D8F3DC] text-[#1B4332]" },
  DEFAULT: { label: "Estado", color: "bg-neutral-100 text-neutral-600" },
};

function toImageSrc(fotoBase64) {
  if (!fotoBase64) return null;
  const trimmed = String(fotoBase64).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/*;base64,${trimmed}`;
}

function formatFecha(value) {
  if (!value) return "-";
  try {
    // Soporta tanto ISO string como formato "yyyy-MM-ddTHH:mm:ss"
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ReporteConductorModal({ open, reporte, onClose, onCambiarEstado }) {
  const [imageOk, setImageOk] = useState(true);
  const [estadoDraft, setEstadoDraft] = useState(reporte?.estado ?? "PENDIENTE");

  const estadoMeta = ESTADO_META[reporte?.estado] ?? ESTADO_META.DEFAULT;
  const imageSrc = useMemo(() => toImageSrc(reporte?.fotoBase64), [reporte]);

  if (!open || !reporte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0F2C22]/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoMeta.color}`}>
                {estadoMeta.label ?? reporte?.estado ?? "Estado"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                ID: #{reporte?.idReporteConductor ?? "-"}
              </span>
              {reporte?.tipo && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {reporte.tipo}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-[#14201B] truncate">
              {reporte?.ruta || "Ruta sin especificar"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Ruta</p>
                <p className="text-sm font-medium text-[#14201B] truncate">{reporte?.ruta || "-"}</p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <Tag className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Tipo</p>
                <p className="text-sm font-medium text-[#14201B]">{reporte?.tipo || "-"}</p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Momento del hecho</p>
                <p className="text-sm font-medium text-[#14201B]">{formatFecha(reporte?.momento)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3.5 py-3 flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Fecha del reporte</p>
                <p className="text-sm font-medium text-[#14201B]">{formatFecha(reporte?.fechaReporte)}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Descripción</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{reporte?.descripcion || "-"}</p>
          </div>

          <div className="border-t border-dashed border-neutral-200" />

          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Foto</p>
            {imageSrc && imageOk ? (
              <div className="rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50">
                <img
                  src={imageSrc}
                  alt="Foto del reporte"
                  className="w-full h-auto max-h-[360px] object-contain"
                  onError={() => setImageOk(false)}
                />
              </div>
            ) : (
              <div className="h-40 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center gap-2 text-neutral-400">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">
                  {reporte?.fotoBase64 ? "No se pudo mostrar la imagen" : "Sin foto adjunta"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100 shrink-0">
          {onCambiarEstado ? (
            <div className="mr-auto flex items-center gap-2">
              <div className="relative">
                <select
                  value={estadoDraft}
                  onChange={(e) => setEstadoDraft(e.target.value)}
                  className="appearance-none rounded-lg border border-neutral-200 bg-white pl-3.5 pr-9 py-2 text-sm text-[#14201B] outline-none focus:border-[#40916C] focus:ring-1 focus:ring-[#40916C] transition-colors cursor-pointer"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="RESUELTO">RESUELTO</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => onCambiarEstado?.(estadoDraft)}
                className="px-3.5 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors"
              >
                Guardar estado
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}