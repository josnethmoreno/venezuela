"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CentroAcopio } from "@/data/mockCentros";
import { Loader2, Check } from "lucide-react";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

const CATEGORIAS_NECESIDADES = [
  "Agua Potable",
  "Alimentos no perecederos",
  "Medicinas y Primeros Auxilios",
  "Ropa y Cobijas",
  "Artículos de higiene personal",
  "Herramientas de rescate / Linternas"
];

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre del centro debe tener al menos 3 caracteres"),
  estado: z.string().min(1, "Selecciona el estado"),
  direccion: z.string().min(10, "Ingresa una dirección detallada del centro (mínimo 10 caracteres)"),
  contacto: z.string().min(5, "Ingresa información de contacto útil (teléfono o usuario de red social)"),
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterCentroFormProps {
  onSuccess: (newCentro: Omit<CentroAcopio, "id" | "verificado">) => void;
  onClose: () => void;
}

export function RegisterCentroForm({ onSuccess, onClose }: RegisterCentroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [needsError, setNeedsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nombre: "",
      estado: "",
      direccion: "",
      contacto: "",
    }
  });

  const toggleNeed = (need: string) => {
    setNeedsError(null);
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedNeeds.length === 0) {
      setNeedsError("Selecciona al menos una necesidad prioritaria");
      return;
    }

    setIsSubmitting(true);
    // Simula demora
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSuccess({
      nombre: values.nombre,
      estado: values.estado,
      direccion: values.direccion,
      contacto: values.contacto,
      necesidades: selectedNeeds,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-neutral-900 dark:text-neutral-50">
      {/* Nombre del centro */}
      <div className="space-y-1">
        <Label htmlFor="nombre" className="text-xs font-semibold">
          Nombre del Centro de Acopio <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombre"
          placeholder="Ej: Sede de la Cruz Roja, Parroquia El Recreo, etc."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.nombre.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Estado */}
        <div className="space-y-1">
          <Label htmlFor="estado" className="text-xs font-semibold">
            Estado de Ubicación <span className="text-red-500">*</span>
          </Label>
          <select
            id="estado"
            className="w-full h-[40px] px-3 text-xs md:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            {...register("estado")}
          >
            <option value="" disabled>Selecciona...</option>
            {VENEZUELA_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.estado && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.estado.message}</p>
          )}
        </div>

        {/* Contacto */}
        <div className="space-y-1">
          <Label htmlFor="contacto" className="text-xs font-semibold">
            Contacto del Punto / Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contacto"
            placeholder="Ej: +58 412-5551122 o @usuario"
            className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800"
            {...register("contacto")}
          />
          {errors.contacto && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.contacto.message}</p>
          )}
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-1">
        <Label htmlFor="direccion" className="text-xs font-semibold">
          Dirección Exacta del Centro <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="direccion"
          placeholder="Ej: Avenida principal de Altamira, Edificio Don Bosco, Planta Baja (frente a la plaza)..."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800 min-h-[60px] resize-none"
          {...register("direccion")}
        />
        {errors.direccion && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.direccion.message}</p>
        )}
      </div>

      {/* Necesidades prioritarias */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">
          Necesidades Prioritarias <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIAS_NECESIDADES.map((need) => {
            const isChecked = selectedNeeds.includes(need);
            return (
              <button
                key={need}
                type="button"
                onClick={() => toggleNeed(need)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all ${
                  isChecked
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                  isChecked ? "bg-blue-500 border-blue-600 text-white" : "border-neutral-350 dark:border-neutral-700"
                }`}>
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <span>{need}</span>
              </button>
            );
          })}
        </div>
        {needsError && (
          <p className="text-[10px] text-red-500 font-semibold">{needsError}</p>
        )}
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
          className="w-full sm:w-auto h-11 sm:h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
              Guardando...
            </>
          ) : (
            "Registrar Punto"
          )}
        </Button>
      </div>
    </form>
  );
}
