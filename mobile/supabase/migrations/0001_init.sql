-- =============================================================
-- NutriScan — schéma initial
-- À exécuter dans Supabase (SQL Editor) sur un projet neuf.
-- =============================================================

-- -------------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  age int check (age is null or (age > 0 and age < 130)),
  sex text check (sex in ('male', 'female', 'other') or sex is null),
  weight_kg numeric,
  height_cm numeric,
  health_conditions text[] not null default '{}',
  avatar_url text,
  language text not null default 'fr',
  dark_mode boolean not null default true,
  notifications_enabled boolean not null default true,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -------------------------------------------------------------
-- ANALYSES
-- -------------------------------------------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null default 'Aliment analysé',
  image_url text,
  grade text not null,
  confidence numeric not null default 0,
  impact text,
  food_type text check (food_type in ('Aliment', 'Boisson') or food_type is null),
  usage jsonb not null default '{}'::jsonb,
  risks jsonb not null default '{"list":[],"details":[]}'::jsonb,
  allergens jsonb not null default '{"list":[],"details":[]}'::jsonb,
  recommendations jsonb not null default '{}'::jsonb,
  ai_explanation text,
  extracted_text text,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "analyses_update_own" on public.analyses;
create policy "analyses_update_own"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- updated_at auto
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Création automatique du profil à l'inscription
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- STORAGE : buckets à lecture publique, écriture restreinte
-- (les miniatures d'étiquettes ne sont pas sensibles ; la lecture publique
--  simplifie l'affichage. L'écriture reste limitée au dossier de l'utilisateur.)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('analysis-images', 'analysis-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Lecture publique.
drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read"
  on storage.objects for select
  using (bucket_id in ('analysis-images', 'avatars'));

-- Écriture / mise à jour / suppression : uniquement dans son dossier (préfixe = user id).
drop policy if exists "images_insert_own" on storage.objects;
create policy "images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id in ('analysis-images', 'avatars')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "images_update_own" on storage.objects;
create policy "images_update_own"
  on storage.objects for update
  using (
    bucket_id in ('analysis-images', 'avatars')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "images_delete_own" on storage.objects;
create policy "images_delete_own"
  on storage.objects for delete
  using (
    bucket_id in ('analysis-images', 'avatars')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
