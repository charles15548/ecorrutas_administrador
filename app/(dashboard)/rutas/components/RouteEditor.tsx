"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const CENTRO_INDEPENDENCIA: [number, number] = [-77.0508, -11.9902];
const OSRM_BASE_URL = "https://router.project-osrm.org";
const VELOCIDAD_PROMEDIO_KMH = 15;
const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────
type Punto = { lng: number; lat: number }; 
type Tramo = {
  coordenadas: [number, number][];
  distanciaMetros: number;
  duracionSegundos: number;
};

export type RutaGeoJSON = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    nombre: string;
    distancia_metros: number;
    duracion_segundos: number;
  };
};

interface RouteEditorProps {
  onGuardar: (ruta: RutaGeoJSON) => void;
  /** Si se pasa, el editor se inicializa con esta ruta (modo edición). */
  rutaInicial?: RutaGeoJSON | null;
  /** True mientras se está enviando al backend. */
  guardando?: boolean;
}

// ─────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────
function distanciaHaversine(a: Punto, b: Punto): number {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ─────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────
export default function RouteEditor({
  onGuardar,
  rutaInicial,
  guardando = false,
}: RouteEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const inicialCargadaRef = useRef(false);

  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [tramos, setTramos] = useState<Tramo[]>([]);
  const [cargandoTramo, setCargandoTramo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(""); 

  const [mapReady, setMapReady] = useState(false);

  const distanciaTotal = tramos.reduce((acc, t) => acc + t.distanciaMetros, 0);
  const duracionTotal = tramos.reduce((acc, t) => acc + t.duracionSegundos, 0);

  // ── Inicializar mapa ────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: TILE_STYLE,
      center: CENTRO_INDEPENDENCIA,
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("ruta-en-progreso", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "ruta-en-progreso-linea",
        type: "line",
        source: "ruta-en-progreso",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#1B4332",
          "line-width": 5,
          "line-opacity": 0.65,
        },
      });

      setMapReady(true);
    });

    map.on("click", (e) => {
      handleMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   Cargar ruta inicial (modo edición)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rutaInicial || inicialCargadaRef.current) return;
    // Esperamos a que la fuente esté lista
    if (!map.getSource("ruta-en-progreso")) return;

    inicialCargadaRef.current = true;

    const coords = rutaInicial.geometry.coordinates;
    if (!coords || coords.length < 2) return;

    // Rellenar formulario
    setNombre(rutaInicial.properties.nombre ?? "");

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Crear markers y puntos
    const nuevosPuntos: Punto[] = coords.map(([lng, lat]) => {
      const marker = new maplibregl.Marker({ color: "#1B4332" })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
      return { lng, lat };
    });

    // Un único tramo con todas las coordenadas
    const tramosIniciales: Tramo[] = [];
for (let i = 0; i < coords.length - 1; i++) {
  const origen: Punto = { lng: coords[i][0], lat: coords[i][1] };
  const destino: Punto = { lng: coords[i + 1][0], lat: coords[i + 1][1] };
  const distancia = distanciaHaversine(origen, destino);
  const duracionEstimada = (distancia / 1000 / VELOCIDAD_PROMEDIO_KMH) * 3600;

  tramosIniciales.push({
    coordenadas: [coords[i], coords[i + 1]],
    distanciaMetros: distancia,
    duracionSegundos: duracionEstimada,
  });
}
    setPuntos(nuevosPuntos);
    setTramos(tramosIniciales);

    // Ajustar vista
    const bounds = new maplibregl.LngLatBounds();
    coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 60 });
  }, [rutaInicial, mapReady]);

  //   Redibujar línea
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || !map.getSource("ruta-en-progreso")) return;

    const coordenadasCompletas: [number, number][] = tramos.flatMap(
      (t) => t.coordenadas,
    );

    (map.getSource("ruta-en-progreso") as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features:
        coordenadasCompletas.length > 1
          ? [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: coordenadasCompletas,
                },
                properties: {},
              },
            ]
          : [],
    });
  }, [tramos, mapReady]);

  // ── Snap a la calle ─────────────────────────────────────
  const snapToRoad = async (punto: Punto): Promise<Punto> => {
    const url = `${OSRM_BASE_URL}/nearest/v1/driving/${punto.lng},${punto.lat}?number=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo enganchar el punto a una calle");
    const data = await res.json();
    if (data.code !== "Ok" || !data.waypoints?.length) {
      throw new Error("No se encontró una calle cerca de ese punto");
    }
    const [lng, lat] = data.waypoints[0].location;
    return { lng, lat };
  };

  // ── Click en el mapa ────────────────────────────────────
  const handleMapClick = useCallback(
    async (clicOriginal: Punto) => {
      setError(null);
      setCargandoTramo(true);

      try {
        const puntoEnganchado = await snapToRoad(clicOriginal);

        const marker = new maplibregl.Marker({ color: "#1B4332" })
          .setLngLat([puntoEnganchado.lng, puntoEnganchado.lat])
          .addTo(mapRef.current!);
        markersRef.current.push(marker);

        setPuntos((prev) => {
          const actualizados = [...prev, puntoEnganchado];
          if (actualizados.length >= 2) {
            const anterior = actualizados[actualizados.length - 2];
            agregarTramo(anterior, puntoEnganchado);
          }
          return actualizados;
        });
      } catch (err) {
        console.error(err);
        setError(
          "No se pudo enganchar ese punto a una calle. Intenta hacer clic más cerca de una vía.",
        );
      } finally {
        setCargandoTramo(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Agregar tramo ───────────────────────────────────────
  const agregarTramo = async (origen: Punto, destino: Punto) => {
   
      const distancia = distanciaHaversine(origen, destino);
      const duracionEstimada =
        (distancia / 1000 / VELOCIDAD_PROMEDIO_KMH) * 3600;
      const nuevoTramo: Tramo = {
        coordenadas: [
          [origen.lng, origen.lat],
          [destino.lng, destino.lat],
        ],
        distanciaMetros: distancia,
        duracionSegundos: duracionEstimada,
      };
      setTramos((prev) => [...prev, nuevoTramo]);
        
  };

  // ── Deshacer / limpiar ──────────────────────────────────
  const deshacerUltimo = () => {
    if (puntos.length === 0) return;
    setPuntos((prev) => prev.slice(0, -1));
    if (tramos.length > 0) setTramos((prev) => prev.slice(0, -1));
    const ultimoMarker = markersRef.current.pop();
    ultimoMarker?.remove();
  };

  const limpiarRuta = () => {
    setPuntos([]);
    setTramos([]);
    setError(null);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  // ── Guardar ─────────────────────────────────────────────
  const handleGuardar = () => {
    if (!nombre.trim()) {
      setError("Ponle un nombre a la ruta antes de guardar.");
      return;
    }
    if (tramos.length === 0) {
      setError("Agrega al menos dos puntos para formar una ruta.");
      return;
    }
    const coordenadasCompletas: [number, number][] = tramos.flatMap(
      (t) => t.coordenadas,
    );
    const rutaFinal: RutaGeoJSON = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coordenadasCompletas },
      properties: {
        nombre: nombre.trim(),

        distancia_metros: Math.round(distanciaTotal),
        duracion_segundos: Math.round(duracionTotal),
      },
    };
    onGuardar(rutaFinal);
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 md:flex-row h-[80vh]">
      {/* Panel lateral */}
      <div className="w-full md:w-80 flex flex-col gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm shrink-0">
        <div>
           
          <p className="text-sm text-gray-700 mt-1">
            Haz clic en el mapa para ir marcando el recorrido, calle por calle.
          </p>
        </div>

        

        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-900">
            Nombre de la ruta
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Sector Tahuantinsuyo - Turno mañana"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40916C]"
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900 flex flex-col gap-1">
          {/* <div className="flex justify-between">
            <span className="text-gray-700">Puntos marcados</span>
            <span className="font-medium">{puntos.length}</span>
          </div> */}
          <div className="flex justify-between">
            <span className="text-gray-700">Distancia total</span>
            <span className="font-medium">
              {(distanciaTotal / 1000).toFixed(2)} km
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tiempo estimado</span>
            <span className="font-medium">
              {Math.round(duracionTotal / 60)} min
            </span>
          </div>
        </div>

        {cargandoTramo && (
          <p className="text-sm text-[#1B4332]">Procesando punto...</p>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={deshacerUltimo}
            disabled={puntos.length === 0 || guardando}
            className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Deshacer último punto
          </button>
          <button
            onClick={limpiarRuta}
            disabled={puntos.length === 0 || guardando}
            className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Limpiar todo
          </button>
          <button
            onClick={handleGuardar}
            disabled={tramos.length === 0 || guardando}
            className="text-sm font-semibold bg-[var(--ColorVerdeHover)] text-white rounded-lg py-2.5 disabled:opacity-40 hover:bg-[#2D6A4F]"
          >
            {guardando
              ? "Guardando..."
              : rutaInicial
                ? "Actualizar ruta"
                : "Guardar ruta"}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div
        ref={mapContainerRef}
        className="flex-1 rounded-xl overflow-hidden border border-gray-400 min-h-[400px]"
      />
    </div>
  );
}
