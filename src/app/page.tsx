"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MapPin, Users, CheckCircle2, ShieldAlert, Phone, Search, ChevronRight, PawPrint, Flag, Heart } from "lucide-react";
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
import { RegisterPetForm } from "@/components/RegisterPetForm";
import { PetDetailModal } from "@/components/PetDetailModal";
import { ReportCentroForm } from "@/components/ReportCentroForm";
import { Footer } from "@/components/Footer";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { MOCK_DESAPARECIDOS, PersonaDesaparecida } from "@/data/mockDesaparecidos";
import { Mascota, MOCK_MASCOTAS } from "@/data/mockMascotas";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón",
  "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta",
  "Portuguesa", "Sucre", "Táchira", "Trujillo", "La Guaira", "Yaracuy", "Zulia"
];

export default function Home() {
  const [activeView, setActiveView] = useState<'acopio' | 'mascotas'>('mascotas');
  const [scrolledPastNav, setScrolledPastNav] = useState(false);

  // Estados para Mascotas
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [petFormInitialStatus, setPetFormInitialStatus] = useState<"Perdido" | "Encontrado">("Perdido");
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);
  const [isPetDetailOpen, setIsPetDetailOpen] = useState(false);
  const [mascotasQuery, setMascotasQuery] = useState("");
  const [mascotasState, setMascotasState] = useState("");
  const [mascotasEspecie, setMascotasEspecie] = useState("Todos");
  const [mascotasStatus, setMascotasStatus] = useState("Todos");
  const [mascotasPage, setMascotasPage] = useState(1);
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [totalMascotasFiltered, setTotalMascotasFiltered] = useState(0);

  // Reportes de Centros de Acopio
  const [reportingCentro, setReportingCentro] = useState<{ id: string; nombre: string } | null>(null);
  const [isReportCentroOpen, setIsReportCentroOpen] = useState(false);
  
  // Estados para Centros de Acopio
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>(
    isSupabaseConfigured ? [] : MOCK_CENTROS
  );
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCentroDialogOpen, setIsCentroDialogOpen] = useState(false);
  const [isExtranjeroView, setIsExtranjeroView] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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

  // Efecto para abrir la ficha de una persona o mascota si viene el ID en la URL al cargar
  useEffect(() => {
    if (hasCheckedUrlParam) return;

    const searchParams = new URLSearchParams(window.location.search);
    const personaId = searchParams.get("persona");
    const mascotaId = searchParams.get("mascota");

    if (!personaId && !mascotaId) {
      setHasCheckedUrlParam(true);
      return;
    }

    if (personaId) {
      setHasCheckedUrlParam(true);
    } else if (mascotaId) {
      // Buscar localmente primero
      const localFound = mascotas.find(
        (m) =>
          m.id.startsWith(mascotaId) ||
          m.id === mascotaId ||
          (m.externalId && (m.externalId.startsWith(mascotaId) || m.externalId === mascotaId))
      );
      if (localFound) {
        setSelectedPet(localFound);
        setIsPetDetailOpen(true);
        setActiveView("mascotas");
        setHasCheckedUrlParam(true);
      } else if (isSupabaseConfigured) {
        const fetchMascota = async () => {
          try {
            let data = null;
            if (mascotaId.length === 36) {
              // Buscar primero por ID
              const { data: resData, error } = await supabase!
                .from("mascotas")
                .select("*")
                .eq("id", mascotaId)
                .maybeSingle();
              
              if (resData) {
                data = resData;
              } else {
                // Intentar buscar por external_id exacto
                const { data: resDataExt, error: extError } = await supabase!
                  .from("mascotas")
                  .select("*")
                  .eq("external_id", mascotaId)
                  .maybeSingle();
                data = resDataExt;
              }
            } else {
              // Si no es un UUID completo, listar ID y external_id de mascotas para buscar la coincidencia
              const { data: resList, error } = await supabase!
                .from("mascotas")
                .select("id, external_id");
              if (error) throw error;
              
              const matched = resList?.find(
                (m: any) =>
                  m.id.startsWith(mascotaId) ||
                  (m.external_id && m.external_id.startsWith(mascotaId))
              );
              
              if (matched) {
                const { data: fullRecord, error: fullError } = await supabase!
                  .from("mascotas")
                  .select("*")
                  .eq("id", matched.id)
                  .single();
                if (fullError) throw fullError;
                data = fullRecord;
              }
            }

            if (data) {
              const record: Mascota = {
                id: data.id,
                nombre: data.nombre,
                especie: data.especie,
                raza: data.raza,
                colorDetalles: data.color_detalles,
                ultimoVistoEstado: data.ultimo_visto_estado,
                ultimoVistoDetalles: data.ultimo_visto_detalles,
                fechaContactoPerdido: data.fecha_contacto_perdido,
                fotoUrl: data.foto_url,
                informanteNombre: data.informante_nombre,
                informanteTelefono: data.informante_telefono,
                informanteEmail: data.informante_email,
                estatus: data.estatus,
                creadoEn: data.creado_en,
                fuente: data.fuente,
                externalId: data.external_id,
                prioridad: data.prioridad
              };
              setSelectedPet(record);
              setIsPetDetailOpen(true);
              setActiveView("mascotas");
            }
          } catch (err) {
            console.error("Error al obtener mascota del link:", err);
          } finally {
            setHasCheckedUrlParam(true);
          }
        };
        fetchMascota();
      } else {
        setHasCheckedUrlParam(true);
      }
    }
  }, [desaparecidos, mascotas, isSupabaseConfigured, hasCheckedUrlParam]);

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

  // Efecto para sincronizar el estado del modal con los parámetros de búsqueda de la URL para mascotas
  useEffect(() => {
    if (isPetDetailOpen && selectedPet) {
      const shortId = selectedPet.id.length === 36 ? selectedPet.id.substring(0, 8) : selectedPet.id;
      const newUrl = `${window.location.origin}${window.location.pathname}?mascota=${shortId}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    } else if (!isPetDetailOpen) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("mascota")) {
        const newUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
  }, [isPetDetailOpen, selectedPet]);

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
            necesidades: c.necesidades && c.necesidades.length > 0 ? c.necesidades : ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
            verificado: c.verificado,
            pais: c.pais || "Venezuela",
            ciudad: c.ciudad || c.estado || ""
          })));
        }

        // Obtener conteos reales usando count (sin límite de 1000 filas)
        const [{ count: total }, { count: sinContacto }, { count: aSalvo }, { count: totalM }] = await Promise.all([
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }),
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }).eq("estatus", "Desaparecido"),
          supabase!.from("personas_desaparecidas").select("*", { count: "exact", head: true }).eq("estatus", "Localizado"),
          supabase!.from("mascotas").select("*", { count: "exact", head: true }),
        ]);
        setTotalReportados(total ?? 0);
        setTotalSinContacto(sinContacto ?? 0);
        setTotalASalvo(aSalvo ?? 0);
        setTotalMascotas(totalM ?? 0);
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
          .order("prioridad", { ascending: true })
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

  // Cargar página actual de mascotas con filtros aplicados (server-side)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Filtrado en memoria para modo DEMO
      const filtered = MOCK_MASCOTAS.filter((m) => {
        const matchesSearch = mascotasQuery.trim()
          ? m.colorDetalles.toLowerCase().includes(mascotasQuery.toLowerCase()) ||
            (m.nombre && m.nombre.toLowerCase().includes(mascotasQuery.toLowerCase())) ||
            m.ultimoVistoDetalles.toLowerCase().includes(mascotasQuery.toLowerCase())
          : true;
        const matchesState = mascotasState ? m.ultimoVistoEstado === mascotasState : true;
        const matchesStatus = mascotasStatus === "Todos" ? true : m.estatus === mascotasStatus;
        const matchesEspecie = mascotasEspecie === "Todos" ? true : m.especie === mascotasEspecie;
        return matchesSearch && matchesState && matchesStatus && matchesEspecie;
      });
      setMascotas(filtered.slice((mascotasPage - 1) * itemsPerPage, mascotasPage * itemsPerPage));
      setTotalMascotasFiltered(filtered.length);
      return;
    }

    async function loadMascotasPage() {
      try {
        const from = (mascotasPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase!
          .from("mascotas")
          .select("*", { count: "exact" })
          .order("prioridad", { ascending: true })
          .order("creado_en", { ascending: false })
          .range(from, to);

        if (mascotasStatus !== "Todos") {
          query = query.eq("estatus", mascotasStatus);
        }
        if (mascotasState) {
          query = query.eq("ultimo_visto_estado", mascotasState);
        }
        if (mascotasEspecie !== "Todos") {
          query = query.eq("especie", mascotasEspecie);
        }
        if (mascotasQuery.trim()) {
          query = query.or(`nombre.ilike.%${mascotasQuery.trim()}%,color_detalles.ilike.%${mascotasQuery.trim()}%,ultimo_visto_detalles.ilike.%${mascotasQuery.trim()}%`);
        }

        const { data: mascotasData, error: mascotasError, count } = await query;

        if (mascotasError) throw mascotasError;
        if (mascotasData) {
          const mapped: Mascota[] = mascotasData.map((m: any) => ({
            id: m.id,
            nombre: m.nombre,
            especie: m.especie,
            raza: m.raza,
            colorDetalles: m.color_detalles,
            ultimoVistoEstado: m.ultimo_visto_estado,
            ultimoVistoDetalles: m.ultimo_visto_detalles,
            fechaContactoPerdido: m.fecha_contacto_perdido,
            fotoUrl: m.foto_url,
            informanteNombre: m.informante_nombre,
            informanteTelefono: m.informante_telefono,
            informanteEmail: m.informante_email,
            estatus: m.estatus,
            creadoEn: m.creado_en,
            fuente: m.fuente,
            externalId: m.external_id,
            prioridad: m.prioridad
          }));
          setMascotas(mapped);
          setTotalMascotasFiltered(count ?? 0);
        }
      } catch (err) {
        console.error("Error cargando mascotas:", err);
      }
    }

    loadMascotasPage();
  }, [mascotasPage, itemsPerPage, mascotasQuery, mascotasState, mascotasStatus, mascotasEspecie]);


  // Filtrar centros de acopio
  const filteredCentros = centrosAcopio.filter((centro) => {
    const isVzla = !centro.pais || centro.pais.toLowerCase() === "venezuela";
    if (isExtranjeroView) {
      if (isVzla) return false;
      const matchesCountry = selectedCountry ? centro.pais === selectedCountry : true;
      const matchesCity = selectedCity ? centro.ciudad === selectedCity : true;
      const matchesSearch =
        centro.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.necesidades.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCountry && matchesCity && matchesSearch;
    } else {
      if (!isVzla) return false;
      const matchesState = selectedState ? centro.estado === selectedState : true;
      const matchesSearch =
        centro.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        centro.necesidades.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesState && matchesSearch;
    }
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
            verificado: false,
            pais: newCentro.pais || "Venezuela",
            ciudad: newCentro.ciudad || newCentro.estado
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
            necesidades: data.necesidades && data.necesidades.length > 0 ? data.necesidades : ["Agua Potable", "Alimentos no perecederos", "Medicinas y Primeros Auxilios", "Ropa y Cobijas", "Artículos de higiene personal"],
            verificado: data.verificado,
            pais: data.pais || "Venezuela",
            ciudad: data.ciudad || data.estado
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

  const handleRegisterPetSuccess = async (newPet: Omit<Mascota, "id" | "creadoEn">) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase!
          .from("mascotas")
          .insert([{
            nombre: newPet.nombre,
            especie: newPet.especie,
            raza: newPet.raza,
            color_detalles: newPet.colorDetalles,
            ultimo_visto_estado: newPet.ultimoVistoEstado,
            ultimo_visto_detalles: newPet.ultimoVistoDetalles,
            fecha_contacto_perdido: newPet.fechaContactoPerdido,
            foto_url: newPet.fotoUrl,
            informante_nombre: newPet.informanteNombre,
            informante_telefono: newPet.informanteTelefono,
            informante_email: newPet.informanteEmail,
            estatus: newPet.estatus
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const record: Mascota = {
            id: data.id,
            nombre: data.nombre,
            especie: data.especie,
            raza: data.raza,
            colorDetalles: data.color_detalles,
            ultimoVistoEstado: data.ultimo_visto_estado,
            ultimoVistoDetalles: data.ultimo_visto_detalles,
            fechaContactoPerdido: data.fecha_contacto_perdido,
            fotoUrl: data.foto_url,
            informanteNombre: data.informante_nombre,
            informanteTelefono: data.informante_telefono,
            informanteEmail: data.informante_email,
            estatus: data.estatus,
            creadoEn: data.creado_en,
            fuente: data.fuente,
            externalId: data.external_id,
            prioridad: data.prioridad
          };
          setMascotas((prev) => [record, ...prev]);
          setTotalMascotas((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error insertando mascota en Supabase:", {
          message: (err as any)?.message,
          details: (err as any)?.details,
          hint: (err as any)?.hint,
          code: (err as any)?.code,
          error: err
        });
        alert(`Error al registrar mascota: ${(err as any)?.message || JSON.stringify(err)}`);
      }
    } else {
      const record: Mascota = {
        ...newPet,
        id: `m-${Date.now()}`,
        creadoEn: new Date().toISOString()
      };
      setMascotas((prev) => [record, ...prev]);
      setTotalMascotas((prev) => prev + 1);
    }
  };

  const handleMarkPetAsFound = async (id: string, newStatus: "A Salvo" | "Encontrado") => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase!
          .from("mascotas")
          .update({ estatus: newStatus })
          .eq("id", id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Error al actualizar estatus de mascota en Supabase:", err);
      }
    }

    setMascotas((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, estatus: newStatus };
          if (selectedPet && selectedPet.id === id) {
            setSelectedPet(updated);
          }
          return updated;
        }
        return m;
      })
    );
  };

  const handleUpdatePet = async (updatedPet: Mascota) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase!
          .from("mascotas")
          .update({
            nombre: updatedPet.nombre,
            especie: updatedPet.especie,
            raza: updatedPet.raza,
            color_detalles: updatedPet.colorDetalles,
            ultimo_visto_estado: updatedPet.ultimoVistoEstado,
            ultimo_visto_detalles: updatedPet.ultimoVistoDetalles,
            fecha_contacto_perdido: updatedPet.fechaContactoPerdido,
            foto_url: updatedPet.fotoUrl,
            informante_nombre: updatedPet.informanteNombre,
            informante_telefono: updatedPet.informanteTelefono,
            informante_email: updatedPet.informanteEmail,
            estatus: updatedPet.estatus
          })
          .eq("id", updatedPet.id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Error al actualizar mascota en Supabase:", err);
        alert(`Error al actualizar: ${(err as any)?.message || JSON.stringify(err)}`);
        return;
      }
    }

    setMascotas((prev) =>
      prev.map((m) => (m.id === updatedPet.id ? updatedPet : m))
    );
    if (selectedPet && selectedPet.id === updatedPet.id) {
      setSelectedPet(updatedPet);
    }
  };

  const handleDeletePet = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase!
          .from("mascotas")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Error al eliminar mascota en Supabase:", err);
        alert(`Error al eliminar: ${(err as any)?.message || JSON.stringify(err)}`);
        return;
      }
    }

    setMascotas((prev) => prev.filter((m) => m.id !== id));
    setTotalMascotas((prev) => Math.max(0, prev - 1));
    setTotalMascotasFiltered((prev) => Math.max(0, prev - 1));
    setIsPetDetailOpen(false);
    setSelectedPet(null);
  };

  const handleReportCentroSuccess = async (report: { razon: string; detalles: string }) => {
    if (!reportingCentro) return;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase!
          .from("reportes_centros_acopio")
          .insert([{
            centro_id: reportingCentro.id,
            razon: report.razon,
            detalles: report.detalles
          }]);
        if (error) throw error;
        alert("¡Reporte enviado con éxito! Un moderador verificará la información del centro.");
      } catch (err) {
        console.error("Error al enviar reporte de centro en Supabase:", err);
      }
    } else {
      alert("¡Reporte simulado enviado con éxito! (Modo Demo)");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          {/* Primer botón (Primary) - Centros de Acopio */}
          <a
            href="https://acopiove.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-blue-500 text-left transition-all duration-300 cursor-pointer bg-blue-600 text-white shadow-md hover:border-blue-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-blue-600 transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Información de Ayuda
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Centros de acopio
              </h3>
              <p className="text-blue-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Encuentra y registra centros de acopios cerca de tu zona
              </p>
            </div>
          </a>

          {/* Segundo botón (Primary) - Personas Desaparecidas */}
          <a
            href="https://desaparecidosterremotovenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-red-500 text-left transition-all duration-300 cursor-pointer bg-red-600 text-white shadow-md hover:border-red-400 hover:scale-[1.01]"
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
          </a>

          {/* Tercer botón (Emerald) - Mascotas */}
          <a
            href="https://mascotasporvenezuela.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-emerald-500 text-left transition-all duration-300 cursor-pointer bg-emerald-600 text-white shadow-md hover:border-emerald-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-emerald-600 transition-colors">
              <PawPrint className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Apoyo a Animales
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Mascotas
              </h3>
              <p className="text-emerald-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Registra y busca mascotas perdidas o encontradas
              </p>
            </div>
          </a>

          {/* Cuarto botón (Amber) - Donar */}
          <a
            href="https://venezuelareporta.org/recursos#donar"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-amber-500 text-left transition-all duration-300 cursor-pointer bg-amber-600 text-white shadow-md hover:border-amber-400 hover:scale-[1.01]"
          >
            <div className="p-3 rounded-xl bg-white text-amber-600 transition-colors">
              <Heart className="h-6 w-6 fill-amber-600 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                Apoyo Solidario
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">
                Donar
              </h3>
              <p className="text-amber-100 text-xs md:text-sm mt-1.5 leading-relaxed">
                Colabora con recursos económicos para la ayuda humanitaria
              </p>
            </div>
          </a>

        </div>

        {/* Sección de Contenido Activo */}
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 mt-4">
          {activeView === 'acopio' ? (() => {
            const availableCountries = Array.from(
              new Set(
                centrosAcopio
                  .filter((c) => c.pais && c.pais.toLowerCase() !== "venezuela")
                  .map((c) => c.pais!)
              )
            ).sort();

            const availableCities = selectedCountry ? Array.from(
              new Set(
                centrosAcopio
                  .filter((c) => c.pais === selectedCountry && c.ciudad)
                  .map((c) => c.ciudad!)
              )
            ).sort() : [];

            return (
              <div className="space-y-6">
                {/* Encabezado Centros de Acopio */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                  <div className="space-y-2 max-w-2xl">
                    <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20">
                      {isExtranjeroView ? "Logística y Donaciones Internacionales" : "Logística y Donaciones Nacionales"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-neutral-900 dark:text-white leading-none">
                      {isExtranjeroView ? (
                        <>Centros de Acopio <span className="text-blue-600 dark:text-blue-400">en el Extranjero</span></>
                      ) : (
                        <>Red Nacional de <span className="text-blue-600 dark:text-blue-400">Centros de Acopio</span></>
                      )}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mt-1">
                      {isExtranjeroView ? (
                        "Localiza los puntos autorizados de recolección de agua, alimentos, medicinas y ropa organizados por la comunidad venezolana en el exterior."
                      ) : (
                        "Usa el mapa interactivo de Venezuela o el buscador para localizar los puntos autorizados de recolección de agua, alimentos, medicinas y ropa en tu estado."
                      )}
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

                {/* Selector Nacional vs Extranjero */}
                <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-900/50 pb-2">
                  <button
                    onClick={() => {
                      setIsExtranjeroView(false);
                      setSelectedCountry(null);
                      setSelectedCity(null);
                    }}
                    className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      !isExtranjeroView
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/20"
                        : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    Nacional (Venezuela)
                  </button>
                  <button
                    onClick={() => {
                      setIsExtranjeroView(true);
                      setSelectedState(null);
                    }}
                    className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      isExtranjeroView
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/20"
                        : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    Extranjero (Internacional)
                  </button>
                </div>

                {/* Mapa Interactivo (Sólo Nacional) */}
                {!isExtranjeroView ? (
                  <MapVenezuela
                    selectedState={selectedState}
                    onSelectState={setSelectedState}
                  />
                ) : (
                  /* Selectores de País y Ciudad (Sólo Extranjero) */
                  <div className="bg-white dark:bg-neutral-900 p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                        Selecciona un País
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCountry(null);
                            setSelectedCity(null);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            !selectedCountry
                              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                              : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          }`}
                        >
                          Todos los países ({centrosAcopio.filter(c => c.pais && c.pais.toLowerCase() !== "venezuela").length})
                        </button>
                        {availableCountries.map((country) => {
                          const count = centrosAcopio.filter(c => c.pais === country).length;
                          return (
                            <button
                              key={country}
                              onClick={() => {
                                setSelectedCountry(country);
                                setSelectedCity(null);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                selectedCountry === country
                                  ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                  : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              }`}
                            >
                              {country} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedCountry && (
                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/50">
                        <span className="block text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                          Ciudades en {selectedCountry}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedCity(null)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              !selectedCity
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                            }`}
                          >
                            Todas las ciudades
                          </button>
                          {availableCities.map((city) => {
                            const count = centrosAcopio.filter(c => c.pais === selectedCountry && c.ciudad === city).length;
                            return (
                              <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                  selectedCity === city
                                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                }`}
                              >
                                {city} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                    {isExtranjeroView ? (
                      selectedCountry ? (
                        selectedCity ? (
                          <span>
                            Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en <strong>{selectedCity}, {selectedCountry}</strong>
                          </span>
                        ) : (
                          <span>
                            Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en <strong>{selectedCountry}</strong>
                          </span>
                        )
                      ) : (
                        <span>
                          Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros internacionales
                        </span>
                      )
                    ) : (
                      selectedState ? (
                        <span>
                          Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en <strong>{selectedState}</strong>
                        </span>
                      ) : (
                        <span>
                          Mostrando <strong className="text-neutral-800 dark:text-white">{filteredCentros.length}</strong> centros en todo el país
                        </span>
                      )
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
                              <strong className="text-neutral-800 dark:text-neutral-200">
                                {isExtranjeroView ? `${centro.ciudad}, ${centro.pais}` : centro.estado}
                              </strong> — {centro.direccion}
                            </span>
                          </div>

                          {/* Contacto */}
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                            <span>{centro.contacto}</span>
                          </div>
                        </div>

                        {/* Insumos solicitados */}
                        <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/50 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                          <div className="space-y-1.5 flex-1">
                            <span className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
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
                          <button
                            onClick={() => {
                              setReportingCentro({ id: centro.id, nombre: centro.nombre });
                              setIsReportCentroOpen(true);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer self-start sm:self-auto transition-colors"
                          >
                            <Flag className="h-3 w-3" />
                            Reportar Problema
                          </button>
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
            );
          })() : (
            <div className="space-y-6">
              {/* Encabezado Mascotas con Estadísticas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200 dark:border-neutral-800 pb-6">
                {/* Lado izquierdo: Título y Estadísticas */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20">
                      Apoyo Animal
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-neutral-900 dark:text-white leading-none font-sans">
                      Búsqueda de <span className="text-emerald-600 dark:text-emerald-400">Mascotas Perdidas</span>
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mt-1">
                      Directorio solidario para reportar y localizar mascotas perdidas o encontradas bajo resguardo tras el terremoto.
                    </p>
                  </div>

                  {/* Tarjetas de estadísticas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl flex flex-col justify-center text-center sm:text-left shadow-xs">
                      <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{totalMascotas.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mt-2">Mascotas Reportadas</span>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex flex-col justify-center text-center sm:text-left shadow-xs">
                      <span className="text-3xl font-black text-emerald-650 dark:text-emerald-450 leading-none">{totalMascotasFiltered.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider mt-2">Resultados Filtrados</span>
                    </div>
                  </div>
                </div>

                {/* Lado derecho: Botones de reporte */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:items-end justify-end h-full">
                  <button
                    onClick={() => {
                      setPetFormInitialStatus("Perdido");
                      setIsPetDialogOpen(true);
                    }}
                    className="w-full sm:w-auto lg:w-full h-14 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>🔍</span> Busco Mascota
                  </button>
                  
                  <button
                    onClick={() => {
                      setPetFormInitialStatus("Encontrado");
                      setIsPetDialogOpen(true);
                    }}
                    className="w-full sm:w-auto lg:w-full h-14 px-5 rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black text-sm uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>🏡</span> Encontré Mascota
                  </button>

                  <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                    <DialogContent className="sm:max-w-lg w-[95%] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold font-heading text-neutral-900 dark:text-white">
                          Registrar Mascota
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-450">
                          Ingresa las características y foto de la mascota para ayudar en su búsqueda o para reportar que la tienes bajo resguardo.
                        </DialogDescription>
                      </DialogHeader>
                      <RegisterPetForm
                        onSuccess={handleRegisterPetSuccess}
                        onClose={() => setIsPetDialogOpen(false)}
                        initialStatus={petFormInitialStatus}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-colors duration-300">
                {/* Buscador de Texto */}
                <div className="sm:col-span-4 relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por color, señas..."
                    value={mascotasQuery}
                    onChange={(e) => setMascotasQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Filtro por Especie */}
                <div className="sm:col-span-2">
                  <select
                    value={mascotasEspecie}
                    onChange={(e) => setMascotasEspecie(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Todos">Especie: Todas</option>
                    <option value="Perro">Perros</option>
                    <option value="Gato">Gatos</option>
                    <option value="Otro">Otros</option>
                  </select>
                </div>

                {/* Filtro por Estado */}
                <div className="sm:col-span-3">
                  <select
                    value={mascotasState}
                    onChange={(e) => setMascotasState(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  {["Todos", "Perdido", "Encontrado", "A Salvo"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setMascotasStatus(status)}
                      className={`flex-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-1 ${
                        mascotasStatus === status
                          ? "bg-white dark:bg-neutral-900 text-emerald-600 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800/40"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350"
                      }`}
                    >
                      {status === "Todos" ? "Todos" : status === "Perdido" ? "Se Busca" : status === "Encontrado" ? "Resguardado" : "A Salvo"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listado de Mascotas */}
              {mascotas.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mascotas.map((mascota) => {
                      const isPerdido = mascota.estatus === "Perdido";
                      const isEncontrado = mascota.estatus === "Encontrado";
                      const initials = (mascota.nombre || mascota.especie)
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={mascota.id}
                          onClick={() => {
                            setSelectedPet(mascota);
                            setIsPetDetailOpen(true);
                          }}
                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-750 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group/card"
                        >
                          {/* Cabecera / Foto */}
                          <div className="relative h-64 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-800/50 overflow-hidden">
                            {mascota.fotoUrl ? (
                              <img
                                src={mascota.fotoUrl}
                                alt={mascota.nombre || mascota.especie}
                                className="h-full w-full object-contain transition-transform duration-550 group-hover/card:scale-105"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black">
                                {initials}
                              </div>
                            )}

                            {/* Badge de Estatus */}
                            <span className={`absolute top-3 right-3 flex items-center gap-1 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm border ${
                              isPerdido
                                ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                                : isEncontrado
                                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                                : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                isPerdido ? "bg-red-500 animate-pulse" : isEncontrado ? "bg-blue-500" : "bg-emerald-500"
                              }`} />
                              {isPerdido ? "Se Busca" : isEncontrado ? "Bajo Resguardo" : "A Salvo"}
                            </span>
                          </div>

                          {/* Contenido principal */}
                          <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <div>
                                <h4 className="text-base font-bold text-neutral-900 dark:text-white font-heading leading-tight truncate transition-colors group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 font-sans">
                                  {mascota.nombre || "Mascota sin nombre"}
                                </h4>
                                <span className="text-[10px] font-bold text-neutral-550 dark:text-neutral-450 block mt-0.5">
                                  {mascota.especie} {mascota.raza ? `• ${mascota.raza}` : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-450 font-medium">
                                <span>Visto: <strong>{mascota.fechaContactoPerdido}</strong></span>
                              </div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-450 line-clamp-3 leading-relaxed">
                                <strong className="text-neutral-850 dark:text-neutral-300">{mascota.ultimoVistoEstado}:</strong> {mascota.colorDetalles}
                              </p>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                              {/* Datos del informante */}
                              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal space-y-0.5">
                                <span className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-550 uppercase tracking-wider mb-1">
                                  Reportado Por:
                                </span>
                                <div className="font-semibold text-neutral-900 dark:text-white">
                                  {mascota.informanteNombre}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 text-neutral-450 dark:text-neutral-500 shrink-0" />
                                  <span>{mascota.informanteTelefono}</span>
                                </div>
                              </div>

                              {/* Botón CTA */}
                              <button
                                className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
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

                  {/* Controles de paginación de mascotas */}
                  {Math.ceil(totalMascotasFiltered / itemsPerPage) > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                      <button
                        disabled={mascotasPage === 1}
                        onClick={() => {
                          setMascotasPage((prev) => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        Anterior
                      </button>
                      <span className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-450 px-2">
                        Página <strong>{mascotasPage}</strong> de <strong>{Math.ceil(totalMascotasFiltered / itemsPerPage)}</strong>
                      </span>
                      <button
                        disabled={mascotasPage === Math.ceil(totalMascotasFiltered / itemsPerPage)}
                        onClick={() => {
                          setMascotasPage((prev) => Math.min(prev + 1, Math.ceil(totalMascotasFiltered / itemsPerPage)));
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
                    No se encontraron reportes de mascotas que coincidan con la búsqueda.
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

        {/* Modal de Detalle de Mascota */}
        <PetDetailModal
          open={isPetDetailOpen}
          onOpenChange={setIsPetDetailOpen}
          mascota={selectedPet}
          onMarkAsFound={handleMarkPetAsFound}
          onUpdatePet={handleUpdatePet}
          onDeletePet={handleDeletePet}
        />

        {/* Modal para Reportar Centro de Acopio */}
        <Dialog open={isReportCentroOpen} onOpenChange={setIsReportCentroOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading text-neutral-900 dark:text-white">
                Reportar Problema
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-450">
                Informa sobre alguna anomalía, inactividad o información errónea sobre este centro de acopio.
              </DialogDescription>
            </DialogHeader>
            {reportingCentro && (
              <ReportCentroForm
                centroId={reportingCentro.id}
                centroNombre={reportingCentro.nombre}
                onSuccess={handleReportCentroSuccess}
                onClose={() => setIsReportCentroOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Anuncio de Transición / Dirección */}
        <AnnouncementModal />

      </main>
      <Footer />
    </div>
  );
}
