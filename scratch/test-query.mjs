import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Searching for 6415166...");
  
  // Search in mascotas
  const { data: mascotas, error: e1 } = await supabase
    .from("mascotas")
    .select("*");
  
  if (e1) {
    console.error("Error mascotas:", e1);
  } else {
    const matched = mascotas.filter(m => 
      m.id.includes("6415166") || 
      (m.external_id && m.external_id.includes("6415166")) ||
      (m.nombre && m.nombre.includes("6415166"))
    );
    console.log(`Found ${matched.length} matched mascotas:`, JSON.stringify(matched, null, 2));
  }

  // Search in personas
  const { data: personas, error: e2 } = await supabase
    .from("personas_desaparecidas")
    .select("*");

  if (e2) {
    console.error("Error personas:", e2);
  } else {
    const matched = personas.filter(p => 
      p.id.includes("6415166") || 
      (p.external_id && p.external_id.includes("6415166")) ||
      p.nombre_completo.includes("6415166")
    );
    console.log(`Found ${matched.length} matched personas:`, JSON.stringify(matched, null, 2));
  }
}

run();
