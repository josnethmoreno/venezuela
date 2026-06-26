-- Esquema de Base de Datos para Supabase (venezuelatenecesita.com)
-- Copia y pega este script en el SQL Editor de tu proyecto de Supabase.

-- Habilitar extensión para UUIDs si no está activa
create extension if not exists "uuid-ossp";

-- 1. Tabla de Centros de Acopio
create table if not exists public.centros_acopio (
    id uuid default gen_random_uuid() primary key,
    nombre text not null,
    estado text not null,
    direccion text not null,
    contacto text not null,
    necesidades text[] not null,
    verificado boolean default false,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.centros_acopio enable row level security;

-- Políticas de Seguridad para Centros de Acopio (Lectura pública, Inserción pública por ahora para reportar rápido)
create policy "Permitir lectura pública de centros de acopio" 
on public.centros_acopio for select using (true);

create policy "Permitir inserción pública de centros de acopio" 
on public.centros_acopio for insert with check (true);

create policy "Permitir actualizaciones al administrador" 
on public.centros_acopio for update using (true);


-- 2. Tabla de Personas Desaparecidas (Sin Contacto)
create table if not exists public.personas_desaparecidas (
    id uuid default gen_random_uuid() primary key,
    nombre_completo text not null,
    cedula text,
    edad integer not null,
    ultimo_visto_estado text not null,
    ultimo_visto_detalles text not null,
    fecha_contacto_perdido date not null,
    foto_url text,
    informante_nombre text not null,
    informante_telefono text not null,
    informante_email text,
    estatus text default 'Desaparecido' check (estatus in ('Desaparecido', 'Localizado')),
    fuente text not null default 'directo',
    external_id text,
    prioridad integer not null default 1,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint personas_desaparecidas_fuente_external_id_key unique (fuente, external_id)
);

-- Habilitar RLS
alter table public.personas_desaparecidas enable row level security;

-- Políticas de Seguridad para Personas Desaparecidas (Lectura y Escritura pública para emergencias)
create policy "Permitir lectura pública de desaparecidos" 
on public.personas_desaparecidas for select using (true);

create policy "Permitir inserción pública de desaparecidos" 
on public.personas_desaparecidas for insert with check (true);

create policy "Permitir actualización pública de desaparecidos" 
on public.personas_desaparecidas for update using (true);


-- 3. Tabla de Reportes de Información Adicional (Avistamientos)
create table if not exists public.reportes_informacion (
    id uuid default gen_random_uuid() primary key,
    persona_id uuid references public.personas_desaparecidas(id) on delete cascade not null,
    autor_nombre text not null,
    autor_telefono text,
    mensaje text not null,
    fecha timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.reportes_informacion enable row level security;

-- Políticas de Seguridad para Reportes (Lectura y Escritura pública)
create policy "Permitir lectura pública de reportes" 
on public.reportes_informacion for select using (true);

create policy "Permitir inserción pública de reportes" 
on public.reportes_informacion for insert with check (true);


-- Datos iniciales de prueba (Opcional - Centros de Acopio)
insert into public.centros_acopio (nombre, estado, direccion, contacto, necesidades, verificado)
values 
('Universidad Central de Venezuela (UCV) - Rectorado', 'Distrito Capital', 'Caracas - Plaza del Rectorado, frente a las canchas de tenis de la UCV.', 'FCU UCV (@FCU_UCV)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Cruz Roja Venezolana - Sede Nacional', 'Distrito Capital', 'Caracas - Av. Andrés Bello, Edif. Sede Central, La Candelaria.', 'Cruz Roja (@CruzRojaVe)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Universidad Simón Bolívar (USB) - Sartenejas', 'Miranda', 'Sartenejas - Planta baja del Pabellón de Materiales, Baruta.', 'Bomberos USB (+58 212-9063100)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Bomberos de Maracay - Estación Central', 'Aragua', 'Maracay - Av. Constitución, cruce con Calle Carabobo.', 'Bomberos de Aragua (+58 243-2320011)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Cruz Roja Venezolana - Filial Valencia', 'Carabobo', 'Valencia - Calle López Latouche, Urb. Prebo (Hospital Tipo II Luis Blanco Gasperi).', 'Cruz Roja Valencia (+58 241-8256436)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Cuerpo de Bomberos del Municipio Iribarren', 'Lara', 'Barquisimeto - Estación Central, Av. Carabobo con Carrera 30.', 'Bomberos Iribarren (+58 251-2314475)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Cuerpo de Bomberos del Estado Anzoátegui', 'Anzoátegui', 'Barcelona - Av. Argimiro Gabaldón, Zona Industrial Los Montones.', 'Bomberos Anzoátegui (+58 281-2741700)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Protección Civil Caroní - Sede Puerto Ordaz', 'Bolívar', 'Puerto Ordaz - Sede PC, Sector Castillito (frente a las canchas).', 'PC Caroní (+58 286-9314455)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Protección Civil Táchira - Sede Principal', 'Táchira', 'San Cristóbal - Av. 19 de Abril, Edif. Protección Civil.', 'PC Táchira (@PCivilTachira)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Cuerpo de Bomberos de Maracaibo - Sede Santa Rita', 'Zulia', 'Maracaibo - Av. 8 (Santa Rita), Sede Central.', 'Bomberos de Maracaibo (+58 261-7221133)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true),
('Catedral de Barquisimeto', 'Lara', 'Av. Venezuela con Calle 30.', 'Cáritas Barquisimeto', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], false),
('Cuerpo de Bomberos de Mérida - Estación Central', 'Mérida', 'Mérida - Av. Humberto Tejera, sector Glorias Patrias.', 'Bomberos Mérida (+58 274-2633333)', array['Agua Potable', 'Alimentos no perecederos', 'Medicinas y Primeros Auxilios', 'Ropa y Cobijas', 'Artículos de higiene personal'], true);

-- 4. Tabla de Mascotas
create table if not exists public.mascotas (
    id uuid default gen_random_uuid() primary key,
    nombre text,
    especie text not null check (especie in ('Perro', 'Gato', 'Otro')),
    raza text,
    color_detalles text not null,
    ultimo_visto_estado text not null,
    ultimo_visto_detalles text not null,
    fecha_contacto_perdido date not null,
    foto_url text,
    informante_nombre text not null,
    informante_telefono text not null,
    informante_email text,
    estatus text default 'Perdido' check (estatus in ('Perdido', 'Encontrado', 'A Salvo')),
    fuente text not null default 'directo',
    external_id text,
    prioridad integer not null default 1,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint mascotas_fuente_external_id_key unique (fuente, external_id)
);

-- Habilitar RLS
alter table public.mascotas enable row level security;

-- Políticas de Seguridad para Mascotas
create policy "Permitir lectura pública de mascotas" 
on public.mascotas for select using (true);

create policy "Permitir inserción pública de mascotas" 
on public.mascotas for insert with check (true);

create policy "Permitir actualización pública de mascotas" 
on public.mascotas for update using (true);


-- 5. Tabla de Reportes de Centros de Acopio
create table if not exists public.reportes_centros_acopio (
    id uuid default gen_random_uuid() primary key,
    centro_id uuid references public.centros_acopio(id) on delete cascade not null,
    razon text not null check (razon in ('inactivo', 'lleno', 'informacion_incorrecta', 'spam', 'otro')),
    detalles text not null,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.reportes_centros_acopio enable row level security;

-- Políticas de Seguridad para Reportes de Centros de Acopio
create policy "Permitir lectura pública de reportes de centros" 
on public.reportes_centros_acopio for select using (true);

create policy "Permitir inserción pública de reportes de centros" 
on public.reportes_centros_acopio for insert with check (true);


-- =========================================================================
-- MIGRACIÓN PARA BASE DE DATOS EXISTENTE (Ejecutar en el SQL Editor de Supabase)
-- =========================================================================
-- 1. Migración para la tabla personas_desaparecidas
-- ALTER TABLE public.personas_desaparecidas
-- ADD COLUMN IF NOT EXISTS fuente text NOT NULL DEFAULT 'directo',
-- ADD COLUMN IF NOT EXISTS external_id text,
-- ADD COLUMN IF NOT EXISTS prioridad integer NOT NULL DEFAULT 1;
-- 
-- ALTER TABLE public.personas_desaparecidas
-- ADD CONSTRAINT personas_desaparecidas_fuente_external_id_key UNIQUE (fuente, external_id);
-- 
-- 2. Migración para la tabla mascotas
-- ALTER TABLE public.mascotas
-- ADD COLUMN IF NOT EXISTS fuente text NOT NULL DEFAULT 'directo',
-- ADD COLUMN IF NOT EXISTS external_id text,
-- ADD COLUMN IF NOT EXISTS prioridad integer NOT NULL DEFAULT 1;
-- 
-- 3. Migración para la tabla centros_acopio
-- ALTER TABLE public.centros_acopio
-- ADD COLUMN IF NOT EXISTS pais text NOT NULL DEFAULT 'Venezuela',
-- ADD COLUMN IF NOT EXISTS ciudad text;


