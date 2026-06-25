/**
 * scrape-venezuelareporta.mjs
 *
 * Scraping de venezuelareporta.org (17,000+ personas)
 * El sitio usa Next.js SSR — los datos vienen en el HTML de cada página.
 * Usamos parsing de HTML con regex para extraer: UUID, nombre, edad, ubicación,
 * foto y estado.
 *
 * Uso:
 *   node scripts/scrape-venezuelareporta.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ─── Leer .env.local ─────────────────────────────────────────────────────────
function loadEnv() {
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
  } catch { return {}; }
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan credenciales de Supabase en .env.local o variables de entorno");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://venezuelareporta.org";
const DELAY_MS = 800;           // pausa entre requests (más conservador para HTML scraping)
const BATCH_SIZE = 50;          // registros por upsert a Supabase

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Parsear personas de un bloque HTML ──────────────────────────────────────
function parsePersonasFromHTML(html) {
  const personas = [];

  // Patrón de cada card: <a class="card ..." href="/reporte/{uuid}">...</a>
  // Capturamos el bloque completo de cada card
  const cardRegex = /href="\/reporte\/([0-9a-f-]{36})">([\s\S]*?)<\/a>/g;
  let match;

  while ((match = cardRegex.exec(html)) !== null) {
    const uuid = match[1];
    const cardHtml = match[2];

    // Estado: chip class
    let estado = "Desaparecido";
    if (cardHtml.includes("bg-salvo-soft") || cardHtml.includes("A salvo")) {
      estado = "Localizado";
    } else if (cardHtml.includes("bg-encontrado-soft") || cardHtml.includes("Encontrado")) {
      estado = "Localizado";
    }

    // Estado de chip
    const chipMatch = cardHtml.match(/>Se busca<|>A salvo<|>Encontrado</);
    if (chipMatch) {
      if (chipMatch[0].includes("Se busca")) estado = "Desaparecido";
      else if (chipMatch[0].includes("A salvo") || chipMatch[0].includes("Encontrado")) estado = "Localizado";
    }

    // Foto
    let fotoUrl = null;
    const imgMatch = cardHtml.match(/src="(https:\/\/[^"]+supabase[^"]+)"/);
    if (imgMatch) fotoUrl = imgMatch[1];
    // También puede ser de otra CDN
    if (!fotoUrl) {
      const imgMatch2 = cardHtml.match(/src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))"/i);
      if (imgMatch2) fotoUrl = imgMatch2[1];
    }

    // Nombre: <h3 class="...">Nombre</h3>
    const nombreMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const nombre = nombreMatch
      ? nombreMatch[1].replace(/<[^>]+>/g, "").trim()
      : "Sin nombre";

    // Info: <p class="...">edad años · ubicación</p>
    const infoMatch = cardHtml.match(/<p[^>]*class="[^"]*truncate[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    let edad = 0;
    let ubicacion = "";

    if (infoMatch) {
      // Limpiar HTML comments y tags
      const infoText = infoMatch[1]
        .replace(/<!--[^>]*-->/g, "")
        .replace(/<[^>]+>/g, "")
        .trim();

      // Intentar extraer "N años · ubicación"
      const edadUbicacionMatch = infoText.match(/^(\d+)\s*años\s*·?\s*(.*)/s);
      if (edadUbicacionMatch) {
        edad = Math.min(parseInt(edadUbicacionMatch[1], 10), 120);
        ubicacion = edadUbicacionMatch[2].trim();
      } else {
        // Puede que solo tenga ubicación sin edad
        ubicacion = infoText.replace(/\d+\s*años\s*·?\s*/g, "").trim();
      }
    }

    if (!nombre || nombre === "Sin nombre") continue;
    if (!uuid) continue;

    personas.push({ uuid, nombre, edad, ubicacion, fotoUrl, estado });
  }

  return personas;
}

// ─── Mapear al schema de Supabase ────────────────────────────────────────────
function inferirEstado(ubicacion) {
  const u = (ubicacion || "").toLowerCase();
  if (u.includes("caracas") || u.includes("dtto") || u.includes("distrito capital") ||
      u.includes("altamira") || u.includes("las mercedes") || u.includes("san bernardino") ||
      u.includes("el junquito") || u.includes("junquito")) return "Distrito Capital";
  if (u.includes("la guaira") || u.includes("vargas") || u.includes("catia la mar") ||
      u.includes("caraballeda") || u.includes("macuto") || u.includes("naiguata") ||
      u.includes("naiguatá") || u.includes("maiquetia") || u.includes("tanaguarena") ||
      u.includes("playa grande") || u.includes("playa verde") || u.includes("caribe") ||
      u.includes("la guira") || u.includes("lamar")) return "La Guaira";
  if (u.includes("miranda") || u.includes("los teques") || u.includes("petare") ||
      u.includes("charallave") || u.includes("guarenas") || u.includes("guatire")) return "Miranda";
  if (u.includes("aragua") || u.includes("maracay") || u.includes("cagua")) return "Aragua";
  if (u.includes("carabobo") || u.includes("valencia") || u.includes("guacara")) return "Carabobo";
  if (u.includes("zulia") || u.includes("maracaibo") || u.includes("cabimas")) return "Zulia";
  if (u.includes("lara") || u.includes("barquisimeto") || u.includes("carora")) return "Lara";
  if (u.includes("bolívar") || u.includes("bolivar") || u.includes("puerto ordaz") ||
      u.includes("guayana")) return "Bolívar";
  if (u.includes("anzoátegui") || u.includes("anzoategui") || u.includes("barcelona") ||
      u.includes("lecheria") || u.includes("puerto la cruz")) return "Anzoátegui";
  if (u.includes("táchira") || u.includes("tachira") || u.includes("san cristóbal")) return "Táchira";
  if (u.includes("mérida") || u.includes("merida")) return "Mérida";
  if (u.includes("monagas") || u.includes("maturin")) return "Monagas";
  if (u.includes("sucre") || u.includes("cumaná")) return "Sucre";
  if (u.includes("falcón") || u.includes("falcon") || u.includes("coro")) return "Falcón";
  if (u.includes("portuguesa") || u.includes("guanare")) return "Portuguesa";
  if (u.includes("trujillo") || u.includes("valera")) return "Trujillo";
  if (u.includes("nueva esparta") || u.includes("margarita") || u.includes("porlamar")) return "Nueva Esparta";
  return "La Guaira"; // Default: mayoría son de La Guaira
}

function mapPersona(item) {
  return {
    nombre_completo: (item.nombre || "Sin nombre").trim().slice(0, 200),
    cedula: null,
    edad: item.edad != null ? Math.min(Math.max(0, Number(item.edad)), 120) : 0,
    ultimo_visto_estado: inferirEstado(item.ubicacion),
    ultimo_visto_detalles: (item.ubicacion || "No especificado").trim(),
    fecha_contacto_perdido: "2026-06-24", // Fecha del terremoto
    foto_url: item.fotoUrl || null,
    informante_nombre: "Reporte comunitario",
    informante_telefono: "N/D",
    informante_email: null,
    estatus: item.estado,
    fuente: "venezuelareporta",
    external_id: item.uuid,
    prioridad: 2,
  };
}

// ─── Fetch de una página HTML ─────────────────────────────────────────────────
async function fetchPage(page) {
  const url = `${BASE_URL}/buscar?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "es-VE,es;q=0.9",
      "User-Agent": "Mozilla/5.0 (compatible; scraper/1.0; registro comunitario)"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en página ${page}`);
  const html = await res.text();

  // Extraer total de resultados
  const totalMatch = html.match(/([\d.]+)\s*resultados/);
  const total = totalMatch ? parseInt(totalMatch[1].replace(".", ""), 10) : null;

  const personas = parsePersonasFromHTML(html);
  return { personas, total };
}

// ─── Insertar lote en Supabase ────────────────────────────────────────────────
async function upsertBatch(records) {
  const { error } = await supabase
    .from("personas_desaparecidas")
    .upsert(records, { onConflict: "fuente,external_id" });
  if (error) {
    console.error(`\n  ⚠️  Error en lote: ${error.message}`);
    return false;
  }
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Iniciando scraping de venezuelareporta.org...\n");

  // Página 1 para ver el total
  console.log("📡  Consultando página 1...");
  const { personas: firstPagePersonas, total } = await fetchPage(1);

  if (!total) {
    console.error("❌ No se pudo determinar el total de registros");
    process.exit(1);
  }

  const perPage = firstPagePersonas.length;
  const totalPages = Math.ceil(total / perPage);

  // Limitar páginas si se define MAX_PAGES
  const maxPagesEnv = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES, 10) : null;
  const targetPages = maxPagesEnv ? Math.min(totalPages, maxPagesEnv) : totalPages;

  console.log(`📊  Total de personas: ${total.toLocaleString()}`);
  console.log(`📄  Personas por página: ${perPage}`);
  console.log(`📄  Total de páginas: ${totalPages}${maxPagesEnv ? ` (Limitando a primeras ${targetPages} páginas)` : ""}\n`);

  let allPersonas = [...firstPagePersonas];
  let errorPages = 0;

  // Descargar el resto de páginas
  for (let page = 2; page <= targetPages; page++) {
    process.stdout.write(`  ⬇️  Descargando página ${page}/${totalPages} (${allPersonas.length.toLocaleString()} personas)...\r`);
    try {
      await sleep(DELAY_MS);
      const { personas } = await fetchPage(page);
      if (personas.length === 0) {
        // Puede que sea la última página vacía
        console.log(`\n  ⚠️  Página ${page} vacía, continuando...`);
      }
      allPersonas.push(...personas);
    } catch (err) {
      console.error(`\n  ❌  Error en página ${page}: ${err.message}`);
      errorPages++;
      if (errorPages > 10) {
        console.error("  ❌  Demasiados errores, deteniendo descarga.");
        break;
      }
    }
  }

  console.log(`\n\n✅  Descarga completada: ${allPersonas.length.toLocaleString()} personas`);
  console.log("⬆️  Insertando en Supabase...\n");

  // Mapear y insertar
  const mapped = allPersonas.map(mapPersona);
  let successCount = 0;
  let errorCount = 0;

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
      // Reintentar de a uno
      for (const record of batch) {
        const { error } = await supabase
          .from("personas_desaparecidas")
          .upsert([record], { onConflict: "fuente,external_id" });
        if (!error) successCount++;
        else errorCount++;
      }
    }

    await sleep(50);
  }

  console.log("\n\n═══════════════════════════════════════");
  console.log("🏁  IMPORTACIÓN COMPLETADA — venezuelareporta.org");
  console.log("═══════════════════════════════════════");
  console.log(`  ✅  Insertados exitosamente: ${successCount.toLocaleString()}`);
  console.log(`  ❌  Errores:                 ${errorCount.toLocaleString()}`);
  console.log(`  📊  Total procesados:        ${allPersonas.length.toLocaleString()}`);
  console.log(`  ⚠️  Páginas con error:       ${errorPages}`);
  console.log("═══════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
