"use client";

export const DEFAULT_BACKEND_URL = "https://ecoruta-smart-backend.onrender.com";

export function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_ECORUTA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL
  );
}

export function joinUrl(base, path) {
  const normalizedBase = String(base ?? "").replace(/\/+$/, "");
  const normalizedPath = String(path ?? "").replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}

export async function requestJson(path, init) {
  const url = joinUrl(getBackendBaseUrl(), path);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Backend error ${res.status} ${res.statusText} (${url})`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
}

export function listarReportesPendientes() {
  return requestJson("/api/reportes/pendientes", { method: "GET" });
}

export function listarReportes() {
  return requestJson("/api/reportes", { method: "GET" });
}

export function cambiarEstadoReporte(idReporte, estado) {
  if (idReporte == null) throw new Error("idReporte es requerido");
  return requestJson(`/api/reportes/${idReporte}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
}


