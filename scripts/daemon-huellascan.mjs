/**
 * daemon-huellascan.mjs
 *
 * Ejecuta scrape-huellascan.mjs cada 5 minutos en local.
 * Úsalo mientras tu PC esté encendida para mantener los datos de mascotas
 * actualizados en Supabase (HuellaScan bloquea las IPs de GitHub Actions).
 *
 * Uso:
 *   node scripts/daemon-huellascan.mjs
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(__dirname, "scrape-huellascan.mjs");
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

let runCount = 0;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("es-VE", { hour12: false });
}

function runScraper() {
  runCount++;
  const start = new Date();
  console.log(`\n${"═".repeat(50)}`);
  console.log(`🐾  [${formatTime(start)}] Ciclo #${runCount} — Iniciando HuellaScan...`);
  console.log(`${"═".repeat(50)}\n`);

  const child = spawn("node", [SCRIPT_PATH], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  child.on("close", (code) => {
    const end = new Date();
    const elapsed = ((end - start) / 1000).toFixed(1);
    if (code === 0) {
      console.log(`\n✅  [${formatTime(end)}] Ciclo #${runCount} completado en ${elapsed}s`);
    } else {
      console.log(`\n⚠️  [${formatTime(end)}] Ciclo #${runCount} terminó con código ${code} (${elapsed}s)`);
    }
    console.log(`⏳  Próximo ciclo en 5 minutos (${formatTime(new Date(Date.now() + INTERVAL_MS))})...\n`);
  });

  child.on("error", (err) => {
    console.error(`❌  Error al ejecutar el scraper: ${err.message}`);
  });
}

// Ejecutar inmediatamente al iniciar
console.log("🚀  Daemon HuellaScan iniciado");
console.log(`📅  Ejecutará el scraper cada 5 minutos`);
console.log(`⏹️   Detener con Ctrl+C\n`);

runScraper();

// Repetir cada 5 minutos
setInterval(runScraper, INTERVAL_MS);
