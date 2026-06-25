"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PersonaDesaparecida } from "@/data/mockDesaparecidos";
import { Loader2, Upload, Camera } from "lucide-react";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

const formSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  cedula: z.string().optional().transform(v => v || null),
  edad: z.coerce.number().min(0, "La edad debe ser mayor o igual a 0").max(120, "Edad inválida"),
  ultimoVistoEstado: z.string().min(1, "Selecciona el estado"),
  ultimoVistoDetalles: z.string().min(10, "Describe brevemente dónde y cómo se vio por última vez (mínimo 10 caracteres)"),
  fechaContactoPerdido: z.string().min(1, "Indica la fecha en que se perdió el contacto"),
  informanteNombre: z.string().min(3, "El nombre del informante debe tener al menos 3 caracteres"),
  informanteTelefono: z.string().min(7, "Ingresa un número telefónico de contacto válido"),
  informanteEmail: z.string().email("Correo electrónico inválido").optional().or(z.literal('')).transform(v => v || null),
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

        // Redimensionar manteniendo relación de aspecto
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

        // Convertir a WebP con compresión de calidad 0.75
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface RegisterMissingFormProps {
  onSuccess: (newPerson: Omit<PersonaDesaparecida, "id" | "creadoEn">) => void;
  onClose: () => void;
}

export function RegisterMissingForm({ onSuccess, onClose }: RegisterMissingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fechaContactoPerdido: new Date().toISOString().split("T")[0],
      ultimoVistoEstado: "",
      cedula: "",
      informanteNombre: "",
      informanteTelefono: "",
      informanteEmail: "",
    }
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedWebP = await compressImageToWebP(file);
        setPhotoPreview(optimizedWebP);
      } catch (err) {
        console.error("Error al optimizar la imagen, usando fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    // Simula una pequeña demora del servidor
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    onSuccess({
      nombreCompleto: values.nombreCompleto,
      cedula: values.cedula,
      edad: values.edad,
      ultimoVistoEstado: values.ultimoVistoEstado,
      ultimoVistoDetalles: values.ultimoVistoDetalles,
      fechaContactoPerdido: values.fechaContactoPerdido,
      informanteNombre: values.informanteNombre,
      informanteTelefono: values.informanteTelefono,
      informanteEmail: values.informanteEmail,
      fotoUrl: photoPreview,
      estatus: "Desaparecido",
      reportes: []
    });
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Nombre completo */}
      <div className="space-y-1">
        <Label htmlFor="nombreCompleto" className="text-xs font-semibold">
          Nombre Completo de la Persona <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombreCompleto"
          placeholder="Ej: Juan Pérez"
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
          {...register("nombreCompleto")}
        />
        {errors.nombreCompleto && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.nombreCompleto.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cédula */}
        <div className="space-y-1">
          <Label htmlFor="cedula" className="text-xs font-semibold">
            Cédula (Opcional)
          </Label>
          <Input
            id="cedula"
            placeholder="Ej: V-12.345.678"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("cedula")}
          />
          {errors.cedula && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.cedula.message}</p>
          )}
        </div>

        {/* Edad */}
        <div className="space-y-1">
          <Label htmlFor="edad" className="text-xs font-semibold">
            Edad <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edad"
            type="number"
            placeholder="Ej: 28"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("edad")}
          />
          {errors.edad && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.edad.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha de contacto perdido */}
        <div className="space-y-1">
          <Label htmlFor="fechaContactoPerdido" className="text-xs font-semibold">
            Último Contacto <span className="text-red-500">*</span>
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
            Estado de Desaparición <span className="text-red-500">*</span>
          </Label>
          <select
            id="ultimoVistoEstado"
            className="w-full h-[40px] px-3 text-xs md:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 text-neutral-900 dark:text-neutral-100"
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
        <Label className="text-xs font-semibold">Cargar Foto (Opcional)</Label>
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
      </div>

      {/* Detalles del último avistamiento */}
      <div className="space-y-1">
        <Label htmlFor="ultimoVistoDetalles" className="text-xs font-semibold">
          Último Avistamiento (Detalles) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="ultimoVistoDetalles"
          placeholder="Ej: Se encontraba saliendo del metro de Altamira rumbo a su domicilio. Vestía franela roja, jeans azules, mide 1.70m..."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800 min-h-[70px] resize-none"
          {...register("ultimoVistoDetalles")}
        />
        {errors.ultimoVistoDetalles && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.ultimoVistoDetalles.message}</p>
        )}
      </div>

      {/* Datos del Informante */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/50 space-y-3">
        <h4 className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
          Datos de la Persona que Reporta (Informante)
        </h4>
        
        {/* Nombre del informante */}
        <div className="space-y-1">
          <Label htmlFor="informanteNombre" className="text-xs font-semibold">
            Nombre del Familiar / Informante <span className="text-red-500">*</span>
          </Label>
          <Input
            id="informanteNombre"
            placeholder="Ej: María Rivas"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("informanteNombre")}
          />
          {errors.informanteNombre && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.informanteNombre.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Teléfono */}
          <div className="space-y-1">
            <Label htmlFor="informanteTelefono" className="text-xs font-semibold">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="informanteTelefono"
              placeholder="Ej: +58 412-1112233"
              className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
              {...register("informanteTelefono")}
            />
            {errors.informanteTelefono && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.informanteTelefono.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="informanteEmail" className="text-xs font-semibold">
              Correo (Opcional)
            </Label>
            <Input
              id="informanteEmail"
              placeholder="Ej: maria@gmail.com"
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
          className="w-full sm:w-auto h-11 sm:h-9 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
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
