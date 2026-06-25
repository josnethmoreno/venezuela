export interface Mascota {
  id: string;
  nombre: string | null;
  especie: "Perro" | "Gato" | "Otro";
  raza: string | null;
  colorDetalles: string;
  ultimoVistoEstado: string;
  ultimoVistoDetalles: string;
  fechaContactoPerdido: string;
  fotoUrl: string | null;
  informanteNombre: string;
  informanteTelefono: string;
  informanteEmail: string | null;
  estatus: "Perdido" | "Encontrado" | "A Salvo";
  creadoEn: string;
}

export const MOCK_MASCOTAS: Mascota[] = [];
