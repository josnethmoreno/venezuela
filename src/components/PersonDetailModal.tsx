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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonaDesaparecida, ReporteInformacion } from "@/data/mockDesaparecidos";
import {
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Clock,
  ChevronRight,
  Share2,
  X
} from "lucide-react";

interface PersonDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: PersonaDesaparecida | null;
  onMarkAsFound: (id: string) => void;
  onAddReport: (personId: string, report: { autorNombre: string; autorTelefono: string | null; mensaje: string }) => void;
}

export function PersonDetailModal({
  open,
  onOpenChange,
  persona,
  onMarkAsFound,
  onAddReport
}: PersonDetailModalProps) {
  const [activeView, setActiveView] = useState<"ficha" | "tengo_info" | "confirmar_salvo">("ficha");
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  
  // Estados para el formulario de "Tengo Información"
  const [autorNombre, setAutorNombre] = useState("");
  const [autorTelefono, setAutorTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [formErrors, setFormErrors] = useState<{ nombre?: string; mensaje?: string }>({});

  if (!persona) return null;

  const isDesaparecido = persona.estatus === "Desaparecido";
  const initials = persona.nombreCompleto
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleClose = () => {
    setActiveView("ficha");
    setAutorNombre("");
    setAutorTelefono("");
    setMensaje("");
    setFormErrors({});
    setIsPhotoZoomed(false);
    onOpenChange(false);
  };

  const handleShare = () => {
    const shortId = persona.id.length === 36 ? persona.id.substring(0, 8) : persona.id;
    const shareUrl = `${window.location.origin}${window.location.pathname}?persona=${shortId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2050);
    }).catch((err) => {
      console.error("Error al copiar enlace:", err);
    });
  };

  const handleGoBack = () => {
    setActiveView("ficha");
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { nombre?: string; mensaje?: string } = {};
    if (!autorNombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (autorNombre.trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!mensaje.trim()) {
      errors.mensaje = "La información es obligatoria";
    } else if (mensaje.trim().length < 10) {
      errors.mensaje = "Describe la información con más detalle (mínimo 10 caracteres)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddReport(persona.id, {
      autorNombre: autorNombre.trim(),
      autorTelefono: autorTelefono.trim() || null,
      mensaje: mensaje.trim()
    });

    // Resetear formulario y regresar a la ficha
    setAutorNombre("");
    setAutorTelefono("");
    setMensaje("");
    setActiveView("ficha");
  };

  const handleConfirmSafe = () => {
    onMarkAsFound(persona.id);
    setActiveView("ficha");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="sm:max-w-xl w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Cabecera común / Barra de navegación interna */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between bg-neutral-50/55 dark:bg-neutral-900/10">
          <div className="flex items-center gap-2">
            {activeView !== "ficha" && (
              <button
                onClick={handleGoBack}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-neutral-500 hover:text-neutral-950 dark:hover:text-white mr-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {activeView === "ficha" && "Ficha de Información"}
              {activeView === "tengo_info" && "Aportar Información"}
              {activeView === "confirmar_salvo" && "Confirmación Requerida"}
            </DialogTitle>
          </div>

          {activeView === "ficha" && (
            <button
              onClick={handleShare}
              className="mr-8 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-450 hover:text-neutral-950 dark:hover:text-white cursor-pointer transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? "¡Copiado!" : "Compartir"}</span>
            </button>
          )}
        </div>

        {/* Contenido con scroll independiente */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {activeView === "ficha" && (
            <>
              {/* Información Personal Principal */}
              <div className="flex flex-col gap-4 items-center text-center w-full">
                <div className="h-80 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center self-center relative">
                  {persona.fotoUrl ? (
                    <img 
                      src={persona.fotoUrl} 
                      alt={persona.nombreCompleto} 
                      className="h-full w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-200" 
                      onClick={() => setIsPhotoZoomed(true)} 
                    />
                  ) : (
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black tracking-wider ${
                      isDesaparecido 
                        ? "bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400"
                        : "bg-green-100 dark:bg-green-950/40 text-green-650 dark:text-green-400"
                    }`}>
                      {initials}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-grow text-center w-full">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h3 className="text-xl font-heading font-black text-neutral-950 dark:text-white leading-tight">
                      {persona.nombreCompleto}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border self-center ${
                      isDesaparecido
                        ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                        : "bg-green-50 dark:bg-green-950 text-green-650 dark:text-green-400 border-green-200 dark:border-green-900/50"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        isDesaparecido ? "bg-red-500 animate-pulse" : "bg-green-500"
                      }`} />
                      {isDesaparecido ? "Sin Contacto" : "A Salvo"}
                    </span>
                  </div>

                  {persona.cedula && (
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-450">
                      C.I.: {persona.cedula}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    <span>Edad: <strong>{persona.edad} años</strong></span>
                    <span>•</span>
                    <span>Último contacto: <strong>{persona.fechaContactoPerdido}</strong></span>
                  </div>
                </div>
              </div>

              {/* Último Avistamiento */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-xl space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5" /> Último Avistamiento Conocido
                </span>
                <p className="text-xs md:text-sm text-neutral-800 dark:text-neutral-300 leading-relaxed font-medium">
                  <strong className="text-neutral-950 dark:text-white font-semibold">{persona.ultimoVistoEstado}:</strong> {persona.ultimoVistoDetalles}
                </p>
              </div>

              {/* Datos del Informante */}
              <div className="border-t border-neutral-100 dark:border-neutral-800/50 pt-4 space-y-2">
                <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Contacto de Familia / Creador del Reporte
                </h4>
                <div className="grid grid-cols-1 gap-3 bg-neutral-50/40 dark:bg-neutral-900/10 p-3.5 border border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-xl text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/20 pb-2">
                    <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Nombre del Familiar:</span>
                    <strong className="text-neutral-850 dark:text-neutral-200">{persona.informanteNombre}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/20 pb-2">
                    <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Teléfono de Contacto:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-855 dark:text-neutral-200">
                      <Phone className="h-3 w-3 text-neutral-450" />
                      <span>{persona.informanteTelefono}</span>
                    </div>
                  </div>
                  {persona.informanteEmail && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">Correo Electrónico:</span>
                      <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                        <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span>{persona.informanteEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Historial de Avistamientos y Aportes */}
              <div className="border-t border-neutral-100 dark:border-neutral-800/50 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Historial de Información Adicional ({persona.reportes.length})
                  </h4>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {persona.reportes.length > 0 ? (
                    persona.reportes.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/70 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-400">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                            <User className="h-3 w-3 text-neutral-400" />
                            <span>{rep.autorNombre}</span>
                            {rep.autorTelefono && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Phone className="h-2.5 w-2.5" /> {rep.autorTelefono}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {new Date(rep.fecha).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-300 leading-relaxed pl-4 border-l border-neutral-200 dark:border-neutral-800">
                          {rep.mensaje}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                      <p className="text-neutral-400 dark:text-neutral-500 text-xs">
                        No hay reportes de información adicionales para esta persona.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* VISTA 2: TENGO INFORMACIÓN */}
          {activeView === "tengo_info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="bg-blue-55/35 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-xl text-xs text-blue-700 dark:text-blue-400 leading-relaxed mb-4">
                Usa este formulario para reportar si has visto a esta persona o tienes información útil sobre su paradero. Toda la información aportada será pública y se agregará al historial.
              </div>

              {/* Nombre completo */}
              <div className="space-y-1">
                <Label htmlFor="autorNombre" className="text-xs font-semibold">
                  Tu Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="autorNombre"
                  placeholder="Ej: Pedro Pérez"
                  value={autorNombre}
                  onChange={(e) => setAutorNombre(e.target.value)}
                  className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
                />
                {formErrors.nombre && (
                  <p className="text-[10px] text-red-500 font-semibold">{formErrors.nombre}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <Label htmlFor="autorTelefono" className="text-xs font-semibold">
                  Tu Teléfono de Contacto (Opcional)
                </Label>
                <Input
                  id="autorTelefono"
                  placeholder="Ej: +58 414-0000000"
                  value={autorTelefono}
                  onChange={(e) => setAutorTelefono(e.target.value)}
                  className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
                />
              </div>

              {/* Mensaje */}
              <div className="space-y-1">
                <Label htmlFor="mensaje" className="text-xs font-semibold">
                  Detalles de la Información / Avistamiento <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="mensaje"
                  placeholder="Ej: Vi a la persona en la tarde del sismo en la Avenida Francisco de Miranda. Se subió a una unidad de rescate de Protección Civil con dirección al centro médico de campaña..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800 min-h-[90px] resize-none"
                />
                {formErrors.mensaje && (
                  <p className="text-[10px] text-red-500 font-semibold">{formErrors.mensaje}</p>
                )}
              </div>
            </form>
          )}

          {/* VISTA 3: CONFIRMACIÓN A SALVO */}
          {activeView === "confirmar_salvo" && (
            <div className="space-y-5 py-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                    Confirmar Cambio de Estatus
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                    ¿Estás seguro de que deseas marcar a <strong>{persona.nombreCompleto}</strong> como <strong>A Salvo</strong>?
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400/90 leading-relaxed">
                    Esta acción es pública. El estatus de la persona cambiará en todo el portal a "A Salvo" y se notificará que ya ha sido localizada y se encuentra en contacto con sus familiares.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie de página con botones dinámicos */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
          
          {activeView === "ficha" && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </Button>
              {isDesaparecido && (
                <>
                  <Button
                    onClick={() => setActiveView("confirmar_salvo")}
                    className="w-full sm:w-auto h-11 sm:h-9 bg-white hover:bg-green-600 dark:bg-neutral-950 dark:hover:bg-green-900 border border-green-500 hover:border-green-600 dark:border-green-500/50 text-green-600 hover:text-white dark:text-green-400 dark:hover:text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Marcar persona a salvo
                  </Button>
                  <Button
                    onClick={() => setActiveView("tengo_info")}
                    className="w-full sm:w-auto h-11 sm:h-9 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tengo Información
                  </Button>
                </>
              )}
            </>
          )}

          {activeView === "tengo_info" && (
            <>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInfoSubmit}
                className="w-full sm:w-auto h-11 sm:h-9 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
              >
                Guardar Información
              </Button>
            </>
          )}

          {activeView === "confirmar_salvo" && (
            <>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSafe}
                className="w-full sm:w-auto h-11 sm:h-9 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar y Marcar
              </Button>
            </>
          )}

        </div>

        {/* Overlay de Imagen Ampliada */}
        {isPhotoZoomed && persona.fotoUrl && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in-0 duration-200"
            onClick={() => setIsPhotoZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <img 
                src={persona.fotoUrl} 
                alt={persona.nombreCompleto} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
              />
              <button 
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer transition-colors border border-white/10"
                onClick={() => setIsPhotoZoomed(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
