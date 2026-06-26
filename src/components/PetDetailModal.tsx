"use client";

import React, { useState, useEffect } from "react";
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
  MessageSquare,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";

interface PetDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mascota: Mascota | null;
  onMarkAsFound: (id: string, newStatus: "A Salvo" | "Encontrado") => void;
  onUpdatePet?: (updatedPet: Mascota) => void;
  onDeletePet?: (id: string) => void;
}

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

export function PetDetailModal({
  open,
  onOpenChange,
  mascota,
  onMarkAsFound,
  onUpdatePet,
  onDeletePet
}: PetDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Admin and Editing States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Draft fields for editing
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState<Mascota["especie"]>("Otro");
  const [raza, setRaza] = useState("");
  const [ultimoVistoEstado, setUltimoVistoEstado] = useState("");
  const [ultimoVistoDetalles, setUltimoVistoDetalles] = useState("");
  const [colorDetalles, setColorDetalles] = useState("");
  const [informanteNombre, setInformanteNombre] = useState("");
  const [informanteTelefono, setInformanteTelefono] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [estatus, setEstatus] = useState<"Perdido" | "Encontrado" | "A Salvo">("Perdido");

  useEffect(() => {
    if (mascota) {
      setNombre(mascota.nombre || "");
      setEspecie(mascota.especie);
      setRaza(mascota.raza || "");
      setUltimoVistoEstado(mascota.ultimoVistoEstado || "");
      setUltimoVistoDetalles(mascota.ultimoVistoDetalles || "");
      setColorDetalles(mascota.colorDetalles || "");
      setInformanteNombre(mascota.informanteNombre || "");
      setInformanteTelefono(mascota.informanteTelefono || "");
      setFotoUrl(mascota.fotoUrl || "");
      setEstatus(mascota.estatus);
    }
    // Lock again when modal changes or closes to keep it safe
    if (!open) {
      setEditMode(false);
      setShowPasswordPrompt(false);
      setPasswordInput("");
    }
  }, [mascota, open]);

  if (!mascota) return null;

  const isPerdido = mascota.estatus === "Perdido";
  const initials = (nombre || especie)
    .substring(0, 2)
    .toUpperCase();

  const handleClose = () => {
    setShowConfirm(false);
    setIsPhotoZoomed(false);
    setEditMode(false);
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

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "vzla2026") {
      setIsAdmin(true);
      setShowPasswordPrompt(false);
      setPasswordInput("");
    } else {
      alert("Contraseña incorrecta de administrador.");
    }
  };

  const handleSaveChanges = () => {
    if (!onUpdatePet) return;
    const updated: Mascota = {
      ...mascota,
      nombre,
      especie,
      raza,
      ultimoVistoEstado,
      ultimoVistoDetalles,
      colorDetalles,
      informanteNombre,
      informanteTelefono,
      fotoUrl,
      estatus
    };
    onUpdatePet(updated);
    setEditMode(false);
  };

  const handleDeleteClick = () => {
    if (!onDeletePet) return;
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el reporte de ${nombre || "esta mascota"}?`)) {
      onDeletePet(mascota.id);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="sm:max-w-xl w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between bg-neutral-50/55 dark:bg-neutral-900/10">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {editMode ? "Editando Mascota" : "Ficha de Mascota"}
          </DialogTitle>
          <div className="mr-8 flex items-center gap-2">
            {/* Botón de Compartir */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-450 hover:text-neutral-950 dark:hover:text-white cursor-pointer transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? "¡Copiado!" : "Compartir"}</span>
            </button>

            {/* Lock/Unlock Admin Controls */}
            {isAdmin ? (
              <button
                onClick={() => {
                  setEditMode(!editMode);
                  if (editMode) {
                    // Si cancela edición, restaurar valores originales
                    setNombre(mascota.nombre || "");
                    setEspecie(mascota.especie || "");
                    setRaza(mascota.raza || "");
                    setUltimoVistoEstado(mascota.ultimoVistoEstado || "");
                    setUltimoVistoDetalles(mascota.ultimoVistoDetalles || "");
                    setColorDetalles(mascota.colorDetalles || "");
                    setInformanteNombre(mascota.informanteNombre || "");
                    setInformanteTelefono(mascota.informanteTelefono || "");
                    setFotoUrl(mascota.fotoUrl || "");
                    setEstatus(mascota.estatus);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                  editMode
                    ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                }`}
                title={editMode ? "Cancelar Edición" : "Habilitar Edición"}
              >
                {editMode ? <X className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                <span>{editMode ? "Cancelar" : "Editar"}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPasswordPrompt(!showPasswordPrompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-450 hover:text-neutral-950 dark:hover:text-white cursor-pointer transition-colors"
                title="Administrar Reporte"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Modificar</span>
              </button>
            )}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {showPasswordPrompt ? (
            <form onSubmit={handleUnlockSubmit} className="space-y-4 py-8 text-center max-w-sm mx-auto">
              <div className="mx-auto w-12 h-12 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-heading">
                Acceso de Administrador
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ingresa la contraseña para desbloquear las opciones de editar o eliminar esta publicación.
              </p>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPasswordInput("");
                    }}
                    className="rounded-xl cursor-pointer text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs"
                  >
                    Desbloquear
                  </Button>
                </div>
              </div>
            </form>
          ) : showConfirm ? (
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
                  {fotoUrl ? (
                    <img 
                      src={fotoUrl} 
                      alt={nombre || especie} 
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

                {editMode && (
                  <div className="w-full text-left space-y-1">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">URL de la Foto (Opcional)</span>
                    <input
                      type="text"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Estatus y Nombres */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-center gap-2">
                    {editMode ? (
                      <div className="flex gap-1.5">
                        {(["Perdido", "Encontrado", "A Salvo"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEstatus(s)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                              estatus === s
                                ? s === "Perdido"
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 border-red-500"
                                  : s === "Encontrado"
                                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-500"
                                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-500"
                                : "bg-transparent text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-600"
                            }`}
                          >
                            {s === "Perdido" ? "Se Busca" : s === "Encontrado" ? "Resguardado" : "A Salvo"}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        {estatus === "Perdido" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
                            Se Busca
                          </span>
                        )}
                        {estatus === "Encontrado" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-red-850/30">
                            Bajo Resguardo
                          </span>
                        )}
                        {estatus === "A Salvo" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-800/30">
                            A Salvo / Localizado
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {editMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-1.5">
                      <div className="text-left space-y-1">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nombre</span>
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Nombre"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Especie</span>
                        <select
                          value={especie}
                          onChange={(e) => setEspecie(e.target.value as "Perro" | "Gato" | "Otro")}
                          className="w-full h-[30px] px-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Perro">Perro</option>
                          <option value="Gato">Gato</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div className="text-left space-y-1">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Raza</span>
                        <input
                          type="text"
                          value={raza}
                          onChange={(e) => setRaza(e.target.value)}
                          placeholder="Poodle, Mestizo, etc."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-black font-heading text-neutral-900 dark:text-white leading-none pt-1">
                        {nombre || "Mascota sin nombre"}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {especie} {raza ? `• ${raza}` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ficha de detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-900">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Última Ubicación</span>
                    {editMode ? (
                      <select
                        value={ultimoVistoEstado}
                        onChange={(e) => setUltimoVistoEstado(e.target.value)}
                        className="w-full h-8 px-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-1"
                      >
                        <option value="">Selecciona Estado</option>
                        {VENEZUELA_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {ultimoVistoEstado}
                      </span>
                    )}
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
                {editMode ? (
                  <textarea
                    value={colorDetalles}
                    onChange={(e) => setColorDetalles(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                    {colorDetalles}
                  </p>
                )}
              </div>

              {/* Detalles avistamiento */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Detalles del Último Avistamiento</span>
                {editMode ? (
                  <textarea
                    value={ultimoVistoDetalles}
                    onChange={(e) => setUltimoVistoDetalles(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-900/60">
                    {ultimoVistoDetalles}
                  </p>
                )}
              </div>

              {/* Contacto */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/50 space-y-3">
                <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                  Canales de Contacto Directo
                </h4>
                <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-900 bg-neutral-50/55 dark:bg-neutral-900/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 w-full">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Persona de Contacto</span>
                    {editMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <input
                          type="text"
                          value={informanteNombre}
                          onChange={(e) => setInformanteNombre(e.target.value)}
                          placeholder="Nombre Informante"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={informanteTelefono}
                          onChange={(e) => setInformanteTelefono(e.target.value)}
                          placeholder="Teléfono"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{informanteNombre}</span>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{informanteTelefono}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {!editMode && (
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={`tel:${informanteTelefono}`} 
                        className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Llamar</span>
                      </a>
                      <a 
                        href={`https://wa.me/${cleanPhone(informanteTelefono)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!showConfirm && !showPasswordPrompt && (
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/55 dark:bg-neutral-900/10 flex items-center justify-between gap-2 shrink-0">
            {/* Lado izquierdo del Footer (Eliminar) */}
            <div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/50 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </Button>
              )}
            </div>

            {/* Lado derecho del Footer (Guardar/Cerrar) */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </Button>
              {editMode ? (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                  onClick={handleSaveChanges}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Cambios</span>
                </Button>
              ) : (
                isPerdido && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    onClick={() => setShowConfirm(true)}
                  >
                    Marcar a Salvo
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
