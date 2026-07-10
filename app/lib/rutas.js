"use client";

import { requestJson } from "./ecorutaBackend";

// ── Listar todas las rutas ──────────────────────────────
export function listarRutas() {
  return requestJson("/api/rutas", { method: "GET" });
}

// ── Obtener una ruta por id ──────────────────────────────
export function obtenerRuta(idRuta) {
  if (idRuta == null) throw new Error("idRuta es requerido");
  
  return requestJson(`/api/rutas/${idRuta}`, { method: "GET" });
}

// ── Crear una ruta ────────────────────────────────────────
export function crearRuta(rutaRequest) {
  return requestJson("/api/rutas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rutaRequest),
  });
}

// ── Editar una ruta ───────────────────────────────────────
export function editarRuta(idRuta, rutaRequest) {
  if (idRuta == null) throw new Error("idRuta es requerido");
  return requestJson(`/api/rutas/${idRuta}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rutaRequest),
  });
}

// ── Eliminar una ruta ──────────────────────────────────────
export function eliminarRuta(idRuta) {
  if (idRuta == null) throw new Error("idRuta es requerido");
  return requestJson(`/api/rutas/${idRuta}`, { method: "DELETE" });
}

// ── Helper: convierte el GeoJSON del RouteEditor al formato
// que espera el backend (RutaRequest) ───────────────────────
export function geoJsonARutaRequest(rutaGeoJSON) {
  return {
    nombre: rutaGeoJSON.properties.nombre,
    coordenadas: rutaGeoJSON.geometry.coordinates, // ya viene como [lng, lat][]
    distanciaMetros: rutaGeoJSON.properties.distancia_metros,
    duracionSegundos: rutaGeoJSON.properties.duracion_segundos,
  };
}