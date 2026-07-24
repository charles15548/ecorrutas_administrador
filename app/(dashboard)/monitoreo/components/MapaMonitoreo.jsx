"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Usamos el mismo estilo que ya te funciona en RutaMapViewer
const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const CENTRO_DEFAULT = [-77.0508, -11.9902]; // Independencia, Lima

export default function MapaMonitoreo({ datos }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      center: CENTRO_DEFAULT,
      zoom: 13,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {

    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const idsActuales = new Set();

    datos.forEach((item) => {
      if (!item.posicion || !item.posicion.latitud || !item.posicion.longitud) return;

      const id = item.idAsignacion;
      idsActuales.add(id);

      const { latitud, longitud, velocidad, heading, timestamp } = item.posicion;
      const nombreRuta = item.nombreRuta || `Asignación #${id}`;
      const conductor = item.nombresUsuario;
      if (markersRef.current[id]) {
        // 1. Mover marker existente
        markersRef.current[id].setLngLat([longitud, latitud]);

        // 2. Actualizar popup con info fresca
        const popupContent = `
          <div class="p-2 min-w-[150px]">
            <p class="font-bold text-[#1B4332]">Ruta: ${nombreRuta}</p>
            <p class="font-bold text-[#1B4332]">Conductor: ${conductor}</p>
            <p class="text-xs text-gray-600">Vel: ${velocidad || 0} km/h</p>
            <p class="text-[10px] text-gray-400 mt-1">${new Date(timestamp).toLocaleTimeString()}</p>
          </div>
        `;
        markersRef.current[id].getPopup()?.setHTML(popupContent);
      } else {

        const el = document.createElement("div");
        el.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1B4332" stroke="white" stroke-width="1.5" width="32" height="32">
            <path d="M1 3h15v13H1z"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>`;


        if (heading) {
          el.style.transform = `rotate(${heading}deg)`;
        }

        const popup = new Popup({ offset: 25, closeButton: false }).setHTML(`
          <div class="p-2 min-w-[150px]">
            <p class="font-bold text-[#1B4332]">${nombreRuta}</p>
            <p class="text-xs text-gray-600">Vel: ${velocidad || 0} km/h</p>
            <p class="text-[10px] text-gray-400 mt-1">${new Date(timestamp).toLocaleTimeString()}</p>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitud, latitud])
          .setPopup(popup)
          .addTo(map);

        markersRef.current[id] = marker;
      }
    });

    // Limpia markers de camiones que ya no están en la lista activa
    Object.keys(markersRef.current).forEach((idStr) => {
      const id = Number(idStr);
      if (!idsActuales.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

  }, [datos]);

  return <div ref={containerRef} className="w-full h-full" />;
}