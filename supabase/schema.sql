-- ============================================================================
-- PETATE — Esquema de base de datos para Supabase
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Entra en tu proyecto de Supabase.
--   2. Menú lateral → "SQL Editor" → "New query".
--   3. Pega TODO este archivo y pulsa "Run".
-- Esto crea las tablas, los datos iniciales, la seguridad (RLS) y el
-- almacenamiento de fotos. Solo hay que ejecutarlo una vez.
-- ============================================================================

-- ---- TABLAS ----------------------------------------------------------------

create table if not exists family_members (
  id          bigint generated always as identity primary key,
  name        text not null,
  role        text not null default 'otro',
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now()
);

create table if not exists locations (
  id          bigint generated always as identity primary key,
  name        text not null,
  city        text not null default '',
  country     text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists wardrobes (
  id           bigint generated always as identity primary key,
  name         text not null,
  location_id  bigint references locations(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists suitcases (
  id                   bigint generated always as identity primary key,
  name                 text not null,
  current_location_id  bigint references locations(id) on delete set null,
  created_at           timestamptz not null default now()
);

create table if not exists trips (
  id          bigint generated always as identity primary key,
  name        text not null,
  destination text,
  start_date  text,
  end_date    text,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists trip_suitcases (
  trip_id      bigint references trips(id) on delete cascade,
  suitcase_id  bigint references suitcases(id) on delete cascade,
  primary key (trip_id, suitcase_id)
);

create table if not exists garments (
  id           bigint generated always as identity primary key,
  name         text not null,
  category     text not null default 'otros',
  owner_id     bigint references family_members(id) on delete set null,
  wardrobe_id  bigint references wardrobes(id) on delete set null,
  suitcase_id  bigint references suitcases(id) on delete set null,
  photo_path   text,
  condition    text default 'buena',
  use_type     text default 'salir',
  fit          text default 'bien',
  season       text default 'todo',
  rating       int  default 3,
  brand        text,
  color        text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ---- DATOS INICIALES (solo si las tablas están vacías) ---------------------

insert into family_members (name, role, color)
select * from (values
  ('Papá', 'padre', '#3b82f6'),
  ('Mamá', 'madre', '#ec4899'),
  ('Hijo 1', 'hijo', '#10b981'),
  ('Hijo 2', 'hijo', '#f59e0b')
) as v(name, role, color)
where not exists (select 1 from family_members);

insert into locations (name, city, country)
select * from (values
  ('Casa Nueva York', 'Nueva York', 'Estados Unidos'),
  ('Casa España', 'España', 'España')
) as v(name, city, country)
where not exists (select 1 from locations);

-- Armarios y maletas iniciales (asociados a las ubicaciones recién creadas)
insert into wardrobes (name, location_id)
select 'Armario Principal', id from locations where name = 'Casa Nueva York'
where not exists (select 1 from wardrobes);
insert into wardrobes (name, location_id)
select 'Armario Habitación', id from locations where name = 'Casa España'
on conflict do nothing;

insert into suitcases (name, current_location_id)
select 'Maleta Grande', id from locations where name = 'Casa Nueva York'
where not exists (select 1 from suitcases);
insert into suitcases (name, current_location_id)
select 'Maleta de Mano', id from locations where name = 'Casa España'
on conflict do nothing;

-- ---- SEGURIDAD (Row Level Security) ----------------------------------------
-- Activamos RLS y permitimos el acceso SOLO a usuarios que han iniciado sesión.
-- Así, aunque la clave anon sea pública, nadie puede ver ni tocar los datos
-- sin una cuenta válida.

alter table family_members  enable row level security;
alter table locations       enable row level security;
alter table wardrobes       enable row level security;
alter table suitcases       enable row level security;
alter table trips           enable row level security;
alter table trip_suitcases  enable row level security;
alter table garments        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['family_members','locations','wardrobes','suitcases','trips','trip_suitcases','garments']
  loop
    execute format('drop policy if exists "acceso autenticado" on %I;', t);
    execute format(
      'create policy "acceso autenticado" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ---- ALMACENAMIENTO DE FOTOS ------------------------------------------------
-- Bucket público de lectura (para poder mostrar las imágenes), pero solo los
-- usuarios autenticados pueden subir / borrar.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos lectura publica" on storage.objects;
create policy "fotos lectura publica" on storage.objects
  for select to public using (bucket_id = 'photos');

drop policy if exists "fotos subir autenticado" on storage.objects;
create policy "fotos subir autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');

drop policy if exists "fotos borrar autenticado" on storage.objects;
create policy "fotos borrar autenticado" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');
