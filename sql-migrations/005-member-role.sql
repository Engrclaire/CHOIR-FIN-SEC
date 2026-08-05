-- ====================================================================================
-- MIGRATION 005: Member role support
--
-- Run this in the Supabase SQL Editor. Safe to run multiple times.
--
-- WHAT THIS DOES
--   1. Ensures public.profiles.role accepts the 'member' role so members can be
--      created/invited and sign in to a read-only home dashboard.
--   2. Reloads the PostgREST schema cache.
--
-- NOTES
--   * The role helper functions from migration 003 (is_admin / is_financial_secretary /
--     is_committee_lead) intentionally return FALSE for 'member' users, so RLS keeps
--     members out of admin / fin_sec / committee_lead data automatically.
--   * Members are NOT able to insert into financial tables (transactions, levies,
--     contributions, members, event_assignments, financial_years) — the existing
--     policies already restrict those to admin / fin_sec / assigned staff.
-- ====================================================================================

-- Drop any existing CHECK constraint that limits profiles.role, then re-add one that
-- includes the 'member' role. This introspects the constraint name so it works even if
-- the constraint was originally created with a different name.
DO $$
DECLARE
  con_name text;
BEGIN
  FOR con_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'profiles'
      AND con.contype = 'c'
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_attribute att
      WHERE att.attrelid = con.conrelid
        AND att.attnum = ANY (con.conkey)
        AND att.attname = 'role'
    ) THEN
      EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', con_name);
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'fin_sec', 'committee_lead', 'member'));

-- Reload the PostgREST schema cache so the new constraint is picked up
NOTIFY pgrst, 'reload schema';
