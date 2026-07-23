"use client";

import { requestJson } from "./ecorutaBackend";

// ── Listar todos los usuarios ───────────────────────────
export function listarUsuarios() {
  return requestJson("/api/usuarios", { method: "GET" });
}

// ── Obtener un usuario por id ────────────────────────────
export function obtenerUsuario(idUsuario) {
  if (idUsuario == null) throw new Error("idUsuario es requerido");
  return requestJson(`/api/usuarios/${idUsuario}`, { method: "GET" });
}

// ── Crear un usuario ─────────────────────────────────────
export function crearUsuario(usuarioRequest) {
  return requestJson("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuarioRequest),
  });
}

// ── Editar un usuario ────────────────────────────────────
export function editarUsuario(idUsuario, usuarioRequest) {
  if (idUsuario == null) throw new Error("idUsuario es requerido");
  return requestJson(`/api/usuarios/${idUsuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuarioRequest),
  });
}


// ── Listar solicitudes pendientes ─────────────────────────
export function listarSolicitudesPendientes() {
  return requestJson("/api/usuarios/solicitudes-pendientes", {
    method: "GET",
  });
}

// ── Aprobar solicitud ─────────────────────────────────────
export function aprobarSolicitud(idUsuario) {
  if (idUsuario == null)
    throw new Error("idUsuario es requerido");

  return requestJson(`/api/usuarios/${idUsuario}/aprobar`, {
    method: "PATCH",
  });
}

// ── Rechazar solicitud ────────────────────────────────────
export function rechazarSolicitud(idUsuario) {
  if (idUsuario == null)
    throw new Error("idUsuario es requerido");

  return requestJson(`/api/usuarios/${idUsuario}/rechazar`, {
    method: "PATCH",
  });
}
