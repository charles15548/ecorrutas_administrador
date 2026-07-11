"use client";

import Link from "next/link";
import { MapPin, Clock, Ruler, Eye, Pencil, Trash2 } from "lucide-react";

type Ruta = {
  idRuta: number;
  nombre: string;
  distanciaMetros: number;
  duracionSegundos: number;
  fechaCreacion: string;
  coordenadas: [number, number][];
};

interface Props {
  ruta: Ruta;
  onEliminar: (id: number, nombre: string) => void;
  eliminando: boolean;
}

function formatearFecha(iso: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function RutaCard({ ruta, onEliminar, eliminando }: Props) {
  const km = (ruta.distanciaMetros / 1000).toFixed(2);
  const min = Math.round(ruta.duracionSegundos / 60);
  const puntos = ruta.coordenadas?.length ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#40916C] transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-[#1B4332] truncate">{ruta.nombre}  </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Creada el {formatearFecha(ruta.fechaCreacion)}
          </p>
        </div>
     
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5">
          <Ruler className="h-3.5 w-3.5 text-[#40916C]" />
          <span className="font-medium">{km} km</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5">
          <Clock className="h-3.5 w-3.5 text-[#40916C]" />
          <span className="font-medium">{min} min</span>
        </div>
        {/* <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#40916C]" />
          <span className="font-medium">{puntos} pts</span>
        </div> */}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
        <Link
          href={`/rutas/ver?id=${ruta.idRuta}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#F8F6F0] hover:bg-[#D8F3DC] border border-gray-200 rounded-lg py-2 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Link>
        <Link
          href={`/rutas/editar?id=${ruta.idRuta}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[var(--ColorVerdeHover)] hover:bg-[#2D6A4F] rounded-lg py-2 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Link>
        <button
          onClick={() => onEliminar(ruta.idRuta, ruta.nombre)}
          disabled={eliminando}
          aria-label="Eliminar ruta"
          className="inline-flex items-center justify-center h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
 

);
}