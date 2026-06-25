export interface ReporteInformacion {
  id: string;
  autorNombre: string;
  autorTelefono: string | null;
  mensaje: string;
  fecha: string;
}

export interface PersonaDesaparecida {
  id: string;
  nombreCompleto: string;
  cedula: string | null; // Cédula de Identidad de Venezuela (Ej: V-12.345.678)
  edad: number;
  ultimoVistoEstado: string;
  ultimoVistoDetalles: string;
  fechaContactoPerdido: string;
  fotoUrl: string | null;
  informanteNombre: string;
  informanteTelefono: string;
  informanteEmail: string | null;
  estatus: "Desaparecido" | "Localizado";
  creadoEn: string;
  reportes: ReporteInformacion[];
}

export const MOCK_DESAPARECIDOS: PersonaDesaparecida[] = [
  {
    id: "d1",
    nombreCompleto: "Alejandro Ramón Rivas Ortega",
    cedula: "V-18.452.124",
    edad: 34,
    ultimoVistoEstado: "Distrito Capital",
    ultimoVistoDetalles: "Saliendo de su oficina en Plaza Venezuela justo antes del sismo. Vestía camisa azul celeste y pantalón gris.",
    fechaContactoPerdido: "2026-06-24",
    fotoUrl: null, // Se renderizará un avatar con sus iniciales si no hay foto
    informanteNombre: "María Rivas",
    informanteTelefono: "+58 412-1112233",
    informanteEmail: "maria.rivas@outlook.com",
    estatus: "Desaparecido",
    creadoEn: "2026-06-25T01:00:00Z",
    reportes: [
      {
        id: "rep-1",
        autorNombre: "Carlos Dávila",
        autorTelefono: "+58 412-5556677",
        mensaje: "Lo vi cerca de la Plaza Bolívar de Chacao comprando agua en un kiosco. Parecía estar bien físicamente, pero desorientado.",
        fecha: "2026-06-24T22:30:00Z"
      }
    ]
  },
  {
    id: "d2",
    nombreCompleto: "Gabriela Sofía Méndez Lugo",
    cedula: "V-29.854.632",
    edad: 22,
    ultimoVistoEstado: "Aragua",
    ultimoVistoDetalles: "En el sector El Limón de Maracay. Iba camino a la universidad. Estatura: 1.65m, cabello castaño largo.",
    fechaContactoPerdido: "2026-06-24",
    fotoUrl: null,
    informanteNombre: "Carlos Méndez",
    informanteTelefono: "+58 414-4445566",
    informanteEmail: "carlos.mendez99@gmail.com",
    estatus: "Desaparecido",
    creadoEn: "2026-06-25T01:15:00Z",
    reportes: []
  },
  {
    id: "d3",
    nombreCompleto: "Jesús Eduardo Castillo",
    cedula: "V-5.234.897",
    edad: 68,
    ultimoVistoEstado: "Miranda",
    ultimoVistoDetalles: "Cerca del centro comercial La Casona en San Antonio de los Altos. Padece de hipertensión ligera.",
    fechaContactoPerdido: "2026-06-24",
    fotoUrl: null,
    informanteNombre: "Laura Castillo",
    informanteTelefono: "+58 424-7778899",
    informanteEmail: "laura_castillo@hotmail.com",
    estatus: "Desaparecido",
    creadoEn: "2026-06-25T02:00:00Z",
    reportes: []
  },
  {
    id: "d4",
    nombreCompleto: "Yusmeri Carolina Vargas",
    cedula: "V-24.152.987",
    edad: 29,
    ultimoVistoEstado: "La Guaira",
    ultimoVistoDetalles: "En la parroquia Caraballeda, sector Tanaguarena. Se encontraba cerca de la costa al momento del temblor.",
    fechaContactoPerdido: "2026-06-24",
    fotoUrl: null,
    informanteNombre: "José Vargas",
    informanteTelefono: "+58 416-2223344",
    informanteEmail: null,
    estatus: "Localizado", // Marcado como localizado para demostrar el estatus de éxito
    creadoEn: "2026-06-25T00:30:00Z",
    reportes: []
  },
  {
    id: "d5",
    nombreCompleto: "Manuel Vicente Silva",
    cedula: "V-14.785.412",
    edad: 45,
    ultimoVistoEstado: "Lara",
    ultimoVistoDetalles: "Sector Nueva Segovia en Barquisimeto. Iba conduciendo un camión Ford Tritón blanco.",
    fechaContactoPerdido: "2026-06-24",
    fotoUrl: null,
    informanteNombre: "Patricia de Silva",
    informanteTelefono: "+58 412-9990011",
    informanteEmail: "patty_silva@gmail.com",
    estatus: "Desaparecido",
    creadoEn: "2026-06-25T02:30:00Z",
    reportes: []
  }
];
