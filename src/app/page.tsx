"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MapPin, Users, PawPrint, Heart } from "lucide-react";
import { Footer } from "@/components/Footer";
import { AnnouncementModal } from "@/components/AnnouncementModal";

export default function Home() {
  const [scrolledPastNav, setScrolledPastNav] = useState(false);

  // Efecto para monitorear el scroll en mobile
  useEffect(() => {
    const handleScroll = () => {
      // En mobile, el primer botón de navegación se sobrepasa alrededor de 140px
      setScrolledPastNav(window.scrollY > 140);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans transition-colors duration-300">
      <Header scrolledPastNav={scrolledPastNav} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 flex flex-col gap-8 justify-center items-center">
        
        {/* Botones de navegación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          
          {/* Primer botón (Primary) - Centros de Acopio */}
          <a
            href="https://acopiove.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-blue-500 text-left transition-all duration-300 cursor-pointer bg-blue-600 text-white shadow-md hover:border-blue-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-blue-600 transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Información de Ayuda
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Centros de acopio
              </h3>
              <p className="text-blue-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Encuentra y registra centros de acopios cerca de tu zona
              </p>
            </div>
          </a>

          {/* Segundo botón (Primary) - Personas Desaparecidas */}
          <a
            href="https://desaparecidosterremotovenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-red-500 text-left transition-all duration-300 cursor-pointer bg-red-600 text-white shadow-md hover:border-red-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-red-600 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-red-200 uppercase tracking-wider">
                Prioridad Crítica
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Personas
              </h3>
              <p className="text-red-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Encuentra y registra personas desaparecidas
              </p>
            </div>
          </a>

          {/* Tercer botón (Emerald) - Mascotas */}
          <a
            href="https://mascotasporvenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-emerald-500 text-left transition-all duration-300 cursor-pointer bg-emerald-600 text-white shadow-md hover:border-emerald-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-emerald-600 transition-colors">
              <PawPrint className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Apoyo a Animales
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Mascotas
              </h3>
              <p className="text-emerald-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Registra y busca mascotas perdidas o encontradas
              </p>
            </div>
          </a>

          {/* Cuarto botón (Amber) - Donar */}
          <a
            href="https://venezuelareporta.org/recursos#donar"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-amber-500 text-left transition-all duration-300 cursor-pointer bg-amber-600 text-white shadow-md hover:border-amber-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-amber-600 transition-colors">
              <Heart className="h-6 w-6 fill-amber-600 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                Apoyo Solidario
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Donar
              </h3>
              <p className="text-amber-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Colabora con recursos económicos para la ayuda humanitaria
              </p>
            </div>
          </a>

        </div>

        {/* Modal de Anuncio de Transición / Dirección */}
        <AnnouncementModal />

      </main>
      <Footer />
    </div>
  );
}
