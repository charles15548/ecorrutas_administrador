

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import RouteEditor, { type RutaGeoJSON } from "../components/RouteEditor";
import RutaFormHeader from "../components/RutaFormHeader";
import { obtenerRuta, editarRuta, geoJsonARutaRequest } from "../rutasClient";

type RutaBackend = {
  idRuta: number;
  nombre: string;
  distanciaMetros: number;
  duracionSegundos: number;
  coordenadas: [number, number][];
};

export default function EditarRutaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [rutaInicial, setRutaInicial] = useState<RutaGeoJSON | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
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
        // Convertimos el formato del backend al GeoJSON que usa el editor
        setRutaInicial({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: data.coordenadas ?? [],
          },
          properties: {
            nombre: data.nombre ?? "",
           
            distancia_metros: data.distanciaMetros ?? 0,
            duracion_segundos: data.duracionSegundos ?? 0,
          },
        });
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar la ruta");
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const handleGuardar = async (ruta: RutaGeoJSON) => {
    if (!id) return;
    try {
      setGuardando(true);
      setError(null);
      await editarRuta(Number(id), geoJsonARutaRequest(ruta));
      router.push("/rutas");
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar la ruta");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20 text-[#1B4332]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">Cargando ruta...</span>
      </div>
    );
  }

  if (error || !rutaInicial) {
    return (
      <div>
        <RutaFormHeader titulo="Editar ruta" />
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error || "No se pudo cargar la ruta"}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RutaFormHeader
        titulo="Editar ruta"
        subtitulo="Modifica el nombre, los puntos o el trazado."
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      

      <RouteEditor
        key={id}
        rutaInicial={rutaInicial}
        onGuardar={handleGuardar}
        guardando={guardando}
      />
    </div>
  );
}