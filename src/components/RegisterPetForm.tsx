"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mascota } from "@/data/mockMascotas";
import { Loader2, Upload } from "lucide-react";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

const formSchema = z.object({
  nombre: z.string().optional().transform(v => v || null),
  especie: z.enum(["Perro", "Gato", "Otro"]),
  raza: z.string().optional().transform(v => v || null),
  colorDetalles: z.string().min(5, "Describe el color y señas (mínimo 5 caracteres)"),
  ultimoVistoEstado: z.string().min(1, "Selecciona el estado"),
  ultimoVistoDetalles: z.string().min(10, "Describe brevemente dónde y cómo se vio por última vez (mínimo 10 caracteres)"),
  fechaContactoPerdido: z.string().min(1, "Indica la fecha"),
  informanteNombre: z.string().min(3, "El nombre del informante debe tener al menos 3 caracteres"),
  informanteTelefono: z.string().min(7, "Ingresa un número telefónico de contacto válido"),
  informanteEmail: z.string().email("Correo electrónico inválido").optional().or(z.literal('')).transform(v => v || null),
  estatus: z.enum(["Perdido", "Encontrado"]),
});

type FormValues = z.infer<typeof formSchema>;

const compressImageToWebP = (file: File, maxDimension: number = 800, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface RegisterPetFormProps {
  onSuccess: (newPet: Omit<Mascota, "id" | "creadoEn">) => void;
  onClose: () => void;
  initialStatus?: "Perdido" | "Encontrado";
}

export function RegisterPetForm({ onSuccess, onClose, initialStatus }: RegisterPetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fechaContactoPerdido: new Date().toISOString().split("T")[0],
      ultimoVistoEstado: "",
      nombre: "",
      raza: "",
      ultimoVistoDetalles: "",
      colorDetalles: "",
      especie: "Perro",
      informanteNombre: "",
      informanteTelefono: "",
      informanteEmail: "",
      estatus: initialStatus || "Perdido",
    }
  });

  const watchEstatus = watch("estatus");
  const watchEspecie = watch("especie");

  // Manual field registration for custom button elements
  useEffect(() => {
    register("especie");
    register("estatus");
  }, [register]);

  useEffect(() => {
    if (initialStatus) {
      setValue("estatus", initialStatus);
    }
  }, [initialStatus, setValue]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoError(null);
      try {
        const optimizedWebP = await compressImageToWebP(file);
        setPhotoPreview(optimizedWebP);
      } catch (err) {
        console.error("Error al optimizar la imagen:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!photoPreview) {
      setPhotoError("La foto de la mascota es obligatoria");
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSuccess({
      nombre: values.nombre,
      especie: values.especie,
      raza: values.raza,
      colorDetalles: values.colorDetalles,
      ultimoVistoEstado: values.ultimoVistoEstado,
      ultimoVistoDetalles: values.ultimoVistoDetalles,
      fechaContactoPerdido: values.fechaContactoPerdido,
      informanteNombre: values.informanteNombre,
      informanteTelefono: values.informanteTelefono,
      informanteEmail: values.informanteEmail,
      fotoUrl: photoPreview,
      estatus: values.estatus,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Estatus Reporte */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Tipo de Reporte</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("estatus", "Perdido")}
            className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              watchEstatus === "Perdido"
                ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
          >
            Se Busca / Perdida
          </button>
          <button
            type="button"
            onClick={() => setValue("estatus", "Encontrado")}
            className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              watchEstatus === "Encontrado"
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
          >
            Encontrada / Bajo Resguardo
          </button>
        </div>
      </div>

      {/* Especie */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Especie <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-3 gap-2">
          {["Perro", "Gato", "Otro"].map((esp) => (
            <button
              key={esp}
              type="button"
              onClick={() => setValue("especie", esp as any)}
              className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                watchEspecie === esp
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-450"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850"
              }`}
            >
              {esp}
            </button>
          ))}
        </div>
        {errors.especie && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.especie.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-1">
          <Label htmlFor="nombre" className="text-xs font-semibold">
            Nombre de la mascota (Opcional)
          </Label>
          <Input
            id="nombre"
            placeholder="Ej: Max, Pelusa (o dejar vacío)"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("nombre")}
          />
        </div>

        {/* Raza */}
        <div className="space-y-1">
          <Label htmlFor="raza" className="text-xs font-semibold">
            Raza (Opcional)
          </Label>
          <Input
            id="raza"
            placeholder="Ej: Criollo, Poodle, etc."
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("raza")}
          />
        </div>
      </div>

      {/* Color y señas */}
      <div className="space-y-1">
        <Label htmlFor="colorDetalles" className="text-xs font-semibold">
          Color y Señas Particulares <span className="text-red-500">*</span>
        </Label>
        <Input
          id="colorDetalles"
          placeholder="Ej: Negro con manchas blancas en el pecho, collar rojo..."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
          {...register("colorDetalles")}
        />
        {errors.colorDetalles && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.colorDetalles.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha */}
        <div className="space-y-1">
          <Label htmlFor="fechaContactoPerdido" className="text-xs font-semibold">
            Fecha del Evento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fechaContactoPerdido"
            type="date"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("fechaContactoPerdido")}
          />
          {errors.fechaContactoPerdido && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.fechaContactoPerdido.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-1">
          <Label htmlFor="ultimoVistoEstado" className="text-xs font-semibold">
            Estado de Ubicación <span className="text-red-500">*</span>
          </Label>
          <select
            id="ultimoVistoEstado"
            className="w-full h-[40px] px-3 text-xs md:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
            {...register("ultimoVistoEstado")}
          >
            <option value="" disabled>Selecciona...</option>
            {VENEZUELA_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.ultimoVistoEstado && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.ultimoVistoEstado.message}</p>
          )}
        </div>
      </div>

      {/* Subida de foto */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Cargar Foto <span className="text-red-500">*</span></Label>
        <div className="flex items-center gap-3">
          <div className="relative h-[40px] flex-grow">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-full border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center gap-2 text-xs text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <Upload className="h-4 w-4" />
              <span>{photoPreview ? "Foto seleccionada" : "Seleccionar imagen..."}</span>
            </div>
          </div>
          {photoPreview && (
            <div className="h-[40px] w-[40px] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0">
              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        {photoError && (
          <p className="text-[10px] text-red-500 font-semibold">{photoError}</p>
        )}
      </div>

      {/* Detalles del último avistamiento */}
      <div className="space-y-1">
        <Label htmlFor="ultimoVistoDetalles" className="text-xs font-semibold">
          Último Avistamiento (Dirección y detalles) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="ultimoVistoDetalles"
          placeholder="Ej: Vista corriendo asustada en la Av. Bolívar, cerca del parque central..."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800 min-h-[70px] resize-none"
          {...register("ultimoVistoDetalles")}
        />
        {errors.ultimoVistoDetalles && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.ultimoVistoDetalles.message}</p>
        )}
      </div>

      {/* Datos del Informante */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/50 space-y-3">
        <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
          Datos de Contacto (Persona que Reporta)
        </h4>
        
        <div className="space-y-1">
          <Label htmlFor="informanteNombre" className="text-xs font-semibold">
            Nombre del Informante <span className="text-red-500">*</span>
          </Label>
          <Input
            id="informanteNombre"
            placeholder="Ej: Carlos Silva"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("informanteNombre")}
          />
          {errors.informanteNombre && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.informanteNombre.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="informanteTelefono" className="text-xs font-semibold">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="informanteTelefono"
              placeholder="Ej: +58 412-2223344"
              className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
              {...register("informanteTelefono")}
            />
            {errors.informanteTelefono && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.informanteTelefono.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="informanteEmail" className="text-xs font-semibold">
              Correo (Opcional)
            </Label>
            <Input
              id="informanteEmail"
              placeholder="Ej: carlos@gmail.com"
              className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
              {...register("informanteEmail")}
            />
            {errors.informanteEmail && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.informanteEmail.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-xs rounded-xl cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
              Guardando...
            </>
          ) : (
            "Registrar Reporte"
          )}
        </Button>
      </div>
    </form>
  );
}
