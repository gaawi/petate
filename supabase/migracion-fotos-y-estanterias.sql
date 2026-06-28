-- ============================================================================
-- PETATE — Migración: varias fotos por prenda + estanterías/cajas en armarios
-- ----------------------------------------------------------------------------
-- Cómo aplicarla (una sola vez):
--   1. Supabase → SQL Editor → New query
--   2. Pega TODO este archivo y pulsa RUN
-- Es segura de ejecutar aunque ya exista algo (usa IF NOT EXISTS).
-- ============================================================================

-- 1) Varias fotos por prenda (array de URLs; la primera es la portada)
alter table garments add column if not exists photos text[] not null default '{}';

-- 2) Estanterías / cajas dentro de un armario
create table if not exists shelves (
  id          bigint generated always as identity primary key,
  name        text not null,
  wardrobe_id bigint references wardrobes(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 3) Cada prenda puede estar en una estantería concreta
alter table garments add column if not exists shelf_id bigint references shelves(id) on delete set null;

-- 4) Seguridad: solo usuarios con sesión pueden acceder a las estanterías
alter table shelves enable row level security;
drop policy if exists "acceso autenticado" on shelves;
create policy "acceso autenticado" on shelves
  for all to authenticated using (true) with check (true);
