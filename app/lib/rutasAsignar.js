"use client";

import { requestJson } from "./ecorutaBackend";

export function listarAsignaciones() {
  return requestJson("/api/rutaAsignacion", { method: "GET" });
}

export function obtenerAsignacion(idAsignacion) {
  if (idAsignacion == null) throw new Error("idAsignacion es requerido");
  return requestJson(`/api/rutaAsignacion/${idAsignacion}`, { method: "GET" });
}
export async function crearAsignacion(asignacionRequest) {
  console.log("[crearAsignacion] payload enviado:", asignacionRequest);

  try {
    const result = await requestJson("/api/rutaAsignacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asignacionRequest),
    });

    console.log("[crearAsignacion] respuesta del backend:", result);
    return result;
  } catch (err) {
    console.error("[crearAsignacion] error en la petición:", err.message);
    console.error("[crearAsignacion] status:", err.status);
    console.error("[crearAsignacion] body del backend:", err.body);
    throw err;
  }
}