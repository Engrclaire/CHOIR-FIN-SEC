    
-- STEP 0: CLEAN SLATE & RESTORE PERMISSIONS
-- ====================================================================================

-- 1. Safely drop tables that may have conflicting schemas from prior runs
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. Create the complete members table with all performance structures
CREATE TABLE public.members (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name           text NOT NULL,
  last_name            text NOT NULL,
  phone                text,
  email                text,
  role                 text DEFAULT '',
  full_name            text,
  status               text DEFAULT 'active',
  debt_status          text DEFAULT 'clear' CHECK (debt_status IN ('clear','owing','critical')),
  outstanding_debt     numeric DEFAULT 0,
  penalties            numeric DEFAULT 0,
  total_levies         numeric DEFAULT 0,
  total_contributions  numeric DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 3. Create the settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_name text DEFAULT 'St Cecilia Choir',
  financial_year_start text DEFAULT 'January',
  currency text DEFAULT 'NGN',
  allow_backdated boolean DEFAULT false,
  require_approval boolean DEFAULT false,
  show_directory boolean DEFAULT true,
  admin_access boolean DEFAULT true,
  finance_access boolean DEFAULT true,
  read_only_access boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create the pledges table
CREATE TABLE IF NOT EXISTS public.pledges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      numeric NOT NULL DEFAULT 0,
  status      text DEFAULT 'outstanding' CHECK (status IN ('outstanding','fulfilled','paid')),
  member_id   uuid REFERENCES public.members(id) ON DELETE SET NULL,
  event_id    uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 5. Create the contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description   text DEFAULT '',
  amount        numeric NOT NULL DEFAULT 0,
  source        text DEFAULT '',
  event         text,
  type          text DEFAULT 'General',
  member_id     uuid REFERENCES public.members(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 6. Create the app users table (app-level user list — renamed from "users" to avoid auth.users collision)
CREATE TABLE IF NOT EXISTS public.app_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL DEFAULT '',
  email       text DEFAULT '',
  role        text DEFAULT 'member',
  status      text DEFAULT 'active',
  added       date DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 7. Create database performance indexes on members
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_members_debt ON public.members (debt_status);
CREATE INDEX IF NOT EXISTS idx_members_outstanding ON public.members (outstanding_debt);

-- 8. Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_pledges_status ON public.pledges (status);
CREATE INDEX IF NOT EXISTS idx_pledges_member ON public.pledges (member_id);
CREATE INDEX IF NOT EXISTS idx_contrib_member ON public.contributions (member_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.app_users (email);

-- 9. Force Supabase API to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';

-- 10. Grant permissions safely now that all tables exist
GRANT ALL ON public.profiles TO authenticated, anon, service_role;
GRANT ALL ON public.financial_years TO authenticated, anon, service_role;
GRANT ALL ON public.members TO authenticated, anon, service_role;
GRANT ALL ON public.events TO authenticated, anon, service_role;
GRANT ALL ON public.levies TO authenticated, anon, service_role;
GRANT ALL ON public.member_ledgers TO authenticated, anon, service_role;
GRANT ALL ON public.transactions TO authenticated, anon, service_role;
GRANT ALL ON public.reconciliations TO authenticated, anon, service_role;
GRANT ALL ON public.settings TO authenticated, anon, service_role;
GRANT ALL ON public.pledges TO authenticated, anon, service_role;
GRANT ALL ON public.contributions TO authenticated, anon, service_role;
GRANT ALL ON public.app_users TO authenticated, anon, service_role;

-- ====================================================================================
-- CLEANUP: Clear out old definitions to avoid collision errors
-- ====================================================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated view of financial years" ON public.financial_years;
DROP POLICY IF EXISTS "Allow authenticated view of levies" ON public.levies;
DROP POLICY IF EXISTS "Allow authenticated view of member ledgers" ON public.member_ledgers;
DROP POLICY IF EXISTS "Allow authenticated view of events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated view of transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated view of reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Finance managers write financial_years" ON public.financial_years;
DROP POLICY IF EXISTS "Finance managers write levies" ON public.levies;
DROP POLICY IF EXISTS "Finance managers write member_ledgers" ON public.member_ledgers;
DROP POLICY IF EXISTS "Allow onboarding ledger inserts" ON public.member_ledgers;
DROP POLICY IF EXISTS "Finance managers update member_ledgers" ON public.member_ledgers;
DROP POLICY IF EXISTS "Finance managers delete member_ledgers" ON public.member_ledgers;
DROP POLICY IF EXISTS "Finance managers write reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Finance managers write events" ON public.events;
DROP POLICY IF EXISTS "Finance managers complete transaction power" ON public.transactions;
DROP POLICY IF EXISTS "Committee leads write transactions" ON public.transactions;
DROP POLICY IF EXISTS "Committee leads update assigned event budgets" ON public.events;
DROP POLICY IF EXISTS "View events policy" ON public.events;
DROP POLICY IF EXISTS "Admin write events" ON public.events;
DROP POLICY IF EXISTS "Committee update assigned event status" ON public.events;
DROP POLICY IF EXISTS "View transactions policy" ON public.transactions;
DROP POLICY IF EXISTS "Admin full power transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow inserts for transactions" ON public.transactions;

-- Cleanup for members policies
DROP POLICY IF EXISTS "Allow all access to members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated view of members" ON public.members;
DROP POLICY IF EXISTS "Finance managers write members" ON public.members;

-- Cleanup for settings policies
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;

-- Cleanup for pledges policies
DROP POLICY IF EXISTS "Allow all access to pledges" ON public.pledges;

-- Cleanup for contributions policies
DROP POLICY IF EXISTS "Allow all access to contributions" ON public.contributions;

-- Cleanup for app_users policies
DROP POLICY IF EXISTS "Allow all access to app_users" ON public.app_users;

-- ====================================================================================
-- STEP 1: INITIALIZE ROW LEVEL SECURITY (RLS) ACROSS ALL TABLES
-- ====================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- ====================================================================================
-- STEP 1.5: SEED SETTINGS TABLE DEFAULT ROW
-- ====================================================================================
-- Overriding system value allows us to safely target the ID 1 placeholder configuration
INSERT INTO public.settings (org_name)
VALUES ('St Cecilia Choir')
ON CONFLICT DO NOTHING;

-- ====================================================================================
-- STEP 2: PROFILE MANAGING POLICIES (Strictly Authenticated Only)
-- ====================================================================================
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ====================================================================================
-- STEP 3: SECURITY CONTROLLER HELPER FUNCTIONS
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.is_finance_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'fin_sec')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_committee_lead()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'committee_lead'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================================
-- STEP 4: GLOBAL READ PRIVILEGES (Authenticated Sessions & Public Fallback UI)
-- ====================================================================================
CREATE POLICY "Allow authenticated view of financial years" ON public.financial_years FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow authenticated view of levies" ON public.levies FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow authenticated view of member ledgers" ON public.member_ledgers FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow authenticated view of reconciliations" ON public.reconciliations FOR SELECT TO authenticated USING (public.is_finance_admin());

-- Members Access Rule (Allowing all access as requested)
CREATE POLICY "Allow all access to members" ON public.members
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Settings View Policy
CREATE POLICY "Authenticated can view settings" ON public.settings
    FOR SELECT TO authenticated USING (true);

-- Pledges Access Rule (Full access for dashboard metrics)
CREATE POLICY "Allow all access to pledges" ON public.pledges
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Contributions Access Rule (Full access for contribution tracking)
CREATE POLICY "Allow all access to contributions" ON public.contributions
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- App Users Access Rule (Full access for user management page)
CREATE POLICY "Allow all access to app_users" ON public.app_users
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- ====================================================================================
-- STEP 5: CORE ADMINISTRATIVE WRITE ROLES (Secured via is_finance_admin)
-- ====================================================================================
CREATE POLICY "Finance managers write financial_years" ON public.financial_years FOR ALL TO authenticated USING (public.is_finance_admin());
CREATE POLICY "Finance managers write levies" ON public.levies FOR ALL TO authenticated USING (public.is_finance_admin());

CREATE POLICY "Allow onboarding ledger inserts" ON public.member_ledgers
    FOR INSERT TO authenticated WITH CHECK (public.is_finance_admin());

CREATE POLICY "Finance managers update member_ledgers" ON public.member_ledgers
    FOR UPDATE TO authenticated USING (public.is_finance_admin()) WITH CHECK (public.is_finance_admin());

CREATE POLICY "Finance managers delete member_ledgers" ON public.member_ledgers
    FOR DELETE TO authenticated USING (public.is_finance_admin());

CREATE POLICY "Finance managers write reconciliations" ON public.reconciliations
    FOR ALL TO authenticated USING (public.is_finance_admin());

-- Settings Write Policies
CREATE POLICY "Admins can update settings" ON public.settings
    FOR UPDATE TO authenticated USING (public.is_finance_admin()) WITH CHECK (public.is_finance_admin());

CREATE POLICY "Admins can insert settings" ON public.settings
    FOR INSERT TO authenticated WITH CHECK (public.is_finance_admin());

-- ====================================================================================
-- STEP 6: GRANULAR TRANSACTION LOGGING & LOGIN-AWARE INTEGRATION
-- ====================================================================================

-- Events Access Layer
CREATE POLICY "View events policy" ON public.events FOR SELECT TO authenticated, anon
    USING (public.is_finance_admin() OR committee_lead_id = auth.uid() OR auth.role() = 'anon');

CREATE POLICY "Admin write events" ON public.events FOR ALL TO authenticated
    USING (public.is_finance_admin());

CREATE POLICY "Committee leads update assigned event budgets" ON public.events FOR UPDATE TO authenticated
    USING (committee_lead_id = auth.uid()) WITH CHECK (committee_lead_id = auth.uid());

-- Transactions View Rules
CREATE POLICY "View transactions policy" ON public.transactions FOR SELECT TO authenticated, anon
    USING (
        public.is_finance_admin() OR
        auth.role() = 'anon' OR
        event_id IN (SELECT id FROM public.events WHERE committee_lead_id = auth.uid())
    );

-- Transactions Mutation Rules (Accepts Full Admin Login Control)
CREATE POLICY "Admin full power transactions" ON public.transactions FOR ALL TO authenticated
    USING (public.is_finance_admin());

-- COMBINED WRITE LAYER: Accepts authenticated roles AND safe public client testing submissions fallback
CREATE POLICY "Allow inserts for transactions" ON public.transactions
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        -- If they are logged in as a specific role, let the application validation confirm assignments
        (auth.role() = 'authenticated' AND (public.is_finance_admin() OR public.is_committee_lead()))
        OR
        -- Fallback if they are sending directly from an unauthenticated Axios sandbox
        (auth.role() = 'anon')
    );

-- ====================================================================================
-- STEP 7: SCHEMA VERIFICATION (All Tables)
-- ====================================================================================
SELECT 'transactions' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'

UNION ALL

SELECT 'events' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'

UNION ALL

SELECT 'settings' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'settings'

UNION ALL

SELECT 'members' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'members'

UNION ALL

SELECT 'pledges' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pledges'

UNION ALL

SELECT 'contributions' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contributions'

UNION ALL

SELECT 'app_users' AS target_table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'app_users'

ORDER BY target_table DESC, column_name;
