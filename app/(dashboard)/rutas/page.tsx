"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { listarRutas, eliminarRuta } from "./rutasClient";
import RutaCard from "./components/RutaCard";

type Ruta = {
  idRuta: number;
  nombre: string;
  distanciaMetros: number;
  duracionSegundos: number;
  fechaCreacion: string;
  coordenadas: [number, number][];
};

export default function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const cargarRutas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await listarRutas();
      setRutas(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar las rutas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar la ruta "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      setEliminandoId(id);
      await eliminarRuta(id);
      setRutas((prev) => prev.filter((r) => r.idRuta !== id));
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar la ruta");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Rutas de recolección</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las rutas que recorren los conductores.
          </p>
        </div>
        <Link
          href="/rutas/nueva"
          className="inline-flex items-center gap-2 bg-[var(--ColorVerdeHover)] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva ruta
        </Link>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex items-center justify-center py-20 text-[#1B4332]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Cargando rutas...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Error al cargar</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={cargarRutas}
            className="ml-auto text-xs font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      ) : rutas.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-700 font-medium">Aún no hay rutas registradas</p>
          <p className="text-sm text-gray-500 mt-1">
            Crea tu primera ruta para empezar a planificar la recolección.
          </p>
          <Link
            href="/rutas/nueva"
            className="inline-flex items-center gap-2 mt-5 bg-[var(--ColorVerdeHover)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2D6A4F]"
          >
            <Plus className="h-4 w-4" />
            Crear ruta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rutas.map((ruta) => (
            <RutaCard
              key={ruta.idRuta}
              ruta={ruta}
              onEliminar={handleEliminar}
              eliminando={eliminandoId === ruta.idRuta}
            />
          ))}
        </div>
      )}
    </div>
  );
}