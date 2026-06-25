/**
 * scrape-huellascan.mjs
 *
 * Scraping de www.huellascan.com/terremoto/ver-todos (700+ mascotas)
 * Descarga y parsea el HTML página por página utilizando un delimitador de bloques,
 * e inserta/actualiza los datos en tu base de datos de Supabase (tabla mascotas).
 *
 * Uso:
 *   node scripts/scrape-huellascan.mjs
 */

import { makeSupabaseClient } from "./create-client.mjs";

const supabase = makeSupabaseClient();


// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.huellascan.com/terremoto/ver-todos";
const DELAY_MS = 800; // pausa conservadora entre requests
const BATCH_SIZE = 50;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Helpers para Inferencia y Mapeo ──────────────────────────────────────────
function inferirEspecie(nombre, senas, ubicacion) {
  const text = `${nombre} ${senas} ${ubicacion}`.toLowerCase();
  if (text.includes("gato") || text.includes("gatito") || text.includes("gata") || 
      text.includes("gatita") || text.includes("felino") || text.includes("michi") || 
      text.includes("misu") || text.includes("minino")) {
    return "Gato";
  }
  return "Perro"; // Por defecto es perro, ya que representa la gran mayoría de reportes
}

function inferirEstado(ubicacion) {
  const u = (ubicacion || "").toLowerCase();
  if (u.includes("caracas") || u.includes("dtto") || u.includes("distrito capital") ||
      u.includes("altamira") || u.includes("las mercedes") || u.includes("san bernardino") ||
      u.includes("el junquito") || u.includes("junquito") || u.includes("carrizal") || u.includes("los teques")) return "Miranda"; // Carrizal y Los Teques están en Miranda
  if (u.includes("la guaira") || u.includes("vargas") || u.includes("catia la mar") ||
      u.includes("caraballeda") || u.includes("macuto") || u.includes("naiguata") ||
      u.includes("naiguatá") || u.includes("maiquetia") || u.includes("tanaguarena") ||
      u.includes("playa grande") || u.includes("playa verde") || u.includes("caribe") ||
      u.includes("la guira") || u.includes("lamar")) return "La Guaira";
  if (u.includes("miranda") || u.includes("petare") || u.includes("charallave") || u.includes("guarenas") || u.includes("guatire")) return "Miranda";
  if (u.includes("aragua") || u.includes("maracay") || u.includes("cagua")) return "Aragua";
  if (u.includes("carabobo") || u.includes("valencia") || u.includes("guacara")) return "Carabobo";
  if (u.includes("zulia") || u.includes("maracaibo") || u.includes("cabimas")) return "Zulia";
  if (u.includes("lara") || u.includes("barquisimeto") || u.includes("carora")) return "Lara";
  if (u.includes("bolívar") || u.includes("bolivar") || u.includes("puerto ordaz") || u.includes("guayana")) return "Bolívar";
  if (u.includes("anzoátegui") || u.includes("anzoategui") || u.includes("barcelona") ||
      u.includes("lecheria") || u.includes("puerto la cruz")) return "Anzoátegui";
  if (u.includes("táchira") || u.includes("tachira") || u.includes("san cristóbal")) return "Táchira";
  if (u.includes("mérida") || u.includes("merida")) return "Mérida";
  if (u.includes("monagas") || u.includes("maturin")) return "Monagas";
  if (u.includes("sucre") || u.includes("cumaná")) return "Sucre";
  if (u.includes("falcón") || u.includes("falcon") || u.includes("coro") || u.includes("tucacas")) return "Falcón";
  if (u.includes("portuguesa") || u.includes("guanare")) return "Portuguesa";
  if (u.includes("trujillo") || u.includes("valera")) return "Trujillo";
  if (u.includes("nueva esparta") || u.includes("margarita") || u.includes("porlamar")) return "Nueva Esparta";
  return "La Guaira"; // Default: la mayoría proviene de la zona del terremoto
}

function parseMascotasFromHTML(html) {
  const mascotas = [];
  
  // Dividimos la página en bloques utilizando el delimitador de imagen de Livewire
  const cardBlocks = html.split(/<!--\s*Image\s*Frame\s*-->/i);
  cardBlocks.shift(); // Eliminar todo el HTML anterior al primer card

  for (const block of cardBlocks) {
    // 1. Imagen e ID externo (el ID es el nombre del archivo de la imagen)
    const imgMatch = block.match(/src="(https:\/\/media\.huellascan\.com\/uploads\/earthquake\/([a-f0-9-]+)\.webp)"/);
    if (!imgMatch) continue;
    const imgUrl = imgMatch[1];
    const externalId = imgMatch[2];

    // 2. Nombre de la mascota
    const nameMatch = block.match(/<h3[^>]*>\s*([\s\S]*?)\s*<\/h3>/);
    const nombre = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : 'Desconocido';

    // 3. Estado (Perdido, Encontrado, etc.)
    const statusMatch = block.match(/class="[^"]*text-\[10px\] font-black uppercase[^"]*">\s*(?:🔴|🟢|🔵)?\s*([^<\s]+)\s*<\/span>/);
    let estatus = 'Perdido';
    if (statusMatch) {
      const st = statusMatch[1].trim().toLowerCase();
      if (st.includes('perdido')) estatus = 'Perdido';
      else if (st.includes('encontrado')) estatus = 'Encontrado';
      else if (st.includes('salvo') || st.includes('casa')) estatus = 'A Salvo';
    }

    // 4. Ubicación
    const locationMatch = block.match(/📍 Ubicación:[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const ubicacion = locationMatch ? locationMatch[1].trim() : 'No especificado';

    // 5. Señas / Collar
    const detailsMatch = block.match(/🏷️ Señas \/ Collar:[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const senas = detailsMatch ? detailsMatch[1].trim() : '';

    // 6. Teléfono
    const phoneMatch = block.match(/href="tel:([^"]*)"/);
    const telefono = phoneMatch ? phoneMatch[1].trim() : 'N/D';

    mascotas.push({
      externalId,
      imgUrl,
      nombre,
      estatus,
      ubicacion,
      senas,
      telefono
    });
  }

  return mascotas;
}

function mapMascota(item) {
  const especie = inferirEspecie(item.nombre, item.senas, item.ubicacion);
  const colorDetalles = item.senas || "No especificado";

  return {
    nombre: item.nombre.slice(0, 100),
    especie,
    raza: null,
    color_detalles: colorDetalles.slice(0, 255),
    ultimo_visto_estado: inferirEstado(item.ubicacion),
    ultimo_visto_detalles: item.ubicacion.slice(0, 255),
    fecha_contacto_perdido: "2026-06-24", // Fecha del sismo
    foto_url: item.imgUrl,
    informante_nombre: "Reporte comunitario (HuellaScan)",
    informante_telefono: item.telefono.slice(0, 30),
    informante_email: null,
    estatus: item.estatus,
    fuente: "huellascan",
    external_id: item.externalId,
    prioridad: 2
  };
}

// ─── Fetch de una página HTML ─────────────────────────────────────────────────
async function fetchPage(page) {
  const url = `${BASE_URL}?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "es-VE,es;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Referer": "https://www.huellascan.com/terremoto",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en página ${page}`);
  const html = await res.text();

  // Extraer total de resultados
  const totalMatch = html.match(/(\d+)\s*<\/span>\s*<span>resultados<\/span>/i);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : null;

  const mascotas = parseMascotasFromHTML(html);
  return { mascotas, total };
}

// ─── Upsert en Supabase ───────────────────────────────────────────────────────
async function upsertBatch(records) {
  const { error } = await supabase
    .from("mascotas")
    .upsert(records, { onConflict: "fuente,external_id" });
  if (error) {
    console.error(`\n  ⚠️  Error en lote de mascotas: ${error.message}`);
    return false;
  }
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Iniciando scraping de huellascan.com...\n");

  console.log("📡  Consultando página 1...");
  let firstPageResult;
  try {
    firstPageResult = await fetchPage(1);
  } catch (err) {
    if (err.message.includes("403")) {
      console.warn("⚠️  HuellaScan bloqueó el acceso (HTTP 403) — posiblemente está bloqueando IPs de servidores en la nube.");
      console.warn("⚠️  Los datos existentes en Supabase se mantienen intactos. El scraping se reintentará en el próximo ciclo.");
      process.exit(0); // Salir sin error para no romper el workflow
    }
    throw err; // Otros errores sí son fatales
  }
  const { mascotas: firstPageMascotas, total } = firstPageResult;

  if (!total) {
    console.warn("⚠️  No se pudo determinar el total de registros. El sitio puede estar bloqueando el acceso.");
    process.exit(0);
  }

  const perPage = firstPageMascotas.length;
  const totalPages = Math.ceil(total / perPage);

  // Limitar páginas si se define MAX_PAGES
  const maxPagesEnv = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES, 10) : null;
  const targetPages = maxPagesEnv ? Math.min(totalPages, maxPagesEnv) : totalPages;

  console.log(`📊  Total de mascotas reportadas: ${total.toLocaleString()}`);
  console.log(`📄  Mascotas por página: ${perPage}`);
  console.log(`📄  Total de páginas: ${totalPages}${maxPagesEnv ? ` (Limitando a primeras ${targetPages} páginas)` : ""}\n`);

  let allMascotas = [...firstPageMascotas];
  let errorPages = 0;

  // Descargar el resto de páginas
  for (let page = 2; page <= targetPages; page++) {
    process.stdout.write(`  ⬇️  Descargando página ${page}/${targetPages} (${allMascotas.length.toLocaleString()} mascotas)...\r`);
    try {
      await sleep(DELAY_MS);
      const { mascotas } = await fetchPage(page);
      if (mascotas.length === 0) {
        console.log(`\n  ⚠️  Página ${page} vacía, continuando...`);
      }
      allMascotas.push(...mascotas);
    } catch (err) {
      console.error(`\n  ❌  Error en página ${page}: ${err.message}`);
      errorPages++;
      if (errorPages > 10) {
        console.error("  ❌  Demasiados errores, deteniendo descarga.");
        break;
      }
    }
  }

  console.log(`\n\n✅  Descarga completada: ${allMascotas.length.toLocaleString()} mascotas`);
  console.log("⬆️  Insertando/actualizando en Supabase...\n");

  const mapped = allMascotas.map(mapMascota);
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
      // Reintentar uno por uno en caso de error
      for (const record of batch) {
        const { error } = await supabase
          .from("mascotas")
          .upsert([record], { onConflict: "fuente,external_id" });
        if (!error) successCount++;
        else errorCount++;
      }
    }

    await sleep(50);
  }

  console.log("\n\n═══════════════════════════════════════");
  console.log("🏁  IMPORTACIÓN COMPLETADA — huellascan.com");
  console.log("═══════════════════════════════════════");
  console.log(`  ✅  Insertados/actualizados: ${successCount.toLocaleString()}`);
  console.log(`  ❌  Errores:                 ${errorCount.toLocaleString()}`);
  console.log(`  📊  Total procesados:        ${allMascotas.length.toLocaleString()}`);
  console.log(`  ⚠️  Páginas con error:       ${errorPages}`);
  console.log("═══════════════════════════════════════\n");
}

main().catch((err) => {
  if (err.message && err.message.includes("403")) {
    console.warn("⚠️  HuellaScan bloqueó el acceso (HTTP 403). Los datos existentes se mantienen. Se reintentará en el próximo ciclo.");
    process.exit(0);
  }
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
