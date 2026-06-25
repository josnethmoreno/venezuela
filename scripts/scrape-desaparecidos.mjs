/**
 * scrape-desaparecidos.mjs
 *
 * Descarga todos los registros de personas de la API pública de
 * desaparecidosterremotovenezuela.com e inserta los datos en tu
 * proyecto de Supabase (tabla personas_desaparecidas).
 *
 * Uso:
 *   node scripts/scrape-desaparecidos.mjs
 *
 * Variables requeridas en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ─── Leer .env.local manualmente ────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf-8");
    const env = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL =
  env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Config ──────────────────────────────────────────────────────────────────
const SOURCE_API = "https://desaparecidos-terremoto-api.theempire.tech/api";
const PAGE_SIZE = 100;          // max por request
const BATCH_SIZE = 50;          // registros por upsert a Supabase
const DELAY_MS = 300;           // pausa entre requests para no saturar la API

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mapPersona(item) {
  // Mapear los campos de la API externa al esquema local de Supabase
  // La tabla local es: personas_desaparecidas
  const estatus =
    item.estado === "localizado" ? "Localizado" : "Desaparecido";

  // Determinar fecha de último contacto
  let fecha_contacto_perdido = item.fecha;
  if (!fecha_contacto_perdido) {
    // Si no tiene fecha, usar la fecha de creación del registro
    fecha_contacto_perdido = new Date(item.createdAt)
      .toISOString()
      .slice(0, 10);
  }

  // Parsear última ubicación (estado venezolano aproximado)
  const ubicacionRaw = (item.ubicacion || "").trim();

  return {
    nombre_completo: (item.nombre || "Sin nombre").trim().slice(0, 200),
    cedula: null,
    edad: item.edad != null ? Math.min(Math.max(0, Number(item.edad)), 120) : 0,
    ultimo_visto_estado: inferirEstado(ubicacionRaw),
    ultimo_visto_detalles: ubicacionRaw || "No especificado",
    fecha_contacto_perdido,
    foto_url: item.foto || null,
    informante_nombre: (item.contacto || "Desconocido").slice(0, 200),
    informante_telefono: extraerTelefono(item.contacto),
    informante_email: extraerEmail(item.contacto),
    estatus,
    fuente: "desaparecidos",
    external_id: String(item.id || item._id || ''),
    prioridad: 2,
  };
}

function inferirEstado(ubicacion) {
  const u = ubicacion.toLowerCase();
  if (u.includes("caracas") || u.includes("distrito capital") || u.includes("dtto")) return "Distrito Capital";
  if (u.includes("la guaira") || u.includes("vargas") || u.includes("catia la mar") ||
      u.includes("caraballeda") || u.includes("macuto") || u.includes("naiguata") ||
      u.includes("maiquetia") || u.includes("tanaguarenas"))
    return "La Guaira";
  if (u.includes("miranda") || u.includes("los teques") || u.includes("petare")) return "Miranda";
  if (u.includes("aragua") || u.includes("maracay")) return "Aragua";
  if (u.includes("carabobo") || u.includes("valencia")) return "Carabobo";
  if (u.includes("zulia") || u.includes("maracaibo")) return "Zulia";
  if (u.includes("lara") || u.includes("barquisimeto")) return "Lara";
  if (u.includes("bolívar") || u.includes("bolivar") || u.includes("puerto ordaz") || u.includes("ciudad guayana")) return "Bolívar";
  if (u.includes("anzoátegui") || u.includes("anzoategui") || u.includes("barcelona") || u.includes("lecheria")) return "Anzoátegui";
  if (u.includes("táchira") || u.includes("tachira") || u.includes("san cristóbal")) return "Táchira";
  if (u.includes("mérida") || u.includes("merida")) return "Mérida";
  if (u.includes("monagas") || u.includes("maturin")) return "Monagas";
  if (u.includes("sucre") || u.includes("cumaná")) return "Sucre";
  if (u.includes("falcón") || u.includes("falcon") || u.includes("coro")) return "Falcón";
  if (u.includes("junquito") || u.includes("el junquito")) return "Distrito Capital";
  return "La Guaira"; // Mayoría de registros son de La Guaira (terremoto)
}

function extraerTelefono(contacto) {
  if (!contacto) return "N/D";
  // Buscar patrón de teléfono
  const match = contacto.match(/[\+\d][\d\s\-\.]{6,}/);
  if (match) return match[0].replace(/\s+/g, "").slice(0, 30);
  return (contacto || "N/D").slice(0, 30);
}

function extraerEmail(contacto) {
  if (!contacto) return null;
  const match = contacto.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// ─── Scraping ────────────────────────────────────────────────────────────────
async function fetchPage(page) {
  const url = `${SOURCE_API}/personas?page=${page}&pageSize=${PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en página ${page}`);
  return res.json();
}

async function upsertBatch(records) {
  const { error } = await supabase
    .from("personas_desaparecidas")
    .upsert(records, { onConflict: "fuente,external_id" });
  if (error) {
    console.error("  ⚠️  Error al insertar lote:", error.message);
    return false;
  }
  return true;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Iniciando scraping de desaparecidosterremotovenezuela.com...\n");

  // Obtener primera página para saber el total
  console.log("📡  Consultando página 1...");
  const first = await fetchPage(1);
  const { total, totalPages } = first;

  // Limitar páginas si se define MAX_PAGES
  const maxPagesEnv = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES, 10) : null;
  const targetPages = maxPagesEnv ? Math.min(totalPages, maxPagesEnv) : totalPages;

  console.log(`📊  Total de personas en la API: ${total.toLocaleString()}`);
  console.log(`📄  Total de páginas: ${totalPages} (${PAGE_SIZE} por página)${maxPagesEnv ? ` (Limitando a primeras ${targetPages} páginas)` : ""}\n`);

  let allPersons = [...first.items];
  let successCount = 0;
  let errorCount = 0;

  // Descargar páginas restantes
  for (let page = 2; page <= targetPages; page++) {
    process.stdout.write(`  ⬇️  Descargando página ${page}/${targetPages}...\r`);
    try {
      await sleep(DELAY_MS);
      const data = await fetchPage(page);
      allPersons.push(...data.items);
    } catch (err) {
      console.error(`\n  ❌  Error en página ${page}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n\n✅  Descarga completada: ${allPersons.length.toLocaleString()} personas`);
  console.log("⬆️  Insertando en Supabase...\n");

  // Mapear y insertar en lotes
  const mapped = allPersons.map(mapPersona);

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(mapped.length / BATCH_SIZE);

    process.stdout.write(
      `  🔄  Lote ${batchNum}/${totalBatches} (${i + 1}–${Math.min(i + BATCH_SIZE, mapped.length)})...\r`
    );

    const ok = await upsertBatch(batch);
    if (ok) {
      successCount += batch.length;
    } else {
      // Reintentar de a uno si el lote falló
      for (const record of batch) {
        const { error } = await supabase
          .from("personas_desaparecidas")
          .upsert([record], { onConflict: "fuente,external_id" });
        if (!error) successCount++;
        else errorCount++;
      }
    }

    await sleep(100);
  }

  console.log("\n\n═══════════════════════════════════════");
  console.log("🏁  IMPORTACIÓN COMPLETADA");
  console.log("═══════════════════════════════════════");
  console.log(`  ✅  Insertados exitosamente: ${successCount.toLocaleString()}`);
  console.log(`  ❌  Errores:                 ${errorCount.toLocaleString()}`);
  console.log(`  📊  Total procesados:        ${allPersons.length.toLocaleString()}`);
  console.log("═══════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
