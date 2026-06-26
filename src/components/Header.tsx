"use client";

import React, { useEffect, useState } from "react";
import { Heart, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  scrolledPastNav?: boolean;
  activeView?: 'acopio' | 'mascotas';
  setActiveView?: (view: 'acopio' | 'mascotas') => void;
}

export function Header({ scrolledPastNav = false, activeView = 'acopio', setActiveView }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratación al esperar que el componente esté montado
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-all duration-350 ${
      scrolledPastNav ? "py-2" : "py-4 md:py-6"
    }`}>
      <div className="container mx-auto px-4 relative flex flex-col items-center justify-center gap-1.5">
        
        {/* Selector de Tema (Posicionamiento Absoluto a la derecha) */}
        <div className="absolute right-4 top-0 md:top-2">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-200 cursor-pointer text-neutral-500 dark:text-neutral-400"
              aria-label="Alternar tema claro/oscuro"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-yellow-500" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-neutral-700" />
              )}
            </button>
          )}
        </div>

        {/* Pulsing indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[10px] md:text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
          scrolledPastNav ? "hidden md:flex" : "flex"
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Canal de Emergencia Activo</span>
        </div>

        {/* Centered Logo/Title */}
        <div className="flex items-center gap-2 mt-0.5">
          <Heart className="h-5.5 w-5.5 text-red-500 fill-red-500 animate-pulse" />
          <h1 className="font-heading text-lg md:text-3xl font-black tracking-tighter text-neutral-900 dark:text-white select-none">
            VENEZUELA<span className="text-red-500 font-medium">TE</span>NECESITA<span className="text-neutral-400 dark:text-neutral-500 font-light">.com</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className={`text-neutral-500 dark:text-neutral-400 text-[11px] md:text-sm text-center font-medium max-w-lg leading-relaxed transition-all duration-250 ${
          scrolledPastNav ? "hidden md:block" : "block"
        }`}>
          Plataforma centralizada de ayuda humanitaria • Ubicación de centros de acopio • Búsqueda y registro de personas desaparecidas
        </p>

        {/* Mini Navigation Buttons (Shown only when scrolled past navigation on mobile) */}
        {scrolledPastNav && setActiveView && (
          <div className="flex md:hidden w-full gap-[4px] mt-1.5 border-t border-neutral-100 dark:border-neutral-900/50 pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              onClick={() => setActiveView('acopio')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                activeView === 'acopio'
                  ? 'bg-white text-neutral-900 border-neutral-200 dark:bg-white dark:text-neutral-950 dark:border-white ring-2 ring-neutral-400/30 shadow-sm'
                  : 'bg-neutral-900 text-white border-white'
              }`}
            >
              Acopio
            </button>
            <a
              href="https://desaparecidosterremotovenezuela.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center bg-transparent text-red-650 dark:text-red-400 border-red-600 dark:border-red-500/50 flex items-center justify-center"
            >
              Personas
            </a>
            <button
              onClick={() => setActiveView('mascotas')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                activeView === 'mascotas'
                  ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/30 shadow-sm'
                  : 'bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-600'
              }`}
            >
              Mascotas
            </button>
            <a
              href="https://venezuelareporta.org/recursos#donar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center bg-transparent text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-500/50"
            >
              Donar
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
