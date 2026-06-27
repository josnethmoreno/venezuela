"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const forceShow = searchParams.get("force_announcement") === "true";
      // Verificar si el usuario ya vio el anuncio en esta versión
      const hasSeen = localStorage.getItem("venezuela-sismo-announcement-seen-v2");
      if (!hasSeen || forceShow) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600); // Retraso sutil para una entrada premium
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Por seguridad, si localStorage falla, igual mostramos el modal
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem("venezuela-sismo-announcement-seen-v2", "true");
    } catch (e) {
      // Ignorar fallas silenciosas en la escritura de localStorage
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col items-center text-center">
        {/* Barra superior de gradiente */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
        
        {/* Icono verificado con brillo y rebote suave */}
        <div className="mt-2 mb-2 sm:mt-4 sm:mb-3 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl w-16 h-16 animate-pulse" />
          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 animate-bounce" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <DialogHeader className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
          <DialogTitle className="text-lg sm:text-xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight flex items-center gap-1.5">
            ¡Unimos esfuerzos!
          </DialogTitle>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
            Directorio 100% Verificado
          </div>
        </DialogHeader>

        <DialogDescription className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed mt-2 sm:mt-3 max-w-sm font-medium">
          Debido a la aparición de múltiples plataformas que dispersaban la información sobre el terremoto de Venezuela 2026, <strong>venezuelatenecesita.com</strong> se suma para centralizar esfuerzos.
          <br /><br />
          Ahora somos un <strong>directorio centralizado de sitios web 100% confiables y verificados</strong>, garantizando que encuentres enlaces seguros y validados en un solo lugar.
        </DialogDescription>

        <div className="mt-5 sm:mt-6 w-full">
          <Button 
            onClick={handleClose} 
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-900 font-bold py-2 sm:py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] border border-transparent text-xs sm:text-sm"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
