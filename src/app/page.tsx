"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MapPin, Users, CheckCircle2, ShieldAlert, Phone, Search, ChevronRight } from "lucide-react";
import { MapVenezuela } from "@/components/MapVenezuela";
import { MOCK_CENTROS, CentroAcopio } from "@/data/mockCentros";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RegisterMissingForm } from "@/components/RegisterMissingForm";
import { RegisterCentroForm } from "@/components/RegisterCentroForm";
import { PersonDetailModal } from "@/components/PersonDetailModal";
import { Footer } from "@/components/Footer";
import { MOCK_DESAPARECIDOS, PersonaDesaparecida } from "@/data/mockDesaparecidos";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

export default function Home() {
  const [activeView, setActiveView] = useState<'acopio' | 'personas'>('personas');
  const [scrolledPastNav, setScrolledPastNav] = useState(false);
  
  // Estados para Centros de Acopio
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>(
    isSupabaseConfigured ? [] : MOCK_CENTROS
  );
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCentroDialogOpen, setIsCentroDialogOpen] = useState(false);

  // Estados para Personas Desaparecidas
  const [desaparecidos, setDesaparecidos] = useState<PersonaDesaparecida[]>(
    isSupabaseConfigured ? [] : MOCK_DESAPARECIDOS
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonaDesaparecida | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [desaparecidosQuery, setDesaparecidosQuery] = useState("");
  const [desaparecidosState, setDesaparecidosState] = useState<string>("");
  const [desaparecidosStatus, setDesaparecidosStatus] = useState<string>("Todos");
  const [hasCheckedUrlParam, setHasCheckedUrlParam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  // Conteos reales desde Supabase (independientes del limit)
  const [totalReportados, setTotalReportados] = useState(0);
  const [totalSinContacto, setTotalSinContacto] = useState(0);
  const [totalASalvo, setTotalASalvo] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Efecto para monitorear el scroll en mobile e inicializar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(15);
      } else {
        setItemsPerPage(20);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [desaparecidosQuery, desaparecidosState, desaparecidosStatus]);

  // Efecto para monitorear el scroll en mobile
  useEffect(() => {
    const handleScroll = () => {
      // En mobile, el primer botón de navegación se sobrepasa alrededor de 140px
      setScrolledPastNav(window.scrollY > 140);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efecto para abrir la ficha de una persona si viene el ID en la URL al cargar
  useEffect(() => {
    if (hasCheckedUrlParam) return;

    const searchParams = new URLSearchParams(window.location.search);
    const personaId = searchParams.get("persona");
    if (!personaId) {
      setHasCheckedUrlParam(true);
      return;
    }

    // Buscar localmente primero
    const localFound = desaparecidos.find((p) => p.id.startsWith(personaId) || p.id === personaId);
    if (localFound) {
      setSelectedPerson(localFound);
      setIsDetailOpen(true);
      setActiveView("personas");
      setHasCheckedUrlParam(true);
    } else if (isSupabaseConfigured) {
      const fetchPersona = async () => {
        try {
          let data = null;
          if (personaId.length === 36) {
            const { data: resData, error } = await supabase!
              .from("personas_desaparecidas")
              .select("*, reportes_informacion(*)")
              .eq("id", personaId)
              .single();
            if (error) throw error;
            data = resData;
          } else {
            const { data: resList, error } = await supabase!
              .from("personas_desaparecidas")
              .select("*, reportes_informacion(*)");
            if (error) throw error;
            data = resList?.find((p: any) => p.id.startsWith(personaId));
          }

          if (data) {
            const record: PersonaDesaparecida = {
              id: data.id,
              nombreCompleto: data.nombre_completo,
              cedula: data.cedula,
              edad: data.edad,
              ultimoVistoEstado: data.ultimo_visto_estado,
              ultimoVistoDetalles: data.ultimo_visto_detalles,
              fechaContactoPerdido: data.fecha_contacto_perdido,
              fotoUrl: data.foto_url,
              informanteNombre: data.informante_nombre,
              informanteTelefono: data.informante_telefono,
              informanteEmail: data.informante_email,
              estatus: data.estatus,
              creadoEn: data.creado_en,
              reportes: (data.reportes_informacion || []).map((r: any) => ({
                id: r.id,
                autorNombre: r.autor_nombre,
                autorTelefono: r.autor_telefono,
                mensaje: r.mensaje,
                fecha: r.fecha
              })).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            };
            setSelectedPerson(record);
            setIsDetailOpen(true);
            setActiveView("personas");
          }
        } catch (err) {
          console.error("Error al obtener persona del link:", err);
        } finally {
          setHasCheckedUrlParam(true);
        }
      };
      fetchPersona();
    } else {
      setHasCheckedUrlParam(true);
    }
  }, [desaparecidos, isSupabaseConfigured, hasCheckedUrlParam]);

  // Efecto para sincronizar el estado del modal con los parámetros de búsqueda de la URL
  useEffect(() => {
    if (isDetailOpen && selectedPerson) {
      const shortId = selectedPerson.id.length === 36 ? selectedPerson.id.substring(0, 8) : selectedPerson.id;
      const newUrl = `${window.location.origin}${window.location.pathname}?persona=${shortId}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    } else if (!isDetailOpen) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("persona")) {
        const newUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
  }, [isDetailOpen, selectedPerson]);

  // Efecto para cargar datos en tiempo real si Supabase está configurado
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadData() {
      try {
        // Cargar centros de acopio
        const { data: centrosData, error: centrosError } = await supabase!
          .from("centros_acopio")
          .select("*")
          .order("creado_en", { ascending: false });

        if (centrosError) throw centrosError;
        if (centrosData) {
          setCentrosAcopio(centrosData.map((c: any) => ({
            id: c.id,
            nombre: c.nombre,
            estado: c.estado,
            direccion: c.direccion,
            contacto: c.contacto,
            necesidades: ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
            verificado: c.verificado
          })));
        }

        // Obtener conteos reales usando count (sin límite de 1000 filas)
        const [{ count: total }, { count: sinContacto }, { count: aSalvo }] = await Promise.all([
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }),
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }).eq("estatus", "Desaparecido"),
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }).eq("estatus", "Localizado"),
        ]);
        setTotalReportados(total ?? 0);
        setTotalSinContacto(sinContacto ?? 0);
        setTotalASalvo(aSalvo ?? 0);
      } catch (err) {
        console.error("Error cargando datos de Supabase:", err);
      }
    }

    loadData();
  }, []);

  // Cargar página actual de personas con filtros aplicados (server-side)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadPersonasPage() {
      try {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase!
          .from("personas_desaparecidas")
          .select("*, reportes_informacion(*)", { count: "exact" })
          .order("creado_en", { ascending: false })
          .range(from, to);

        if (desaparecidosStatus !== "Todos") {
          query = query.eq("estatus", desaparecidosStatus);
        }
        if (desaparecidosState) {
          query = query.eq("ultimo_visto_estado", desaparecidosState);
        }
        if (desaparecidosQuery.trim()) {
          query = query.ilike("nombre_completo", `%${desaparecidosQuery.trim()}%`);
        }

        const { data: personasData, error: personasError, count } = await query;

        if (personasError) throw personasError;
        if (personasData) {
          const mapped: PersonaDesaparecida[] = personasData.map((p: any) => ({
            id: p.id,
            nombreCompleto: p.nombre_completo,
            cedula: p.cedula,
            edad: p.edad,
            ultimoVistoEstado: p.ultimo_visto_estado,
            ultimoVistoDetalles: p.ultimo_visto_detalles,
            fechaContactoPerdido: p.fecha_contacto_perdido,
            fotoUrl: p.foto_url,
            informanteNombre: p.informante_nombre,
            informanteTelefono: p.informante_telefono,
            informanteEmail: p.informante_email,
            estatus: p.estatus,
            creadoEn: p.creado_en,
            reportes: (p.reportes_informacion || []).map((r: any) => ({
              id: r.id,
              autorNombre: r.autor_nombre,
              autorTelefono: r.autor_telefono,
              mensaje: r.mensaje,
              fecha: r.fecha
            })).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          }));
          setDesaparecidos(mapped);
          setTotalFiltered(count ?? 0);
        }
      } catch (err) {
        console.error("Error cargando personas:", err);
      }
    }

    loadPersonasPage();
  }, [currentPage, itemsPerPage, desaparecidosQuery, desaparecidosState, desaparecidosStatus]);

  // Filtrar centros de acopio
  const filteredCentros = centrosAcopio.filter((centro) => {
    const matchesState = selectedState ? centro.estado === selectedState : true;
    const matchesSearch =
      centro.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centro.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      centro.necesidades.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesSearch;
  });

  // Filtrar personas desaparecidas
  const filteredDesaparecidos = desaparecidos.filter((p) => {
    const matchesSearch =
      p.nombreCompleto.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
      p.ultimoVistoDetalles.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
      (p.cedula && p.cedula.toLowerCase().includes(desaparecidosQuery.toLowerCase()));
    const matchesState = desaparecidosState ? p.ultimoVistoEstado === desaparecidosState : true;
    const matchesStatus =
      desaparecidosStatus === "Todos"
        ? true
        : desaparecidosStatus === "Desaparecido"
        ? p.estatus === "Desaparecido"
        : p.estatus === "Localizado";
    return matchesSearch && matchesState && matchesStatus;
  });

  // Con paginación server-side, los datos ya vienen filtrados y paginados
  const paginatedDesaparecidos = isSupabaseConfigured ? desaparecidos : (() => {
    const filtered = desaparecidos.filter((p) => {
      const matchesSearch =
        p.nombreCompleto.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
        p.ultimoVistoDetalles.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
        (p.cedula && p.cedula.toLowerCase().includes(desaparecidosQuery.toLowerCase()));
      const matchesState = desaparecidosState ? p.ultimoVistoEstado === desaparecidosState : true;
      const matchesStatus =
        desaparecidosStatus === "Todos" ? true
        : desaparecidosStatus === "Desaparecido" ? p.estatus === "Desaparecido"
        : p.estatus === "Localizado";
      return matchesSearch && matchesState && matchesStatus;
    });
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  })();

  const effectiveTotalFiltered = isSupabaseConfigured ? totalFiltered : (() => {
    return desaparecidos.filter((p) => {
      const matchesSearch =
        p.nombreCompleto.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
        p.ultimoVistoDetalles.toLowerCase().includes(desaparecidosQuery.toLowerCase()) ||
        (p.cedula && p.cedula.toLowerCase().includes(desaparecidosQuery.toLowerCase()));
      const matchesState = desaparecidosState ? p.ultimoVistoEstado === desaparecidosState : true;
      const matchesStatus =
        desaparecidosStatus === "Todos" ? true
        : desaparecidosStatus === "Desaparecido" ? p.estatus === "Desaparecido"
        : p.estatus === "Localizado";
      return matchesSearch && matchesState && matchesStatus;
    }).length;
  })();

  const totalPages = Math.ceil(effectiveTotalFiltered / itemsPerPage);

  // Stats locales (modo demo sin Supabase)
  const localTotalReportados = isSupabaseConfigured ? totalReportados : 0;
  const localTotalSinContacto = isSupabaseConfigured ? totalSinContacto : 0;
  const localTotalASalvo = isSupabaseConfigured ? totalASalvo : 0;

  const handleRegisterCentroSuccess = async (newCentro: Omit<CentroAcopio, "id" | "verificado">) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase!
          .from("centros_acopio")
          .insert([{
            nombre: newCentro.nombre,
            estado: newCentro.estado,
            direccion: newCentro.direccion,
            contacto: newCentro.contacto,
            necesidades: newCentro.necesidades,
            verificado: false
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const record: CentroAcopio = {
            id: data.id,
            nombre: data.nombre,
            estado: data.estado,
            direccion: data.direccion,
            contacto: data.contacto,
            necesidades: data.necesidades,
            verificado: data.verificado
          };
          setCentrosAcopio((prev) => [record, ...prev]);
        }
      } catch (err) {
        console.error("Error insertando centro de acopio en Supabase:", err);
      }
    } else {
      const record: CentroAcopio = {
        ...newCentro,
        id: `c-${Date.now()}`,
        verificado: false
      };
      setCentrosAcopio((prev) => [record, ...prev]);
    }
  };

  const handleRegisterSuccess = async (newPerson: Omit<PersonaDesaparecida, "id" | "creadoEn">) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase!
          .from("personas_desaparecidas")
          .insert([{
            nombre_completo: newPerson.nombreCompleto,
            cedula: newPerson.cedula,
            edad: newPerson.edad,
            ultimo_visto_estado: newPerson.ultimoVistoEstado,
            ultimo_visto_detalles: newPerson.ultimoVistoDetalles,
            fecha_contacto_perdido: newPerson.fechaContactoPerdido,
            foto_url: newPerson.fotoUrl,
            informante_nombre: newPerson.informanteNombre,
            informante_telefono: newPerson.informanteTelefono,
            informante_email: newPerson.informanteEmail,
            estatus: newPerson.estatus
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const record: PersonaDesaparecida = {
            id: data.id,
            nombreCompleto: data.nombre_completo,
            cedula: data.cedula,
            edad: data.edad,
            ultimoVistoEstado: data.ultimo_visto_estado,
            ultimoVistoDetalles: data.ultimo_visto_detalles,
            fechaContactoPerdido: data.fecha_contacto_perdido,
            fotoUrl: data.foto_url,
            informanteNombre: data.informante_nombre,
            informanteTelefono: data.informante_telefono,
            informanteEmail: data.informante_email,
            estatus: data.estatus,
            creadoEn: data.creado_en,
            reportes: []
          };
          setDesaparecidos((prev) => [record, ...prev]);
        }
      } catch (err) {
        console.error("Error insertando en Supabase:", err);
      }
    } else {
      const record: PersonaDesaparecida = {
        ...newPerson,
        id: `d-${Date.now()}`,
        creadoEn: new Date().toISOString(),
        reportes: []
      };
      setDesaparecidos((prev) => [record, ...prev]);
    }
  };

  const handleMarkAsFound = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase!
          .from("personas_desaparecidas")
          .update({ estatus: "Localizado" })
          .eq("id", id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Error al actualizar estatus en Supabase:", err);
      }
    }

    setDesaparecidos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, estatus: "Localizado" as const };
          if (selectedPerson && selectedPerson.id === id) {
            setSelectedPerson(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleAddReport = async (
    personId: string,
    report: { autorNombre: string; autorTelefono: string | null; mensaje: string }
  ) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase!
          .from("reportes_informacion")
          .insert([{
            persona_id: personId,
            autor_nombre: report.autorNombre,
            autor_telefono: report.autorTelefono,
            mensaje: report.mensaje
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newReport = {
            id: data.id,
            autorNombre: data.autor_nombre,
            autorTelefono: data.autor_telefono,
            mensaje: data.mensaje,
            fecha: data.fecha
          };
          setDesaparecidos((prev) =>
            prev.map((p) => {
              if (p.id === personId) {
                const updated = {
                  ...p,
                  reportes: [newReport, ...p.reportes]
                };
                if (selectedPerson && selectedPerson.id === personId) {
                  setSelectedPerson(updated);
                }
                return updated;
              }
              return p;
            })
          );
        }
      } catch (err) {
        console.error("Error al guardar reporte en Supabase:", err);
      }
    } else {
      const newReport = {
        ...report,
        id: `rep-${Date.now()}`,
        fecha: new Date().toISOString()
      };
      setDesaparecidos((prev) =>
        prev.map((p) => {
          if (p.id === personId) {
            const updated = {
              ...p,
              reportes: [newReport, ...p.reportes]
            };
            if (selectedPerson && selectedPerson.id === personId) {
              setSelectedPerson(updated);
            }
            return updated;
          }
          return p;
        })
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans transition-colors duration-300">
      <Header
        scrolledPastNav={scrolledPastNav}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Botones de navegación (Antes del Hero) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mx-auto">
          
          {/* Primer botón (Secondary) - Centros de Acopio */}
          <button
            onClick={() => setActiveView('acopio')}
            className={`group relative flex items-start gap-4 p-6 rounded-2xl border border-white text-left transition-all duration-300 cursor-pointer bg-neutral-900 text-white shadow-md ${
              activeView === 'acopio'
                ? 'ring-2 ring-neutral-400 dark:ring-white/40 shadow-[0_0_25px_rgba(255,255,255,0.15)] scale-[1.02]'
                : 'hover:border-neutral-300 hover:scale-[1.01]'
            }`}
          >
            <div className="p-3 rounded-xl bg-white text-black transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                Información de Ayuda
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Centros de acopio
              </h3>
              <p className="text-neutral-200 text-xs md:text-sm mt-1.5 leading-relaxed">
                Encuentra y registra centros de acopios cerca de tu zona
              </p>
            </div>
            {activeView === 'acopio' && (
              <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Segundo botón (Primary) - Personas Desaparecidas */}
          <button
            onClick={() => setActiveView('personas')}
            className={`group relative flex items-start gap-4 p-6 rounded-2xl border border-red-500 text-left transition-all duration-300 cursor-pointer bg-red-600 text-white shadow-md ${
              activeView === 'personas'
                ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-neutral-950 dark:ring-offset-neutral-900 shadow-[0_0_25px_rgba(239,68,68,0.25)] scale-[1.02]'
                : 'hover:border-red-400 hover:scale-[1.01]'
            }`}
          >
            <div className="p-3 rounded-xl bg-white text-red-600 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-red-200 uppercase tracking-wider">
                Prioridad Crítica
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Personas
              </h3>
              <p className="text-red-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Encuentra y registra personas desaparecidas
              </p>
            </div>
            {activeView === 'personas' && (
              <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-white animate-ping" />
            )}
          </button>

        </div>

        {/* Sección de Contenido Activo */}
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 mt-4">
          {activeView === 'acopio' ? (
            <div className="space-y-6">
              {/* Encabezado Centros de Acopio */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20">
                    Logística y Donaciones
                  </span>
                  <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-neutral-900 dark:text-white leading-none">
                    Red Nacional de <span className="text-blue-600 dark:text-blue-400">Centros de Acopio</span>
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mt-1">
                    Usa el mapa interactivo de Venezuela o el buscador para localizar los puntos autorizados de recolección de agua, alimentos, medicinas y ropa en tu estado.
                  </p>
                </div>
                
                {/* Botón de acción rápido (Triggeará el Modal) */}
                <Dialog open={isCentroDialogOpen} onOpenChange={setIsCentroDialogOpen}>
                  <DialogTrigger render={
                    <button className="w-full md:w-auto h-12 md:h-10 px-5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-base md:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border border-white/10 dark:border-black/10 shadow-sm cursor-pointer whitespace-nowrap">
                      Registrar Punto de Acopio
                    </button>
                  } />
                  <DialogContent className="sm:max-w-lg w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold font-heading text-neutral-900 dark:text-white">
                        Registrar Punto de Acopio
                      </DialogTitle>
                      <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-450">
                        Ingresa los datos del centro de acopio para que las personas necesitadas puedan ubicarlo y donar insumos.
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterCentroForm
                      onSuccess={handleRegisterCentroSuccess}
                      onClose={() => setIsCentroDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Mapa Interactivo de Venezuela */}
              <MapVenezuela
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />

              {/* Filtro y Buscador */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-colors duration-300">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, dirección o insumo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {selectedState ? (
                    <span>
                      Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en <strong>{selectedState}</strong>
                    </span>
                  ) : (
                    <span>
                      Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en todo el país
                    </span>
                  )}
                </div>
              </div>

              {/* Listado de Centros de Acopio */}
              {filteredCentros.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCentros.map((centro) => (
                    <div
                      key={centro.id}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700/85 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-sm duration-300"
                    >
                      <div className="space-y-2">
                        {/* Cabecera del Centro */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-neutral-900 dark:text-white font-heading leading-tight">
                            {centro.nombre}
                          </h4>
                          {centro.verificado ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              Verificado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 shrink-0">
                              <ShieldAlert className="h-3 w-3" />
                              Por Verificar
                            </span>
                          )}
                        </div>

                        {/* Ubicación */}
                        <div className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-neutral-800 dark:text-neutral-200">{centro.estado}</strong> — {centro.direccion}
                          </span>
                        </div>

                        {/* Contacto */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                          <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                          <span>{centro.contacto}</span>
                        </div>
                      </div>

                      {/* Insumos solicitados */}
                      <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                        <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                          Necesidades Urgentes
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {centro.necesidades.map((necesidad, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/20"
                            >
                              {necesidad}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                    No se encontraron centros de acopio que coincidan con los filtros aplicados.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado Personas Desaparecidas con Estadísticas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200 dark:border-neutral-800 pb-6">
                {/* Lado izquierdo: Título y Estadísticas */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold tracking-wider text-red-500 uppercase px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20">
                      Emergencia Colectiva
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-neutral-900 dark:text-white leading-none font-sans">
                      Búsqueda y Reporte de <span className="text-red-500">Personas Sin Contacto</span>
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mt-1">
                      Directorio solidario de búsqueda en tiempo real. Si no logras comunicarte con un familiar tras el terremoto, puedes registrar sus datos y foto para coordinar su búsqueda.
                    </p>
                  </div>

                  {/* Tarjetas de estadísticas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl flex flex-col justify-center text-center sm:text-left shadow-xs">
                      <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{localTotalReportados.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mt-2">Personas Reportadas</span>
                    </div>
                    <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex flex-col justify-center text-center sm:text-left shadow-xs">
                      <span className="text-3xl font-black text-red-650 dark:text-red-400 leading-none">{localTotalSinContacto.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-red-500 dark:text-red-450 uppercase tracking-wider mt-2">Aún Sin Contacto</span>
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-4 rounded-xl flex flex-col justify-center text-center sm:text-left shadow-xs">
                      <span className="text-3xl font-black text-green-650 dark:text-green-400 leading-none">{localTotalASalvo.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-450 uppercase tracking-wider mt-2">Localizados A Salvo</span>
                    </div>
                  </div>
                </div>

                {/* Lado derecho: Botón grande y texto informativo */}
                <div className="lg:col-span-4 flex flex-col gap-3 w-full lg:items-end justify-end h-full">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger render={
                      <button className="w-full h-16 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base md:text-lg shadow-md hover:shadow-red-650/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider">
                        Reportar Desaparecido
                      </button>
                    } />
                    <DialogContent className="sm:max-w-lg w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold font-heading text-neutral-900 dark:text-white">
                          Registrar Persona Sin Contacto
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-450">
                          Ingresa los datos de tu familiar o amigo para que otros voluntarios e instituciones puedan colaborar en su localización.
                        </DialogDescription>
                      </DialogHeader>
                      <RegisterMissingForm
                        onSuccess={handleRegisterSuccess}
                        onClose={() => setIsDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-colors duration-300">
                
                {/* Buscador de Texto */}
                <div className="sm:col-span-6 relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={desaparecidosQuery}
                    onChange={(e) => setDesaparecidosQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>

                {/* Filtro por Estado */}
                <div className="sm:col-span-3">
                  <select
                    value={desaparecidosState}
                    onChange={(e) => setDesaparecidosState(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Todos los estados</option>
                    {VENEZUELA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Estatus (Tabs) */}
                <div className="sm:col-span-3 flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 h-[38px]">
                  {["Todos", "Desaparecido", "Localizado"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setDesaparecidosStatus(status)}
                      className={`flex-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-1.5 ${
                        desaparecidosStatus === status
                          ? "bg-white dark:bg-neutral-900 text-red-650 dark:text-white text-red-600 shadow-sm border border-neutral-200 dark:border-neutral-800/40"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350"
                      }`}
                    >
                      {status === "Todos" ? "Todos" : status === "Desaparecido" ? "Sin Contacto" : "A Salvo"}
                    </button>
                  ))}
                </div>

              </div>

              {/* Listado de Personas */}
              {paginatedDesaparecidos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedDesaparecidos.map((persona) => {
                    const isDesaparecido = persona.estatus === "Desaparecido";
                    const initials = persona.nombreCompleto
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          setSelectedPerson(persona);
                          setIsDetailOpen(true);
                        }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-750 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group/card"
                      >
                        {/* Cabecera / Foto */}
                        <div className="relative h-80 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-800/50 overflow-hidden">
                          {persona.fotoUrl ? (
                            <img
                              src={persona.fotoUrl}
                              alt={persona.nombreCompleto}
                              className="h-full w-full object-contain transition-transform duration-550 group-hover/card:scale-105"
                            />
                          ) : (
                            <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black tracking-wider transition-transform duration-550 group-hover/card:scale-105 ${
                              isDesaparecido 
                                ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-500/20"
                                : "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-500/20"
                            }`}>
                              {initials}
                            </div>
                          )}

                          {/* Badge de Estatus */}
                          <span className={`absolute top-3 right-3 flex items-center gap-1 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm border ${
                            isDesaparecido
                              ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                              : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isDesaparecido ? "bg-red-500 animate-pulse" : "bg-green-500"
                            }`} />
                            {isDesaparecido ? "Sin Contacto" : "A Salvo"}
                          </span>
                        </div>

                        {/* Contenido principal */}
                        <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-base font-bold text-neutral-900 dark:text-white font-heading leading-tight truncate transition-colors group-hover/card:text-red-600 dark:group-hover/card:text-red-400">
                                {persona.nombreCompleto}
                              </h4>
                              {persona.cedula && (
                                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block mt-0.5">
                                  C.I.: {persona.cedula}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-450 font-medium">
                              <span>Edad: <strong>{persona.edad} años</strong></span>
                              <span>•</span>
                              <span>Último visto: <strong>{persona.fechaContactoPerdido}</strong></span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-450 line-clamp-3 leading-relaxed">
                              <strong className="text-neutral-850 dark:text-neutral-300">{persona.ultimoVistoEstado}:</strong> {persona.ultimoVistoDetalles}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                            {/* Datos del informante */}
                            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal space-y-0.5">
                              <span className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1">
                                Reportado Por:
                              </span>
                              <div className="font-semibold text-neutral-900 dark:text-white">
                                {persona.informanteNombre}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-neutral-450 dark:text-neutral-500 shrink-0" />
                                <span>{persona.informanteTelefono}</span>
                              </div>
                              {persona.informanteEmail && (
                                <div className="text-[10px] text-neutral-500 dark:text-neutral-550 truncate pl-4.5">
                                  {persona.informanteEmail}
                                </div>
                              )}
                            </div>

                            {/* Botón CTA para ver la información de la persona */}
                            <button
                              className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                            >
                              <span>Ver Información Completa</span>
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover/card:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-450 px-2">
                      Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                    No se encontraron reportes que coincidan con la búsqueda.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Detalle de Persona */}
        <PersonDetailModal
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          persona={selectedPerson}
          onMarkAsFound={handleMarkAsFound}
          onAddReport={handleAddReport}
        />

      </main>
      <Footer />
    </div>
  );
}
