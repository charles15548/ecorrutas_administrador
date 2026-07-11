"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, Pencil, Ruler, Clock, MapPin, Calendar } from "lucide-react";
import RutaMapViewer from "../components/RutaMapViewer";
import RutaFormHeader from "../components/RutaFormHeader";
import { obtenerRuta } from "../rutasClient";

type RutaBackend = {
  idRuta: number;
  nombre: string;
  distanciaMetros: number;
  duracionSegundos: number;
  fechaCreacion: string;
  coordenadas: [number, number][];
};

export default function VerRutaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [ruta, setRuta] = useState<RutaBackend | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Falta el id de la ruta");
      setCargando(false);
      return;
    }
    (async () => {
      try {
        const data: RutaBackend = await obtenerRuta(Number(id));
        if (!data || data.idRuta == null) {
          setError("Ruta no encontrada");
          return;
        }
        console.log("Ruta", data);
        setRuta(data);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar la ruta");
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20 text-[#1B4332]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">Cargando ruta...</span>
      </div>
    );
  }

  if (error || !ruta) {
    return (
      <div>
        <RutaFormHeader titulo="Detalle de ruta" />
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error || "No se encontró la ruta"}</p>
        </div>
      </div>
    );
  }

  const km = (ruta.distanciaMetros / 1000).toFixed(2);
  const min = Math.round(ruta.duracionSegundos / 60);
  const puntos = ruta.coordenadas?.length ?? 0;
  const fecha = ruta.fechaCreacion
    ? new Date(ruta.fechaCreacion).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <RutaFormHeader
        titulo={ruta.nombre}
        subtitulo={`Ruta #${ruta.idRuta}`}
      />

      {/* Panel de stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard icon={<Ruler className="h-4 w-4" />} label="Distancia" value={`${km} km`} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Duración" value={`${min} min`} />
        {/* <StatCard icon={<MapPin className="h-4 w-4" />} label="Puntos" value={`${puntos}`} /> */}
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Creada" value={fecha} />
      </div>

      {/* Mapa */}
      <div className="h-[70vh] rounded-xl overflow-hidden border border-gray-400">
        <RutaMapViewer coordenadas={ruta.coordenadas} nombre={ruta.nombre} />
      </div>

      {/* Acciones */}
      <div className="flex justify-end mt-6">
        <Link
          href={`/rutas/editar?id=${ruta.idRuta}`}
          className="inline-flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm"
        >
          <Pencil className="h-4 w-4" />
          Editar ruta
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-[#1B4332]">{value}</p>
      </div>
    </div>
  );
}