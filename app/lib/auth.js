"use client";

import { requestJson } from "./ecorutaBackend";

// Login
export function login(correo, password) {
  return requestJson("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo,
      password,
    }),
  });
}

