"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────

// Centro inicial del mapa: Independencia, Lima
const CENTRO_INDEPENDENCIA: [number, number] = [-77.0508, -11.9902];

// Servidor OSRM. El demo público sirve para desarrollo/pruebas,
// pero tiene rate-limit y NO se debe usar en producción.
const OSRM_BASE_URL = "https://router.project-osrm.org";

// Velocidad promedio asumida para camión de recolección en calles locales.
// Se usa solo para estimar el tiempo en modo manual (no viene de OSRM ahí).
const VELOCIDAD_PROMEDIO_KMH = 15;

// Tiles gratuitos (no requieren API key).
const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

type Punto = { lng: number; lat: number };

type ModoRuta = "manual" | "automatico";

// Cada "tramo" es lo que se agrega entre dos clics consecutivos
type Tramo = {
  coordenadas: [number, number][]; // [lng, lat][]
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
    turno: string;
    distancia_metros: number;
    duracion_segundos: number;
  };
};

interface RouteEditorProps {
  // Se dispara cuando el gestor pulsa "Guardar ruta".
  // Aquí luego conectas tu POST al backend Spring.
  onGuardar: (ruta: RutaGeoJSON) => void;
}

// ─────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────

// Distancia entre dos coordenadas (fórmula de Haversine), en metros.
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

export default function RouteEditor({ onGuardar }: RouteEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [tramos, setTramos] = useState<Tramo[]>([]);
  const [cargandoTramo, setCargandoTramo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [turno, setTurno] = useState("mañana");

  // "manual" = tú controlas cada tramo, se conecta directo calle a calle.
  // "automatico" = OSRM decide el camino óptimo entre los dos puntos
  //   (útil solo para tramos largos y rectos, ej. una avenida sin cruces).
  const [modo, setModo] = useState<ModoRuta>("manual");

  const distanciaTotal = tramos.reduce((acc, t) => acc + t.distanciaMetros, 0);
  const duracionTotal = tramos.reduce((acc, t) => acc + t.duracionSegundos, 0);

  // ── Inicializar mapa (una sola vez) ──────────────────────
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
          "line-color": "#2563eb",
          "line-width": 5,
          "line-opacity": 0.85,
        },
      });
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

  // ── Redibujar la línea acumulada cada vez que cambian los tramos ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("ruta-en-progreso")) return;

    const coordenadasCompletas: [number, number][] = tramos.flatMap(
      (t) => t.coordenadas
    );

    (map.getSource("ruta-en-progreso") as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features:
        coordenadasCompletas.length > 1
          ? [
              {
                type: "Feature",
                geometry: { type: "LineString", coordinates: coordenadasCompletas },
                properties: {},
              },
            ]
          : [],
    });
  }, [tramos]);

  // ── Enganchar (snap) un punto a la calle más cercana ─────
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

  // ── Manejar cada clic del gestor sobre el mapa ───────────
  const handleMapClick = useCallback(
    async (clicOriginal: Punto) => {
      setError(null);
      setCargandoTramo(true);

      try {
        // Siempre enganchamos el punto a la calle real más cercana,
        // para que el trazado quede sobre la vía y no "al aire".
        const puntoEnganchado = await snapToRoad(clicOriginal);

        const marker = new maplibregl.Marker({ color: "#2563eb" })
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
          "No se pudo enganchar ese punto a una calle. Intenta hacer clic más cerca de una vía."
        );
      } finally {
        setCargandoTramo(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modo]
  );

  // ── Agregar el tramo entre dos puntos ya "enganchados" ───
  const agregarTramo = async (origen: Punto, destino: Punto) => {
    // MODO MANUAL: conexión directa entre los dos puntos, sin que
    // ningún motor decida el camino. Así el gestor tiene control total
    // y no aparecen vueltas ni desvíos automáticos.
    if (modo === "manual") {
      const distancia = distanciaHaversine(origen, destino);
      const duracionEstimada = (distancia / 1000 / VELOCIDAD_PROMEDIO_KMH) * 3600;

      const nuevoTramo: Tramo = {
        coordenadas: [
          [origen.lng, origen.lat],
          [destino.lng, destino.lat],
        ],
        distanciaMetros: distancia,
        duracionSegundos: duracionEstimada,
      };

      setTramos((prev) => [...prev, nuevoTramo]);
      return;
    }

    // MODO AUTOMÁTICO: se apoya en OSRM para tramos largos donde no
    // quieres ir marcando cada esquina (ej. una avenida recta y larga).
    setCargandoTramo(true);
    try {
      const url = `${OSRM_BASE_URL}/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&continue_straight=true`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("OSRM no respondió correctamente");

      const data = await res.json();
      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No se encontró una ruta por calles entre esos dos puntos");
      }

      const mejorRuta = data.routes[0];

      const nuevoTramo: Tramo = {
        coordenadas: mejorRuta.geometry.coordinates,
        distanciaMetros: mejorRuta.distance,
        duracionSegundos: mejorRuta.duration,
      };

      setTramos((prev) => [...prev, nuevoTramo]);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo calcular el tramo automático. Prueba en modo manual o marca puntos más cercanos."
      );
      setPuntos((prev) => prev.slice(0, -1));
      const ultimoMarker = markersRef.current.pop();
      ultimoMarker?.remove();
    } finally {
      setCargandoTramo(false);
    }
  };

  // ── Deshacer el último punto/tramo agregado ──────────────
  const deshacerUltimo = () => {
    if (puntos.length === 0) return;

    setPuntos((prev) => prev.slice(0, -1));
    if (tramos.length > 0) {
      setTramos((prev) => prev.slice(0, -1));
    }

    const ultimoMarker = markersRef.current.pop();
    ultimoMarker?.remove();
  };

  // ── Limpiar todo y empezar de nuevo ──────────────────────
  const limpiarRuta = () => {
    setPuntos([]);
    setTramos([]);
    setError(null);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  // ── Guardar: arma el GeoJSON final y lo pasa al padre ────
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
      (t) => t.coordenadas
    );

    const rutaFinal: RutaGeoJSON = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordenadasCompletas,
      },
      properties: {
        nombre: nombre.trim(),
        turno,
        distancia_metros: Math.round(distanciaTotal),
        duracion_segundos: Math.round(duracionTotal),
      },
    };

    onGuardar(rutaFinal);
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 md:flex-row h-[80vh]">
      {/* Panel lateral de control */}
      <div className="w-full md:w-80 flex flex-col gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nueva ruta</h2>
          <p className="text-sm text-gray-700 mt-1">
            Haz clic en el mapa para ir marcando el recorrido, calle por calle.
          </p>
        </div>

        {/* Selector de modo */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-900">
            Modo de trazado
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              onClick={() => setModo("manual")}
              className={`flex-1 py-2 font-medium ${
                modo === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setModo("automatico")}
              className={`flex-1 py-2 font-medium border-l border-gray-300 ${
                modo === "automatico"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              Automático
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {modo === "manual"
              ? "Cada clic se conecta directo al anterior, enganchado a la calle. Tú decides cada giro."
              : "OSRM calcula el camino óptimo entre los dos puntos (respeta sentidos de calle, puede generar vueltas)."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-900">
            Nombre de la ruta
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Sector Tahuantinsuyo - Turno mañana"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-900">Turno</label>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>

        {/* Resumen del trazado */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900 flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-gray-700">Puntos marcados</span>
            <span className="font-medium">{puntos.length}</span>
          </div>
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
          <p className="text-sm text-blue-700">Procesando punto...</p>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={deshacerUltimo}
            disabled={puntos.length === 0}
            className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Deshacer último punto
          </button>
          <button
            onClick={limpiarRuta}
            disabled={puntos.length === 0}
            className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Limpiar todo
          </button>
          <button
            onClick={handleGuardar}
            disabled={tramos.length === 0}
            className="text-sm font-semibold bg-blue-600 text-white rounded-lg py-2.5 disabled:opacity-40 hover:bg-blue-700"
          >
            Guardar ruta
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div
        ref={mapContainerRef}
        className="flex-1 rounded-xl overflow-hidden border border-gray-200 min-h-[400px]"
      />
    </div>
  );
}