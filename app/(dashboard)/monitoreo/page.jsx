"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { listarAsignaciones } from "../../lib/rutasAsignar"; // Ajusta la ruta a tu archivo
import { listarUltimasPosicionesDeVarios } from "../../lib/monitoreo";
import { obtenerRuta } from "../../lib/rutas"; // Ajusta la ruta a tu archivo de rutas
import MapaMonitoreo from "./components/MapaMonitoreo";
import ListaCamiones from "./components/ListaCamiones";

export default function MonitoreoPage() {
  const [datosMonitoreo, setDatosMonitoreo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [horaActual, setHoraActual] = useState("");

  const [idAsignacionSeleccionada, setIdAsignacionSeleccionada] = useState(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null); // GeoJSON de la ruta activa
  const [cargandoRuta, setCargandoRuta] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const asignaciones = await listarAsignaciones();
      const listaAsignaciones = Array.isArray(asignaciones) ? asignaciones : [];

      const idsActivos = listaAsignaciones.map((a) => a.idAsignacion);

      if (idsActivos.length === 0) {
        setDatosMonitoreo([]);
        return;
      }

      const posiciones = await listarUltimasPosicionesDeVarios(idsActivos);

      const datosCombinados = listaAsignaciones
        .map((asig) => {
          const posicion = posiciones.find((p) => p.idAsignacion === asig.idAsignacion);
          return {
            ...asig,
            posicion: posicion || null,
          };
        })
        .filter((item) => item.posicion !== null);

      setDatosMonitoreo(datosCombinados);
      setHoraActual(new Date().toLocaleDateString());
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los datos de monitoreo.");
    } finally {
      setCargando(false);
    }
  };

  // Carga la ruta del camión seleccionado
  const cargarRutaSeleccionada = useCallback(async (idRuta) => {
    if (idRuta == null) {
      setRutaSeleccionada(null);
      return;
    }
    try {
      setCargandoRuta(true);
      const ruta = await obtenerRuta(idRuta);
      // Se espera que `ruta.coordenadas` sea un arreglo [lng, lat][]
      if (ruta?.coordenadas?.length) {
        setRutaSeleccionada({
          type: "Feature",
          properties: { nombre: ruta.nombre },
          geometry: {
            type: "LineString",
            coordinates: ruta.coordenadas,
          },
        });
      } else {
        setRutaSeleccionada(null);
      }
    } catch (e) {
      console.error("Error al cargar la ruta seleccionada", e);
      setRutaSeleccionada(null);
    } finally {
      setCargandoRuta(false);
    }
  }, []);

  const handleSeleccionarCamion = useCallback(
    (item) => {
      // Toggle: si vuelve a clickear el mismo, se deselecciona
      if (idAsignacionSeleccionada === item.idAsignacion) {
        setIdAsignacionSeleccionada(null);
        setRutaSeleccionada(null);
        return;
      }
      setIdAsignacionSeleccionada(item.idAsignacion);
      cargarRutaSeleccionada(item.idRuta); // Ajusta el nombre del campo si difiere
    },
    [idAsignacionSeleccionada, cargarRutaSeleccionada]
  );

  useEffect(() => {
    cargarDatos();

    const clockInterval = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    const dataInterval = setInterval(cargarDatos, 30000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[var(--ColorVerdeHover)]">Monitoreo de Recolectores</h1>
          <p className="text-xs text-gray-500">
            Última actualización: {horaActual || "Cargando..."} | Activos: {datosMonitoreo.length}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ColorVerdeHover)] text-white rounded-lg text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Contenido: Lista + Mapa */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-80 shrink-0 overflow-y-auto pr-2">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : cargando && datosMonitoreo.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-sm">Cargando datos...</span>
            </div>
          ) : (
            <ListaCamiones
              datos={datosMonitoreo}
              idSeleccionado={idAsignacionSeleccionada}
              onSeleccionar={handleSeleccionarCamion}
            />
          )}
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
          <MapaMonitoreo
            datos={datosMonitoreo}
            idSeleccionado={idAsignacionSeleccionada}
            rutaSeleccionada={rutaSeleccionada}
            onSeleccionarCamion={handleSeleccionarCamion}
          />
          {cargandoRuta && (
            <div className="absolute top-2 left-2 bg-white/90 px-3 py-1.5 rounded-lg text-xs text-gray-600 flex items-center gap-2 shadow">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando ruta...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}