"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  razon: z.enum(["inactivo", "lleno", "informacion_incorrecta", "spam", "otro"]),
  detalles: z.string().min(10, "Describe los detalles (mínimo 10 caracteres)"),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportCentroFormProps {
  centroId: string;
  centroNombre: string;
  onSuccess: (values: { razon: string; detalles: string }) => void;
  onClose: () => void;
}

export function ReportCentroForm({
  centroId,
  centroNombre,
  onSuccess,
  onClose
}: ReportCentroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      razon: undefined,
      detalles: "",
    }
  });

  const watchRazon = watch("razon");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSuccess({
      razon: values.razon,
      detalles: values.detalles,
    });

    setIsSubmitting(false);
    onClose();
  };

  const razonesInfo = [
    { value: "inactivo", label: "Inactivo / No funciona" },
    { value: "lleno", label: "Capacidad máxima (Lleno)" },
    { value: "informacion_incorrecta", label: "Información incorrecta / desactualizada" },
    { value: "spam", label: "Contenido falso / Spam" },
    { value: "otro", label: "Otro motivo" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1">
        <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Centro a Reportar</span>
        <p className="text-xs md:text-sm font-bold text-neutral-800 dark:text-neutral-200">
          {centroNombre}
        </p>
      </div>

      {/* Razón */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Motivo del Reporte <span className="text-red-500">*</span></Label>
        <div className="flex flex-col gap-2">
          {razonesInfo.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setValue("razon", item.value as any)}
              className={`w-full py-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                watchRazon === item.value
                  ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-600 dark:text-red-400 font-bold"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-450 hover:bg-neutral-50 dark:hover:bg-neutral-850"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {errors.razon && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.razon.message}</p>
        )}
      </div>

      {/* Detalles */}
      <div className="space-y-1">
        <Label htmlFor="detalles" className="text-xs font-semibold">
          Detalles de la Irregularidad <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="detalles"
          placeholder="Ej: Fui a donar y el lugar se encuentra cerrado o no están recibiendo más alimentos porque la capacidad está llena..."
          className="text-xs md:text-sm rounded-lg border-neutral-200 dark:border-neutral-800 min-h-[80px] resize-none"
          {...register("detalles")}
        />
        {errors.detalles && (
          <p className="text-[10px] text-red-500 font-semibold">{errors.detalles.message}</p>
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
          className="w-full sm:w-auto h-11 sm:h-9 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-xs font-bold rounded-xl cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
              Enviando Reporte...
            </>
          ) : (
            "Enviar Reporte"
          )}
        </Button>
      </div>
    </form>
  );
}
