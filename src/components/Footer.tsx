"use client";

import React from "react";
import { Heart, Phone, Shield, ShieldAlert, ExternalLink, LifeBuoy, BookOpen, AlertTriangle, Mail, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        
        {/* Sección Superior: Grid de Canales y Enlaces */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-neutral-200 dark:border-neutral-900">
          
          {/* Columna 1: Branding y Propósito (Col-span 4) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500 animate-pulse" />
              <h2 className="font-heading text-lg font-black tracking-tighter text-neutral-900 dark:text-white">
                VENEZUELA<span className="text-red-500 font-medium">TE</span>NECESITA<span className="text-neutral-400 dark:text-neutral-500 font-light text-xs">.com</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed max-w-sm">
              Plataforma digital centralizada e independiente para la coordinación de ayuda humanitaria tras el evento sísmico. Desarrollada y gestionada por voluntarios de la sociedad civil.
            </p>
            
            {/* Aviso de Confianza / Emergencia */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 max-w-sm">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-normal">
                <strong>Atención:</strong> Esta herramienta no sustituye las alertas y directrices de Protección Civil y Bomberos. En caso de peligro inminente, llama a las autoridades correspondientes.
              </p>
            </div>
          </div>

          {/* Columna 2: Números de Emergencia Críticos (Col-span 4) */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-heading text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Líneas de Emergencia Nacional
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-neutral-850 dark:text-neutral-200">
                    Emergencias Generales (VEN 911)
                  </span>
                  <a href="tel:911" className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-red-550 hover:underline">
                    Marcar 911
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-neutral-850 dark:text-neutral-200">
                    Protección Civil Nacional
                  </span>
                  <a href="tel:08007248454" className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-blue-500 hover:underline">
                    0-800-PCIVIL1 (0800-7248454)
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-350 shrink-0">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-neutral-850 dark:text-neutral-250">
                    Bomberos Universitarios UCV
                  </span>
                  <a href="tel:02126052222" className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:underline">
                    (0212) 605-2222 / 3111
                  </a>
                </div>
              </li>
            </ul>

            {/* Accesos Rápidos por Operadora */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900/60">
              <span className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                Accesos por Operadora (Emergencias)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900/50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900/80">
                  <span className="block font-bold text-neutral-800 dark:text-neutral-200">171</span>
                  <a href="tel:171" className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:underline">
                    Fijo CANTV
                  </a>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900/50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900/80">
                  <span className="block font-bold text-neutral-800 dark:text-neutral-200">*1</span>
                  <a href="tel:*1" className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:underline">
                    Movilnet
                  </a>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900/50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900/80">
                  <span className="block font-bold text-neutral-800 dark:text-neutral-200">112</span>
                  <a href="tel:112" className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:underline">
                    Digitel
                  </a>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900/50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900/80">
                  <span className="block font-bold text-neutral-800 dark:text-neutral-200">911</span>
                  <a href="tel:911" className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:underline">
                    Movistar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Enlaces y Canales Oficiales (Col-span 3) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="font-heading text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Recursos y Enlaces Útiles
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">

              <li>
                <a
                  href="https://x.com/RedAyudaVE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <Twitter className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                  <span>RedAyudaVE en X (Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/cruzrojave/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                  <span>Cruz Roja Venezolana</span>
                </a>
              </li>
              <li>
                <a
                  href="https://earthquake.usgs.gov/earthquakes/map/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                  <span>Monitoreo Sísmico USGS (EE.UU.)</span>
                </a>
              </li>
              <li>
                <div className="h-px bg-neutral-100 dark:bg-neutral-900/60 my-2" />
              </li>
              <li>
                <a
                  href="https://www.igepn.edu.ec/que-hacer-ante/un-sismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline group"
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>Guía: ¿Qué hacer durante un sismo?</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:josnethmoreno@gmail.com"
                  className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                  <span>Soporte: josnethmoreno@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Sección Inferior: Derechos, Privacidad e Información Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-neutral-500 dark:text-neutral-500">
          
          {/* Copyright y Licencia */}
          <div className="text-center sm:text-left space-y-1">
            <span className="block font-medium">
              &copy; {currentYear} Venezuela Te Necesita. Proyecto Solidario.
            </span>
            <span className="block">
              Código abierto bajo licencia MIT. Desarrollado con fines exclusivamente humanitarios.
            </span>
          </div>

          {/* Enlaces legales / voluntarios */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1 font-semibold text-neutral-600 dark:text-neutral-400">
              <LifeBuoy className="h-3.5 w-3.5 text-red-500" />
              <span>Ayuda Mutua Venezolana</span>
            </span>
            <span>•</span>
            <span className="text-center">
              Sin fines comerciales • Datos públicos de libre consulta.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
