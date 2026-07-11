
"use client";

import { requestJson } from "./ecorutaBackend";

export function listarRoles() {
  return requestJson("/api/roles", { method: "GET" });
}