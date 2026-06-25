export interface CentroAcopio {
  id: string;
  nombre: string;
  estado: string;
  direccion: string;
  contacto: string;
  necesidades: string[];
  verificado: boolean;
}

export const MOCK_CENTROS: CentroAcopio[] = [
  {
    id: "1",
    nombre: "Universidad Central de Venezuela (UCV) - Rectorado",
    estado: "Distrito Capital",
    direccion: "Caracas - Plaza del Rectorado, frente a las canchas de tenis de la UCV.",
    contacto: "FCU UCV (@FCU_UCV)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "2",
    nombre: "Cruz Roja Venezolana - Sede Nacional",
    estado: "Distrito Capital",
    direccion: "Caracas - Av. Andrés Bello, Edif. Sede Central, La Candelaria.",
    contacto: "Cruz Roja (@CruzRojaVe)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "3",
    nombre: "Universidad Simón Bolívar (USB) - Sartenejas",
    estado: "Miranda",
    direccion: "Sartenejas - Planta baja del Pabellón de Materiales, Baruta.",
    contacto: "Bomberos USB (+58 212-9063100)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "4",
    nombre: "Bomberos de Maracay - Estación Central",
    estado: "Aragua",
    direccion: "Maracay - Av. Constitución, cruce con Calle Carabobo.",
    contacto: "Bomberos de Aragua (+58 243-2320011)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "5",
    nombre: "Cruz Roja Venezolana - Filial Valencia",
    estado: "Carabobo",
    direccion: "Valencia - Calle López Latouche, Urb. Prebo (Hospital Tipo II Luis Blanco Gasperi).",
    contacto: "Cruz Roja Valencia (+58 241-8256436)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "6",
    nombre: "Cuerpo de Bomberos del Municipio Iribarren",
    estado: "Lara",
    direccion: "Barquisimeto - Estación Central, Av. Carabobo con Carrera 30.",
    contacto: "Bomberos Iribarren (+58 251-2314475)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "7",
    nombre: "Cuerpo de Bomberos del Estado Anzoátegui",
    estado: "Anzoátegui",
    direccion: "Barcelona - Av. Argimiro Gabaldón, Zona Industrial Los Montones.",
    contacto: "Bomberos Anzoátegui (+58 281-2741700)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "8",
    nombre: "Protección Civil Caroní - Sede Puerto Ordaz",
    estado: "Bolívar",
    direccion: "Puerto Ordaz - Sede PC, Sector Castillito (frente a las canchas).",
    contacto: "PC Caroní (+58 286-9314455)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "9",
    nombre: "Protección Civil Táchira - Sede Principal",
    estado: "Táchira",
    direccion: "San Cristóbal - Av. 19 de Abril, Edif. Protección Civil.",
    contacto: "PC Táchira (@PCivilTachira)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "10",
    nombre: "Cuerpo de Bomberos de Maracaibo - Sede Santa Rita",
    estado: "Zulia",
    direccion: "Maracaibo - Av. 8 (Santa Rita), Sede Central.",
    contacto: "Bomberos de Maracaibo (+58 261-7221133)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  },
  {
    id: "11",
    nombre: "Catedral de Barquisimeto",
    estado: "Lara",
    direccion: "Barquisimeto - Av. Venezuela con Calle 30.",
    contacto: "Cáritas Barquisimeto",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: false
  },
  {
    id: "12",
    nombre: "Cuerpo de Bomberos de Mérida - Estación Central",
    estado: "Mérida",
    direccion: "Mérida - Av. Humberto Tejera, sector Glorias Patrias.",
    contacto: "Bomberos Mérida (+58 274-2633333)",
    necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
    verificado: true
  }
];
