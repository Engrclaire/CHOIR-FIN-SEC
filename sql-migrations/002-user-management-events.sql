-- ====================================================================================
-- MIGRATION 002: User Management + Events Enhancements
-- Run this in Supabase SQL Editor to ensure all columns exist.
-- Safe to run multiple times (IF NOT EXISTS / ON CONFLICT).
-- ====================================================================================

-- ====================================================================================
-- 1. APP_USERS TABLE (User Management Page)
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.app_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL DEFAULT '',
  email       text DEFAULT '',
  role        text DEFAULT 'member' CHECK (role IN ('admin','finance_sec','committee_lead','member','read_only')),
  status      text DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  added       date DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Add 'added' column if table existed before without it
DO $$ BEGIN
  ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS added date DEFAULT current_date;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.app_users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.app_users (role);

-- RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Allow all access to app_users" ON public.app_users;
DROP POLICY IF EXISTS "Authenticated full access to app_users" ON public.app_users;

-- Full access policy (matching other tables in this app)
CREATE POLICY "Allow all access to app_users" ON public.app_users
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.app_users TO authenticated, anon, service_role;


-- ====================================================================================
-- 2. EVENTS TABLE (Events Page — ensure all columns exist)
-- ====================================================================================
-- If events table doesn't exist yet, create it fully
CREATE TABLE IF NOT EXISTS public.events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL DEFAULT '',
  is_committee_run    boolean DEFAULT false,
  is_settled          boolean DEFAULT false,
  committee_balance   numeric DEFAULT 0,
  budget              numeric DEFAULT 0,
  financial_year_id   uuid,
  committee_lead_id   uuid,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table existed before without them
DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_settled boolean DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS committee_balance numeric DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS budget numeric DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_committee_run boolean DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS financial_year_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS committee_lead_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_settled ON public.events (is_settled);
CREATE INDEX IF NOT EXISTS idx_events_year ON public.events (financial_year_id);
CREATE INDEX IF NOT EXISTS idx_events_committee ON public.events (committee_lead_id);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "View events policy" ON public.events;
DROP POLICY IF EXISTS "Admin write events" ON public.events;
DROP POLICY IF EXISTS "Committee leads update assigned event budgets" ON public.events;

-- View policy: everyone can read
CREATE POLICY "View events policy" ON public.events
    FOR SELECT TO authenticated, anon USING (true);

-- Admin full write
CREATE POLICY "Admin write events" ON public.events
    FOR ALL TO authenticated USING (public.is_finance_admin());

-- Committee leads can update their own events
CREATE POLICY "Committee leads update assigned event budgets" ON public.events
    FOR UPDATE TO authenticated
    USING (committee_lead_id = auth.uid())
    WITH CHECK (committee_lead_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.events TO authenticated, anon, service_role;


-- ====================================================================================
-- 3. TRANSACTIONS TABLE (ensure event_id column exists for event financials)
-- ====================================================================================
DO $$ BEGIN
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS event_id uuid;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_txn_event ON public.transactions (event_id);


-- Force Supabase API to reload its schema cache
NOTIFY pgrst, 'reload schema';
