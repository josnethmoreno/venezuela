/**
 * create-client.mjs
 * Helper compartido para crear el cliente de Supabase en scripts de Node.js.
 * Usa el paquete `ws` para proveer soporte WebSocket en Node < 22.
 */

import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
import { readFileSync } from "fs";

// ─── Leer .env.local ─────────────────────────────────────────────────────────
export function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf-8");
    const env = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
    return env;
  } catch {
    return {};
  }
}

// ─── Crear cliente Supabase con soporte WebSocket ────────────────────────────
export function makeSupabaseClient() {
  const env = loadEnv();

  const url =
    env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      "❌ Faltan credenciales de Supabase en .env.local o variables de entorno"
    );
    process.exit(1);
  }

  // Intentar cargar `ws` para soporte WebSocket en Node < 22
  let wsImpl;
  try {
    const require = createRequire(import.meta.url);
    wsImpl = require("ws");
  } catch {
    // En Node 22+ no hace falta ws (WebSocket es nativo)
  }

  const options = wsImpl
    ? { realtime: { transport: wsImpl } }
    : {};

  return createClient(url, key, options);
}
