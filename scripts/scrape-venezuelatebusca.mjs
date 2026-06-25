/**
 * scrape-venezuelatebusca.mjs
 *
 * Descarga todos los registros de personas de la API pública de
 * venezuela-te-busca-app.hellogafaro.workers.dev e inserta los datos en tu
 * proyecto de Supabase (tabla personas_desaparecidas).
 *
 * Uso:
 *   node scripts/scrape-venezuelatebusca.mjs
 */

import { makeSupabaseClient } from "./create-client.mjs";

const supabase = makeSupabaseClient();

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://venezuela-te-busca-app.hellogafaro.workers.dev";
const BATCH_SIZE = 50;

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
  const estatus = item.status === "found" ? "Localizado" : "Desaparecido";
  const fecha = item.created_at ? item.created_at.slice(0, 10) : "2026-06-24";
  
  return {
    nombre_completo: `${item.first_name || ""} ${item.last_name || ""}`.trim().slice(0, 200) || "Sin nombre",
    cedula: item.national_id ? String(item.national_id).slice(0, 30) : null,
    edad: item.age != null ? Math.min(Math.max(0, Number(item.age)), 120) : 0,
    ultimo_visto_estado: inferirEstado(item.last_seen_location),
    ultimo_visto_detalles: [item.last_seen_location, item.description].filter(Boolean).join(" - ").trim() || "No especificado",
    fecha_contacto_perdido: fecha,
    foto_url: item.photo_key ? `${BASE_URL}/media/photos/${item.photo_key}` : null,
    informante_nombre: (item.reporter_name || "Desconocido").slice(0, 200),
    informante_telefono: (item.reporter_phone || "N/D").slice(0, 30),
    informante_email: item.reporter_email ? String(item.reporter_email).slice(0, 100) : null,
    estatus,
    fuente: "venezuelatebusca",
    external_id: String(item.id),
    prioridad: 2
  };
}

// ─── Insertar/Actualizar lote en Supabase ──────────────────────────────────────
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

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Iniciando scraping de venezuela-te-busca-app.hellogafaro.workers.dev...\n");
  
  // Como el endpoint tiene un límite configurado, usamos limit=1000 que capta el máximo (250 registros)
  // en un solo fetch de forma súper rápida y eficiente.
  const url = `${BASE_URL}/api/persons?limit=1000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al consultar API`);
  
  const data = await res.json();
  const rawPersons = data.persons || [];
  
  console.log(`📊  Total de personas descargadas de la API: ${rawPersons.length}`);
  
  const mapped = rawPersons.map(mapPersona);
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
      // Reintentar de a uno si el lote falló
      for (const record of batch) {
        const { error } = await supabase
          .from("personas_desaparecidas")
          .upsert([record], { onConflict: "fuente,external_id" });
        if (!error) successCount++;
        else errorCount++;
      }
    }
  }

  console.log("\n\n═══════════════════════════════════════");
  console.log("🏁  IMPORTACIÓN COMPLETADA — venezuelatebusca");
  console.log("═══════════════════════════════════════");
  console.log(`  ✅  Insertados/actualizados: ${successCount.toLocaleString()}`);
  console.log(`  ❌  Errores:                 ${errorCount.toLocaleString()}`);
  console.log(`  📊  Total procesados:        ${rawPersons.length}`);
  console.log("═══════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
