-- ====================================================================================
-- MIGRATION 006: Levy Types + Compulsory Contributions + Audit Logs
--
-- Run this in the Supabase SQL Editor. Safe to run multiple times.
-- Requires migrations 003 and 004 to already be applied (uses public.safe_exec).
--
-- WHAT THIS DOES
--   1. Adds levy_type to public.levies (one_time | monthly | yearly)
--   2. Adds is_compulsory + penalty_amount to public.contributions so compulsory
--      contributions can auto-assign penalties to defaulting members
--   3. Creates public.audit_logs and RLS so every financial action is traceable
--      (users log their own actions; admins can read everything)
--   4. Reloads the PostgREST schema cache
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. LEVY TYPES
-- ------------------------------------------------------------------------------------
SELECT public.safe_exec('ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS levy_type text DEFAULT ''one_time''');
SELECT public.safe_exec('ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false');

-- Enforce the levy_type values (drop any old constraint then re-add)
DO $$
DECLARE
  con_name text;
BEGIN
  FOR con_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN pg_attribute att
      ON att.attrelid = c.conrelid
     AND att.attnum = ANY (c.conkey)
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'levies'
      AND c.contype = 'c'
      AND att.attname = 'levy_type'
  LOOP
    EXECUTE format('ALTER TABLE public.levies DROP CONSTRAINT %I', con_name);
  END LOOP;
END $$;

SELECT public.safe_exec('ALTER TABLE public.levies ADD CONSTRAINT levies_levy_type_check CHECK (levy_type IN (''one_time'',''monthly'',''yearly''))');

-- ------------------------------------------------------------------------------------
-- 2. COMPULSORY CONTRIBUTIONS + AUTO PENALTY
-- ------------------------------------------------------------------------------------
SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS is_compulsory boolean DEFAULT false');
SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS penalty_amount numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS date date');

-- ------------------------------------------------------------------------------------
-- 3. AUDIT LOGS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL DEFAULT '',
  entity      text NOT NULL DEFAULT '',
  entity_id   uuid,
  description text NOT NULL DEFAULT '',
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity, entity_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs insert own" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs read own" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs read by admin" ON public.audit_logs;

-- Anyone authenticated may write their own audit trail
CREATE POLICY "Audit logs insert own" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own audit trail
CREATE POLICY "Audit logs read own" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can read every audit trail
CREATE POLICY "Audit logs read by admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

GRANT ALL ON public.audit_logs TO authenticated, service_role;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
