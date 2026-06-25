"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mascota } from "@/data/mockMascotas";
import {
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Share2,
  MessageSquare
} from "lucide-react";

interface PetDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mascota: Mascota | null;
  onMarkAsFound: (id: string, newStatus: "A Salvo" | "Encontrado") => void;
}

export function PetDetailModal({
  open,
  onOpenChange,
  mascota,
  onMarkAsFound
}: PetDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!mascota) return null;

  const isPerdido = mascota.estatus === "Perdido";
  const initials = (mascota.nombre || mascota.especie)
    .substring(0, 2)
    .toUpperCase();

  const handleClose = () => {
    setShowConfirm(false);
    setIsPhotoZoomed(false);
    onOpenChange(false);
  };

  const handleShare = () => {
    const shortId = mascota.id.length === 36 ? mascota.id.substring(0, 8) : mascota.id;
    const shareUrl = `${window.location.origin}${window.location.pathname}?mascota=${shortId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Error al copiar enlace:", err);
    });
  };

  const cleanPhone = (phone: string) => {
    return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="sm:max-w-xl w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between bg-neutral-50/55 dark:bg-neutral-900/10">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Ficha de Mascota
          </DialogTitle>
          <button
            onClick={handleShare}
            className="mr-8 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-450 hover:text-neutral-950 dark:hover:text-white cursor-pointer transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? "¡Copiado!" : "Compartir"}</span>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {showConfirm ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-heading">
                ¿Confirmar que la mascota está a salvo?
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Cambiarás el estatus de la mascota a <strong>A Salvo / Localizada</strong>. Esto le indicará a la comunidad que ya no requiere búsqueda activa.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-xl cursor-pointer text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs"
                  onClick={() => {
                    onMarkAsFound(mascota.id, "A Salvo");
                    handleClose();
                  }}
                >
                  Sí, confirmar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Foto o Avatar */}
              <div className="flex flex-col gap-4 items-center text-center w-full">
                <div className="h-64 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center self-center relative">
                  {mascota.fotoUrl ? (
                    <img 
                      src={mascota.fotoUrl} 
                      alt={mascota.nombre || mascota.especie} 
                      className="h-full w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-200" 
                      onClick={() => setIsPhotoZoomed(true)} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 select-none text-neutral-400">
                      <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                        {initials}
                      </div>
                      <span className="text-xs font-medium text-neutral-450 dark:text-neutral-500">Sin foto cargada</span>
                    </div>
                  )}
                </div>

                {/* Estatus y Nombres */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    {mascota.estatus === "Perdido" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
                        Se Busca
                      </span>
                    )}
                    {mascota.estatus === "Encontrado" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                        Bajo Resguardo
                      </span>
                    )}
                    {mascota.estatus === "A Salvo" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-800/30">
                        A Salvo / Localizado
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black font-heading text-neutral-900 dark:text-white leading-none pt-1">
                    {mascota.nombre || "Mascota sin nombre"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ""}
                  </p>
                </div>
              </div>

              {/* Ficha de detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-900">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Última Ubicación</span>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {mascota.ultimoVistoEstado}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Fecha del Reporte</span>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {mascota.fechaContactoPerdido}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Color y Señas Particulares</span>
                <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  {mascota.colorDetalles}
                </p>
              </div>

              {/* Detalles avistamiento */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Detalles del Último Avistamiento</span>
                <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-900/60">
                  {mascota.ultimoVistoDetalles}
                </p>
              </div>

              {/* Contacto */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/50 space-y-3">
                <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                  Canales de Contacto Directo
                </h4>
                <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/55 dark:bg-neutral-900/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Persona de Contacto</span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{mascota.informanteNombre}</span>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{mascota.informanteTelefono}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={`tel:${mascota.informanteTelefono}`} 
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Llamar</span>
                    </a>
                    <a 
                      href={`https://wa.me/${cleanPhone(mascota.informanteTelefono)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!showConfirm && (
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/55 dark:bg-neutral-900/10 flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cerrar
            </Button>
            {isPerdido && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                onClick={() => setShowConfirm(true)}
              >
                Marcar a Salvo
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
