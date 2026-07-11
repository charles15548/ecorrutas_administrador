"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const CENTRO_INDEPENDENCIA: [number, number] = [-77.0508, -11.9902];

interface Props {
  coordenadas: [number, number][];
  nombre: string;
}

export default function RutaMapViewer({ coordenadas, nombre }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]); // 👈 Para trackear y limpiar markers
  const [mapReady, setMapReady] = useState(false); // 👈 Estado para saber si el mapa ya cargó

  // ── Inicializar el mapa una sola vez ─────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      center: CENTRO_INDEPENDENCIA,
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Agregamos la fuente y la capa para dibujar la línea
      map.addSource("ruta", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "ruta-linea",
        type: "line",
        source: "ruta",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#1B4332",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });

      // 👇 Avisamos que el mapa ya está listo para dibujar
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Dibujar la ruta y los markers cuando el mapa esté listo ──
  useEffect(() => {
    if (!mapReady) return; // 👈 Esperamos a que el mapa esté listo
    const map = mapRef.current;
    if (!map || !map.getSource("ruta")) return;

    // 1. Limpiamos markers anteriores para evitar duplicados
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 2. Dibujamos la línea de la ruta
    (map.getSource("ruta") as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features:
        coordenadas && coordenadas.length > 1
          ? [
              {
                type: "Feature",
                geometry: { type: "LineString", coordinates: coordenadas },
                properties: {},
              },
            ]
          : [],
    });

    // 3. Agregamos markers de inicio y fin
    if (coordenadas && coordenadas.length > 0) {
      const [lngIni, latIni] = coordenadas[0];

      const markerInicio = new maplibregl.Marker({ color: "#1B4332" })
        .setLngLat([lngIni, latIni])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(
            `<b>Inicio</b><br/>${nombre}`
          )
        )
        .addTo(map);
      markersRef.current.push(markerInicio);

      if (coordenadas.length > 1) {
        const [lngFin, latFin] = coordenadas[coordenadas.length - 1];

        const markerFin = new maplibregl.Marker({ color: "#40916C" })
          .setLngLat([lngFin, latFin])
          .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(`<b>Fin</b>`))
          .addTo(map);
        markersRef.current.push(markerFin);
      }

      // 4. Ajustamos la vista para que se vea toda la ruta
      const bounds = new maplibregl.LngLatBounds();
      coordenadas.forEach(([lng, lat]) => bounds.extend([lng, lat]));
      map.fitBounds(bounds, { padding: 60 });
    }
  }, [coordenadas, mapReady, nombre]); // 👈 Dependencias correctas

  return <div ref={containerRef} className="w-full h-full" />;
}