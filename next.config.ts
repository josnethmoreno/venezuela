import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fijamos la raíz de Turbopack a este directorio para evitar que escanee la carpeta de usuario
  // @ts-ignore
  turbopack: {
    root: __dirname,
  }
};

export default nextConfig;
