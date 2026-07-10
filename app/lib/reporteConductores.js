// ============================================
// REPORTES DE CONDUCTORES (nuevas)
// ============================================

import { requestJson } from "./ecorutaBackend";

export function listarReportesConductor() {
  return requestJson("/api/reportes-conductor", { method: "GET" });
}

export function listarReportesConductorPendientes() {
  return requestJson("/api/reportes-conductor/pendientes", { method: "GET" });
}

export function cambiarEstadoReporteConductor(idReporteConductor, estado) {
  if (idReporteConductor == null) throw new Error("idReporteConductor es requerido");
  return requestJson(`/api/reportes-conductor/${idReporteConductor}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
}
