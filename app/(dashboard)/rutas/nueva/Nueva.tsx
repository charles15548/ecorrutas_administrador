
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RouteEditor, { type RutaGeoJSON } from "../components/RouteEditor";
import RutaFormHeader from "../components/RutaFormHeader";
import { crearRuta, geoJsonARutaRequest } from "../rutasClient";

export default function NuevaRutaPage() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async (ruta: RutaGeoJSON) => {
    try {
      setGuardando(true);
      setError(null);
      await crearRuta(geoJsonARutaRequest(ruta));
      router.push("/rutas");
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar la ruta");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <RutaFormHeader
        titulo="Crear ruta de recolección"
        subtitulo="Marca los puntos en el mapa para definir el recorrido."
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <RouteEditor onGuardar={handleGuardar} guardando={guardando} />
    </div>
  );
}