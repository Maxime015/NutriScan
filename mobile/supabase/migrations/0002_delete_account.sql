-- =============================================================
-- NutriScan — suppression de compte
-- À exécuter dans Supabase (SQL Editor) après 0001_init.sql.
-- =============================================================
--
-- Supprimer un compte revient à supprimer la ligne correspondante dans
-- `auth.users`. Grâce aux clés étrangères `on delete cascade` définies dans
-- 0001_init.sql (profiles.id et analyses.user_id → auth.users.id), le profil
-- et tout l'historique d'analyses de l'utilisateur sont supprimés en cascade
-- automatiquement.
--
-- Or seul un rôle privilégié (service_role) peut écrire dans `auth.users` : le
-- client mobile (clé anon + JWT utilisateur) ne le peut pas. On expose donc une
-- fonction RPC `security definer` qui s'exécute avec les droits du propriétaire
-- (postgres) et ne supprime QUE le compte de l'appelant (auth.uid()).
--
-- Le stockage (buckets `analysis-images` / `avatars`) n'a pas de FK vers
-- auth.users : les fichiers de l'utilisateur sont nettoyés côté client via
-- l'API Storage avant l'appel (voir mobile/src/lib/queries.ts).

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  -- Refuse tout appel non authentifié.
  if uid is null then
    raise exception 'Non authentifié' using errcode = '28000';
  end if;

  -- Supprime le compte d'authentification.
  -- → cascade FK : public.profiles et public.analyses de cet utilisateur.
  delete from auth.users where id = uid;
end;
$$;

-- L'exécution n'est ouverte qu'aux utilisateurs authentifiés.
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
