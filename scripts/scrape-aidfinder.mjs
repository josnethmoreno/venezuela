/**
 * scrape-aidfinder.mjs
 *
 * Realiza scraping de https://venezuela-aid-finder.lovable.app/ para
 * extraer los centros de acopio nacionales e internacionales, clasificándolos
 * por país y ciudad, e insertándolos en Supabase.
 *
 * Uso:
 *   node scripts/scrape-aidfinder.mjs
 */

import { makeSupabaseClient } from "./create-client.mjs";

const supabase = makeSupabaseClient();

// ─── Config ──────────────────────────────────────────────────────────────────
const TARGET_URL = "https://venezuela-aid-finder.lovable.app/";

// ─── Clasificador de País y Ciudad ──────────────────────────────────────────
function parseLocation(locationText, addressText, mapUrl) {
  let lat = null;
  let lng = null;
  if (mapUrl) {
    const coordMatch = mapUrl.match(/q=(-?\d+\.\d+)(?:%2C|%2C%20|,|, |%20| )(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }
  }

  const loc = (locationText || "").toLowerCase();
  const addr = (addressText || "").toLowerCase();

  let pais = "Venezuela";
  let ciudad = locationText || "";

  // 1. Determinar País
  if (lat !== null && lng !== null) {
    const isVzla = lat >= 0.5 && lat <= 13.0 && lng >= -73.5 && lng <= -59.0;
    if (isVzla) {
      pais = "Venezuela";
    } else {
      // Coordenadas fuera de Venezuela
      if (lat >= 24.0 && lat <= 50.0 && lng >= -125.0 && lng <= -66.0) {
        pais = "Estados Unidos";
      } else if (lat >= 0.0 && lat <= 13.0 && lng >= -82.0 && lng <= -67.0) {
        pais = "Colombia";
      } else if (lat >= 35.0 && lat <= 44.0 && lng >= -10.0 && lng <= 5.0) {
        pais = "España";
      } else if (lat >= 7.0 && lat <= 10.0 && lng >= -83.0 && lng <= -77.0) {
        pais = "Panamá";
      } else if (lat >= -5.0 && lat <= 2.0 && lng >= -81.0 && lng <= -75.0) {
        pais = "Ecuador";
      } else if (lat >= -56.0 && lat <= -21.0 && lng >= -76.0 && lng <= -50.0) {
        if (lng <= -67.0) pais = "Chile";
        else pais = "Argentina";
      } else if (lat >= 14.0 && lat <= 33.0 && lng >= -118.0 && lng <= -86.0) {
        pais = "México";
      } else if (lat >= 17.5 && lat <= 18.6 && lng >= -67.3 && lng <= -65.2) {
        pais = "Puerto Rico";
      } else if (lat >= -18.0 && lat <= 0.0 && lng >= -82.0 && lng <= -68.0) {
        pais = "Perú";
      } else {
        pais = "Extranjero";
      }
    }
  } else {
    // Sin coordenadas, clasificar por palabras clave en la dirección/ubicación
    if (addr.includes("colombia") || loc.includes("colombia") || addr.includes("bogotá") || addr.includes("bogota") || addr.includes("cúcuta") || addr.includes("cucuta") || addr.includes("cali") || addr.includes("bucaramanga") || addr.includes("cartagena") || addr.includes("medellín") || addr.includes("medellin")) {
      pais = "Colombia";
    } else if (addr.includes("doral") || addr.includes("miami") || addr.includes("boca raton") || addr.includes("pembroke pines") || addr.includes("austin") || addr.includes("san antonio") || addr.includes("brooklyn") || addr.includes("queens") || addr.includes("fairfax") || addr.includes("fl ") || addr.includes("tx ") || addr.includes("ny ") || addr.includes("va ") || addr.includes("dawson blvd")) {
      pais = "Estados Unidos";
    } else if (addr.includes("madrid") || addr.includes("españa") || addr.includes("espana")) {
      pais = "España";
    } else if (addr.includes("panamá") || addr.includes("panama") || addr.includes("riba smith")) {
      pais = "Panamá";
    } else if (addr.includes("guayaquil") || addr.includes("quito") || addr.includes("ecuador")) {
      pais = "Ecuador";
    } else if (addr.includes("buenos aires") || addr.includes("argentina")) {
      pais = "Argentina";
    } else if (addr.includes("santiago") || addr.includes("chile") || addr.includes("providencia")) {
      pais = "Chile";
    } else if (addr.includes("méxico") || addr.includes("mexico") || addr.includes("roma nte") || addr.includes("querétaro 90")) {
      pais = "México";
    } else if (addr.includes("puerto rico") || addr.includes("san juan") || addr.includes("pedro bigay")) {
      pais = "Puerto Rico";
    } else if (addr.includes("perú") || loc.includes("peru") || addr.includes("lima") || addr.includes("jesús maría")) {
      pais = "Perú";
    } else {
      pais = "Venezuela";
    }
  }

  // 2. Determinar Ciudad/Estado
  const normalizedAddr = addr.toLowerCase();
  const normalizedLoc = loc.toLowerCase();

  if (pais === "Venezuela") {
    // Normalizar ciudad/estado para Venezuela
    if (normalizedAddr.includes("caracas") || normalizedAddr.includes("chacao") || normalizedAddr.includes("baruta") || normalizedAddr.includes("el hatillo") || normalizedAddr.includes("altamira") || normalizedAddr.includes("los palos grandes") || normalizedAddr.includes("montalbán") || normalizedAddr.includes("catia") || normalizedAddr.includes("san bernardino")) {
      ciudad = "Caracas";
    } else if (normalizedAddr.includes("barquisimeto") || normalizedAddr.includes("cabudare") || normalizedLoc.includes("cabudare")) {
      ciudad = "Barquisimeto";
    } else if (normalizedAddr.includes("valencia") || normalizedAddr.includes("san diego")) {
      ciudad = "Valencia";
    } else if (normalizedAddr.includes("maracaibo")) {
      ciudad = "Maracaibo";
    } else if (normalizedAddr.includes("maracay")) {
      ciudad = "Maracay";
    } else if (normalizedAddr.includes("san cristóbal") || normalizedAddr.includes("san cristobal")) {
      ciudad = "San Cristóbal";
    } else if (normalizedAddr.includes("puerto ordaz") || normalizedAddr.includes("san felix") || normalizedAddr.includes("ciudad guayana")) {
      ciudad = "Ciudad Guayana";
    } else if (normalizedAddr.includes("barcelona") || normalizedAddr.includes("puerto la cruz")) {
      ciudad = "Barcelona / Puerto La Cruz";
    } else {
      // Usar la ubicación de Lovable si no se pudo mapear
      ciudad = locationText || "Venezuela";
    }
  } else {
    // Para el Extranjero
    if (pais === "Estados Unidos") {
      if (normalizedAddr.includes("doral")) ciudad = "Doral";
      else if (normalizedAddr.includes("miami")) ciudad = "Miami";
      else if (normalizedAddr.includes("boca raton") || normalizedAddr.includes("boca rato")) ciudad = "Boca Raton";
      else if (normalizedAddr.includes("pembroke pines")) ciudad = "Pembroke Pines";
      else if (normalizedAddr.includes("austin")) ciudad = "Austin";
      else if (normalizedAddr.includes("san antonio")) ciudad = "San Antonio";
      else if (normalizedAddr.includes("brooklyn")) ciudad = "Brooklyn";
      else if (normalizedAddr.includes("queens") || normalizedAddr.includes("roosevelt avenue")) ciudad = "Queens";
      else if (normalizedAddr.includes("fairfax")) ciudad = "Fairfax";
      else ciudad = locationText || "Miami";
    } else if (pais === "Colombia") {
      if (normalizedAddr.includes("bogotá") || normalizedAddr.includes("bogota")) ciudad = "Bogotá";
      else if (normalizedAddr.includes("cúcuta") || normalizedAddr.includes("cucuta")) ciudad = "Cúcuta";
      else if (normalizedAddr.includes("cali")) ciudad = "Cali";
      else if (normalizedAddr.includes("medellín") || normalizedAddr.includes("medellin")) ciudad = "Medellín";
      else if (normalizedAddr.includes("bucaramanga")) ciudad = "Bucaramanga";
      else if (normalizedAddr.includes("cartagena")) ciudad = "Cartagena";
      else ciudad = locationText || "Bogotá";
    } else if (pais === "España") {
      ciudad = "Madrid";
    } else if (pais === "Panamá") {
      ciudad = "Panamá";
    } else if (pais === "Ecuador") {
      if (normalizedAddr.includes("quito")) ciudad = "Quito";
      else ciudad = "Guayaquil";
    } else if (pais === "Argentina") {
      ciudad = "Buenos Aires";
    } else if (pais === "Chile") {
      ciudad = "Santiago";
    } else if (pais === "México") {
      ciudad = "Ciudad de México";
    } else if (pais === "Puerto Rico") {
      ciudad = "San Juan";
    } else if (pais === "Perú") {
      ciudad = "Lima";
    }
  }

  // Quitar el nombre del país del texto de ciudad si está presente
  if (ciudad.includes("·")) {
    ciudad = ciudad.split("·")[0].trim();
  }

  return { pais, ciudad };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍  Iniciando scraping de centros de acopio de Lovable...\n");

  const res = await fetch(TARGET_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} al consultar ${TARGET_URL}`);
  const html = await res.text();

  // Buscar todos los bloques <article class="...">...</article>
  const articleRegex = /<article class="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary\/40 hover:shadow-md">([\s\S]*?)<\/article>/g;
  let match;
  const parsedCenters = [];

  while ((match = articleRegex.exec(html)) !== null) {
    const content = match[1];

    // Extract location (City/State)
    const locMatch = content.match(/hidden="true">📍<\/span>\s*([\s\S]*?)<\/div>/);
    const location = locMatch ? locMatch[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : "";

    // Extract Name
    const nameMatch = content.match(/<h2 class="[^"]*text-foreground">([^<]+)<\/h2>/);
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Extract Address
    const addrMatch = content.match(/<p class="mt-3 text-sm text-foreground\/80">([^<]+)<\/p>/);
    const address = addrMatch ? addrMatch[1].trim() : "";

    // Extract Needs
    const needsMatch = content.match(/Reciben<\/div><p class="[^"]*text-foreground\/90">([^<]+)<\/p>/);
    let necesidades = ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"];
    if (needsMatch) {
      const rawNeeds = needsMatch[1].trim();
      necesidades = rawNeeds.split(/[,;•\n]+/).map(n => n.trim()).filter(Boolean);
    }

    // Extract Maps link
    const mapsMatch = content.match(/href="(https:\/\/(www\.)?(google\.com\/maps[^"]*))"/);
    const mapsUrl = mapsMatch ? mapsMatch[1] : "";

    // Extract Tel link
    const telMatch = content.match(/href="tel:([^"]+)"/);
    const tel = telMatch ? telMatch[1].trim() : "";

    // Extract Instagram / Social links
    const socialMatch = content.match(/href="(https?:\/\/(www\.)?(instagram\.com\/[^"]*))"/);
    const socialUrl = socialMatch ? socialMatch[1].trim() : "";

    const { pais, ciudad } = parseLocation(location, address, mapsUrl);

    // Mapear al modelo de la DB
    // Nota: El contacto puede ser el teléfono o el link de instagram o dirección de mapa
    const contacto = tel || socialUrl || mapsUrl || "Sin contacto directo";

    parsedCenters.push({
      nombre: name,
      estado: pais === "Venezuela" ? (location || "Venezuela") : pais, // En la DB nacional 'estado' es el estado/estado-federal
      direccion: address || "No especificada",
      contacto: contacto.slice(0, 300),
      necesidades,
      verificado: true, // Asumimos que los que están en Lovable están verificados
      pais,
      ciudad
    });
  }

  console.log(`📊  Total de centros encontrados en el scraping: ${parsedCenters.length}`);

  // Cargar centros existentes en Supabase
  const { data: existing, error: loadError } = await supabase
    .from("centros_acopio")
    .select("id, nombre, direccion, pais");

  if (loadError) {
    console.error("⚠️  Error al cargar centros existentes:", loadError.message);
    process.exit(1);
  }

  console.log(`💾  Centros actualmente en DB: ${existing.length}`);

  // Crear un mapa para buscar rápidamente
  const existingMap = new Map();
  for (const c of existing) {
    const key = `${c.nombre.toLowerCase().trim()}|${c.direccion.toLowerCase().trim()}|${(c.pais || "Venezuela").toLowerCase().trim()}`;
    existingMap.set(key, c.id);
  }

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const record of parsedCenters) {
    const key = `${record.nombre.toLowerCase().trim()}|${record.direccion.toLowerCase().trim()}|${record.pais.toLowerCase().trim()}`;
    
    if (existingMap.has(key)) {
      const id = existingMap.get(key);
      const { error } = await supabase
        .from("centros_acopio")
        .update({
          contacto: record.contacto,
          necesidades: record.necesidades,
          ciudad: record.ciudad,
          estado: record.estado
        })
        .eq("id", id);

      if (error) {
        console.error(`  ❌ Error actualizando '${record.nombre}':`, error.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      const { error } = await supabase
        .from("centros_acopio")
        .insert([record]);

      if (error) {
        console.error(`  ❌ Error insertando '${record.nombre}':`, error.message);
        errorCount++;
      } else {
        insertedCount++;
      }
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("🏁  IMPORTACIÓN COMPLETADA — Centros de Acopio");
  console.log("═══════════════════════════════════════");
  console.log(`  ✅  Insertados nuevos:       ${insertedCount}`);
  console.log(`  🔄  Actualizados existentes: ${updatedCount}`);
  console.log(`  ❌  Errores:                 ${errorCount}`);
  console.log("═══════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
