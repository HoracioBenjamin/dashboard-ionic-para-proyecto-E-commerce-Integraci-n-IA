-- ==========================================================
-- Migración: tabla de géneros (Unisex / Hombre / Mujer)
-- Se ejecuta en Supabase Dashboard → SQL Editor
-- Date: 2026-10-20
-- ==========================================================

-- 1. Crear la tabla de géneros (catálogo, mismo patrón que marcas/categorias)
create table if not exists public.generos (
  id         int8 primary key generated always as identity,
  created_at timestamptz default now(),
  nombre     text not null,
  slug       text not null unique
);

-- 2. Sembrar los 3 géneros
insert into public.generos (nombre, slug) values
  ('Unisex', 'unisex'),
  ('Hombre', 'hombre'),
  ('Mujer',  'mujer')
on conflict (slug) do nothing;

-- 3. RLS: lectura pública (igual que regiones/comunas), nadie escribe desde el anon
alter table public.generos enable row level security;

drop policy if exists "Lectura pública de géneros" on public.generos;
create policy "Lectura pública de géneros"
  on public.generos
  for select
  to public
  using (true);

-- 4. Agregar la referencia en productos
alter table public.productos
  add column if not exists genero_id int8
  references public.generos (id);

-- 5. (Opcional) Asignar Unisex a los productos existentes que no tienen género
update public.productos
   set genero_id = (select id from public.generos where slug = 'unisex')
 where genero_id is null;

-- 6. Índice para consultas por género (filtros en la tienda)
create index if not exists productos_genero_id_idx
  on public.productos (genero_id);
