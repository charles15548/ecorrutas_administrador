// lib/monitoreo.js
import { requestJson } from "./ecorutaBackend"; 

export function enviarPosicionCamion(data) {
  return requestJson("/api/posicionCamion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function obtenerUltimaPosicion(idAsignacion) {
  if (idAsignacion == null) throw new Error("idAsignacion es requerido");
  return requestJson(`/api/posicionCamion/ultima/${idAsignacion}`, { 
    method: "GET" 
  });
}

export function listarHistorialPosiciones(idAsignacion) {
  if (idAsignacion == null) throw new Error("idAsignacion es requerido");
  return requestJson(`/api/posicionCamion/historial/${idAsignacion}`, { 
    method: "GET" 
  });
}

/**
 * Obtiene la última posición de varios camiones en paralelo.
 * Filtra automáticamente los que aún no han reportado posición.
 */
export async function listarUltimasPosicionesDeVarios(idAsignaciones) {
  if (!Array.isArray(idAsignaciones) || idAsignaciones.length === 0) {
    return [];
  }

  const promesas = idAsignaciones.map(id => obtenerUltimaPosicion(id));
  const resultados = await Promise.allSettled(promesas);
  
  return resultados
    .filter(res => res.status === 'fulfilled' && res.value && res.value.idPosicion)
    .map(res => res.value);
}