"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const CENTRO_DEFAULT = [-77.0508, -11.9902]; // Independencia, Lima

const RUTA_SOURCE_ID = "ruta-seleccionada-source";
const RUTA_LAYER_ID = "ruta-seleccionada-layer";

export default function MapaMonitoreo({ datos, idSeleccionado, rutaSeleccionada, onSeleccionarCamion }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const mapCargadoRef = useRef(false);

  // Inicializa el mapa
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
      map.addSource(RUTA_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: RUTA_LAYER_ID,
        type: "line",
        source: RUTA_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#1B4332",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      mapCargadoRef.current = true;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      mapCargadoRef.current = false;
    };
  }, []);

  // Actualiza markers de camiones
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
      const seleccionado = idSeleccionado === id;

      if (markersRef.current[id]) {
        markersRef.current[id].setLngLat([longitud, latitud]);

        const popupContent = `
          <div class="p-2 min-w-[150px]">
            <p class="font-bold text-[#1B4332]">Ruta: ${nombreRuta}</p>
            <p class="font-bold text-[#1B4332]">Conductor: ${conductor}</p>
            <p class="text-xs text-gray-600">Vel: ${velocidad || 0} km/h</p>
            <p class="text-[10px] text-gray-400 mt-1">${new Date(timestamp).toLocaleTimeString()}</p>
          </div>
        `;
        markersRef.current[id].getPopup()?.setHTML(popupContent);

        const el = markersRef.current[id].getElement();
        const inner = el.firstElementChild;
        if (inner) {
          inner.style.filter = seleccionado ? "drop-shadow(0 0 4px #40916C)" : "none";
          inner.style.transform = `${heading ? `rotate(${heading}deg)` : ""} ${seleccionado ? "scale(1.25)" : "scale(1)"}`;
        }
      } else {
        // Elemento raíz: NO tocar su transform, maplibre lo usa para posicionar el marker en el mapa
        const el = document.createElement("div");
        el.style.cursor = "pointer";

        // Elemento interno: aquí sí se puede rotar/escalar libremente
        const inner = document.createElement("div");
        inner.style.transformOrigin = "center";
        inner.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1B4332" stroke="white" stroke-width="1.5" width="32" height="32">
            <path d="M1 3h15v13H1z"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>`;

        if (heading) {
          inner.style.transform = `rotate(${heading}deg)`;
        }

        el.appendChild(inner);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSeleccionarCamion?.(item);
        });

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

    Object.keys(markersRef.current).forEach((idStr) => {
      const id = Number(idStr);
      if (!idsActuales.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [datos, idSeleccionado, onSeleccionarCamion]);

  // Dibuja / limpia la ruta seleccionada
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const dibujar = () => {
      const source = map.getSource(RUTA_SOURCE_ID);
      if (!source) return;

      if (rutaSeleccionada) {
        source.setData({
          type: "FeatureCollection",
          features: [rutaSeleccionada],
        });

        // Centra el mapa en la ruta
        const coords = rutaSeleccionada.geometry.coordinates;
        if (coords?.length) {
          const bounds = coords.reduce(
            (b, coord) => b.extend(coord),
            new maplibregl.LngLatBounds(coords[0], coords[0])
          );
          map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
        }
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    };

    if (mapCargadoRef.current) {
      dibujar();
    } else {
      map.once("load", dibujar);
    }
  }, [rutaSeleccionada]);

  return <div ref={containerRef} className="w-full h-full" />;
}