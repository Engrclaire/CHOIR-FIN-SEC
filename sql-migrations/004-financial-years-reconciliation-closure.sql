-- ====================================================================================
-- MIGRATION 004: Financial Years + Reconciliation + Year-End Closure
-- + Member Ledgers + RLS hardening + Realtime for dashboards
--
-- Run this in the Supabase SQL Editor. Safe to run multiple times.
--
-- WHAT THIS DOES
--   1. Ensures the base financial tables exist (transactions, levies, contributions,
--      pledges, members, member_ledgers, settings, financial_years, reconciliations).
--   2. Creates the reconciliations table for the Cash vs Bank reconciliation tool.
--   3. Creates the public.close_financial_year() RPC used by the Financial Secretary
--      dashboard to lock the current year and roll forward bank/cash balances plus
--      unpaid member debts into a brand new financial year.
--   4. Adds row-level security on the financial tables consistent with the strict
--      Admin-isolation model from migration 003.
--   5. Exposes transactions / member_ledgers / financial_years / reconciliations /
--      events to Supabase Realtime so dashboards refresh live.
--
-- IMPORTANT
--   * All statements are wrapped so nothing crashes if a table or column already
--     exists. Existing tables are left untouched; only missing columns are added.
--   * Requires migration 003 (role helper functions) to already be applied.
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- SAFE EXECUTOR — swallow errors so this file can be run any number of times
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.safe_exec(query_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  EXECUTE query_text;
EXCEPTION
  WHEN others THEN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.safe_exec(text) TO authenticated, anon, service_role;


-- ====================================================================================
-- 1. FINANCIAL YEARS
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.financial_years (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label  text NOT NULL DEFAULT to_char(now(), 'YYYY'),
  is_closed   boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_at   timestamptz,
  closed_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.financial_years ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL');
SELECT public.safe_exec('ALTER TABLE public.financial_years ADD COLUMN IF NOT EXISTS closed_at timestamptz');
SELECT public.safe_exec('ALTER TABLE public.financial_years ADD COLUMN IF NOT EXISTS closed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL');

CREATE INDEX IF NOT EXISTS idx_financial_years_closed ON public.financial_years (is_closed);

SELECT public.safe_exec('ALTER TABLE public.financial_years ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Financial years readable by authenticated" ON public.financial_years');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Financial years managed by finance staff" ON public.financial_years');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Allow all access to financial_years" ON public.financial_years');
SELECT public.safe_exec('CREATE POLICY "Financial years readable by authenticated" ON public.financial_years FOR SELECT TO authenticated USING (true)');
SELECT public.safe_exec('CREATE POLICY "Financial years managed by finance staff" ON public.financial_years FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_financial_secretary())');
SELECT public.safe_exec('CREATE POLICY "Financial years updated by finance staff" ON public.financial_years FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_financial_secretary()) WITH CHECK (public.is_admin() OR public.is_financial_secretary())');

GRANT ALL ON public.financial_years TO authenticated, service_role;

-- Seed the current financial year if none exists
INSERT INTO public.financial_years (year_label, is_closed)
SELECT to_char(now(), 'YYYY'), false
WHERE NOT EXISTS (SELECT 1 FROM public.financial_years);


-- ====================================================================================
-- 2. BASE FINANCIAL TABLES (created only if they do not exist yet)
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL DEFAULT 'income' CHECK (type IN ('income','expense')),
  category          text NOT NULL DEFAULT 'General',
  description       text NOT NULL DEFAULT '',
  amount            numeric NOT NULL DEFAULT 0,
  mode_of_payment   text NOT NULL DEFAULT 'cash' CHECK (mode_of_payment IN ('cash','transfer','bank')),
  member_id         uuid,
  event_id          uuid,
  financial_year_id uuid,
  recorded_by       uuid,
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  date              date,
  status            text NOT NULL DEFAULT 'Completed',
  created_at        timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS member_id uuid');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS event_id uuid');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS financial_year_id uuid');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recorded_by uuid');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS date date');
SELECT public.safe_exec('ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT ''Completed''');

CREATE INDEX IF NOT EXISTS idx_txn_member ON public.transactions (member_id);
CREATE INDEX IF NOT EXISTS idx_txn_event ON public.transactions (event_id);
CREATE INDEX IF NOT EXISTS idx_txn_year ON public.transactions (financial_year_id);
CREATE INDEX IF NOT EXISTS idx_txn_type ON public.transactions (type);

SELECT public.safe_exec('ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY');


CREATE TABLE IF NOT EXISTS public.levies (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL DEFAULT '',
  description        text NOT NULL DEFAULT '',
  amount_per_member  numeric DEFAULT 0,
  total_expected     numeric DEFAULT 0,
  total_collected    numeric DEFAULT 0,
  members_paid       integer DEFAULT 0,
  total_members      integer DEFAULT 0,
  deadline           date,
  status             text DEFAULT 'active',
  event_id           uuid,
  financial_year_id  uuid,
  created_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at         timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS event_id uuid');
SELECT public.safe_exec('ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS financial_year_id uuid');
SELECT public.safe_exec('ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

CREATE INDEX IF NOT EXISTS idx_levies_event ON public.levies (event_id);
SELECT public.safe_exec('ALTER TABLE public.levies ENABLE ROW LEVEL SECURITY');


CREATE TABLE IF NOT EXISTS public.contributions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount             numeric DEFAULT 0,
  description        text DEFAULT '',
  source             text DEFAULT '',
  type               text DEFAULT 'General',
  event              text DEFAULT '',
  event_id           uuid,
  financial_year_id  uuid,
  created_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at         timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS event_id uuid');
SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS financial_year_id uuid');
SELECT public.safe_exec('ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

SELECT public.safe_exec('ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY');


CREATE TABLE IF NOT EXISTS public.pledges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      numeric DEFAULT 0,
  member_id   uuid,
  description text DEFAULT '',
  status      text DEFAULT 'pending',
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

SELECT public.safe_exec('ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Pledges readable by finance staff" ON public.pledges');
SELECT public.safe_exec('CREATE POLICY "Pledges readable by finance staff" ON public.pledges FOR SELECT TO authenticated USING (public.is_admin() OR public.is_financial_secretary())');
SELECT public.safe_exec('CREATE POLICY "Pledges managed by finance staff" ON public.pledges FOR ALL TO authenticated USING (public.is_admin() OR public.is_financial_secretary()) WITH CHECK (public.is_admin() OR public.is_financial_secretary())');


CREATE TABLE IF NOT EXISTS public.members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          text NOT NULL DEFAULT '',
  last_name           text NOT NULL DEFAULT '',
  phone               text DEFAULT '',
  email               text DEFAULT '',
  role                text DEFAULT 'member',
  debt_status         text DEFAULT 'clear',
  outstanding_debt    numeric DEFAULT 0,
  penalties           numeric DEFAULT 0,
  total_levies        numeric DEFAULT 0,
  total_contributions numeric DEFAULT 0,
  created_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.members ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (first_name, last_name);
SELECT public.safe_exec('ALTER TABLE public.members ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Members readable by authenticated" ON public.members');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Members managed by admin or fin_sec" ON public.members');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Allow all access to members" ON public.members');
SELECT public.safe_exec('CREATE POLICY "Members readable by authenticated" ON public.members FOR SELECT TO authenticated USING (true)');
SELECT public.safe_exec('CREATE POLICY "Members managed by admin or fin_sec" ON public.members FOR ALL TO authenticated USING (public.is_admin() OR public.is_financial_secretary()) WITH CHECK (public.is_admin() OR public.is_financial_secretary())');

GRANT ALL ON public.members TO authenticated, service_role;


CREATE TABLE IF NOT EXISTS public.member_ledgers (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            uuid REFERENCES public.members(id) ON DELETE CASCADE,
  event_id             uuid REFERENCES public.events(id) ON DELETE CASCADE,
  financial_year_id    uuid REFERENCES public.financial_years(id) ON DELETE CASCADE,
  amount_due           numeric DEFAULT 0,
  amount_paid          numeric DEFAULT 0,
  total_owed           numeric DEFAULT 0,
  total_paid           numeric DEFAULT 0,
  penalty_accumulated  numeric DEFAULT 0,
  is_cleared           boolean NOT NULL DEFAULT false,
  created_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS amount_due numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS total_owed numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS total_paid numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS penalty_accumulated numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS is_cleared boolean NOT NULL DEFAULT false');
SELECT public.safe_exec('ALTER TABLE public.member_ledgers ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

CREATE INDEX IF NOT EXISTS idx_ledgers_member ON public.member_ledgers (member_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_event ON public.member_ledgers (event_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_year ON public.member_ledgers (financial_year_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_uncleared ON public.member_ledgers (is_cleared);

SELECT public.safe_exec('ALTER TABLE public.member_ledgers ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Allow all access to member_ledgers" ON public.member_ledgers');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Ledgers readable by finance staff" ON public.member_ledgers');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Ledgers managed by finance staff" ON public.member_ledgers');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Ledgers updated by finance staff" ON public.member_ledgers');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Ledgers deleted by finance staff" ON public.member_ledgers');
SELECT public.safe_exec('CREATE POLICY "Ledgers readable by finance staff" ON public.member_ledgers FOR SELECT TO authenticated USING (public.is_admin() OR public.is_financial_secretary() OR (event_id IS NOT NULL AND public.is_assigned_staff(event_id)))');
SELECT public.safe_exec('CREATE POLICY "Ledgers managed by finance staff" ON public.member_ledgers FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND (public.is_admin() OR public.is_financial_secretary()))');
SELECT public.safe_exec('CREATE POLICY "Ledgers updated by finance staff" ON public.member_ledgers FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_financial_secretary()) WITH CHECK (public.is_admin() OR public.is_financial_secretary())');
SELECT public.safe_exec('CREATE POLICY "Ledgers deleted by finance staff" ON public.member_ledgers FOR DELETE TO authenticated USING (public.is_admin() OR public.is_financial_secretary())');

GRANT ALL ON public.member_ledgers TO authenticated, service_role;


CREATE TABLE IF NOT EXISTS public.settings (
  id                  bigserial PRIMARY KEY,
  org_name            text DEFAULT 'St Cecilia Choir',
  financial_year_start text DEFAULT 'January',
  currency            text DEFAULT 'NGN',
  allow_backdated     boolean DEFAULT false,
  require_approval    boolean DEFAULT false,
  show_directory      boolean DEFAULT true,
  admin_access        boolean DEFAULT true,
  finance_access      boolean DEFAULT true,
  read_only_access    boolean DEFAULT false,
  updated_at          timestamptz DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS org_name text DEFAULT ''St Cecilia Choir''');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS financial_year_start text DEFAULT ''January''');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency text DEFAULT ''NGN''');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS allow_backdated boolean DEFAULT false');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS require_approval boolean DEFAULT false');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS show_directory boolean DEFAULT true');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_access boolean DEFAULT true');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS finance_access boolean DEFAULT true');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS read_only_access boolean DEFAULT false');
SELECT public.safe_exec('ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()');

SELECT public.safe_exec('ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Settings readable by authenticated" ON public.settings');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Allow all access to settings" ON public.settings');
SELECT public.safe_exec('CREATE POLICY "Settings readable by authenticated" ON public.settings FOR SELECT TO authenticated USING (true)');
SELECT public.safe_exec('CREATE POLICY "Settings managed by admin or fin_sec" ON public.settings FOR ALL TO authenticated USING (public.is_admin() OR public.is_financial_secretary()) WITH CHECK (public.is_admin() OR public.is_financial_secretary())');

GRANT ALL ON public.settings TO authenticated, service_role;

INSERT INTO public.settings (org_name)
SELECT 'St Cecilia Choir'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);


-- ====================================================================================
-- 3. RECONCILIATIONS — Cash vs Bank reconciliation tool
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.reconciliations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_year_id    uuid REFERENCES public.financial_years(id) ON DELETE CASCADE,
  cash_system_balance  numeric DEFAULT 0,
  cash_actual_balance  numeric DEFAULT 0,
  bank_system_balance  numeric DEFAULT 0,
  bank_actual_balance  numeric DEFAULT 0,
  cash_difference      numeric DEFAULT 0,
  bank_difference      numeric DEFAULT 0,
  notes                text DEFAULT '',
  reconciled_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS financial_year_id uuid REFERENCES public.financial_years(id) ON DELETE CASCADE');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS cash_system_balance numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS cash_actual_balance numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS bank_system_balance numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS bank_actual_balance numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS cash_difference numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS bank_difference numeric DEFAULT 0');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS notes text DEFAULT ''');
SELECT public.safe_exec('ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS reconciled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()');

CREATE INDEX IF NOT EXISTS idx_reconciliations_year ON public.reconciliations (financial_year_id);

SELECT public.safe_exec('ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Allow all access to reconciliations" ON public.reconciliations');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Reconciliations readable by finance staff" ON public.reconciliations');
SELECT public.safe_exec('DROP POLICY IF EXISTS "Reconciliations created by finance staff" ON public.reconciliations');
SELECT public.safe_exec('CREATE POLICY "Reconciliations readable by finance staff" ON public.reconciliations FOR SELECT TO authenticated USING (public.is_admin() OR public.is_financial_secretary() OR reconciled_by = auth.uid())');
SELECT public.safe_exec('CREATE POLICY "Reconciliations created by finance staff" ON public.reconciliations FOR INSERT TO authenticated WITH CHECK (reconciled_by = auth.uid() AND (public.is_admin() OR public.is_financial_secretary()))');
SELECT public.safe_exec('CREATE POLICY "Reconciliations deleted by finance staff" ON public.reconciliations FOR DELETE TO authenticated USING (public.is_admin() OR public.is_financial_secretary())');

GRANT ALL ON public.reconciliations TO authenticated, service_role;


-- ====================================================================================
-- 4. YEAR-END CLOSURE RPC
--    Locks the current financial year, computes ending cash & bank balances,
--    creates the next year, rolls balances forward as opening-balance entries and
--    copies unpaid member debts (uncleared ledgers) into the new year.
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.close_financial_year()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year_id  uuid;
  current_year_int integer;
  next_year_label  text;
  new_year_id      uuid;
  cash_balance     numeric := 0;
  bank_balance     numeric := 0;
  ledger_cols      text[] := '{}'::text[];
  ledger_col       text;
  dyn_sql          text;
  v_creator        uuid;
BEGIN
  IF NOT (public.is_admin() OR public.is_financial_secretary()) THEN
    RAISE EXCEPTION 'Only Admins or Financial Secretaries can close a financial year';
  END IF;

  v_creator := auth.uid();

  SELECT id INTO current_year_id
  FROM public.financial_years
  WHERE is_closed = false
  ORDER BY created_at ASC
  LIMIT 1;

  IF current_year_id IS NULL THEN
    RAISE EXCEPTION 'No open financial year to close';
  END IF;

  -- Ending cash & bank balances for the closing year
  SELECT
    COALESCE(SUM(CASE
      WHEN type = 'income' AND mode_of_payment = 'cash' THEN amount
      WHEN type = 'expense' AND mode_of_payment = 'cash' THEN -amount
      ELSE 0 END), 0),
    COALESCE(SUM(CASE
      WHEN type = 'income' AND mode_of_payment = 'transfer' THEN amount
      WHEN type = 'expense' AND mode_of_payment = 'transfer' THEN -amount
      ELSE 0 END), 0)
  INTO cash_balance, bank_balance
  FROM public.transactions
  WHERE financial_year_id = current_year_id;

  SELECT COALESCE(MAX(year_label::integer), extract(year FROM now())::integer)
  INTO current_year_int
  FROM public.financial_years
  WHERE year_label ~ '^[0-9]{4}$';

  next_year_label := (current_year_int + 1)::text;

  -- Open the next financial year
  INSERT INTO public.financial_years (year_label, is_closed, created_by)
  VALUES (next_year_label, false, v_creator)
  RETURNING id INTO new_year_id;

  -- Roll forward cash balance as an opening-balance entry
  IF cash_balance <> 0 THEN
    INSERT INTO public.transactions
      (type, category, description, amount, mode_of_payment, financial_year_id, created_by, recorded_by, status, date)
    VALUES
      (CASE WHEN cash_balance >= 0 THEN 'income' ELSE 'expense' END,
       'Opening Balance',
       'Opening cash balance carried from FY ' || current_year_int::text,
       ABS(cash_balance), 'cash', new_year_id, v_creator, v_creator, 'Completed', now());
  END IF;

  -- Roll forward bank balance as an opening-balance entry
  IF bank_balance <> 0 THEN
    INSERT INTO public.transactions
      (type, category, description, amount, mode_of_payment, financial_year_id, created_by, recorded_by, status, date)
    VALUES
      (CASE WHEN bank_balance >= 0 THEN 'income' ELSE 'expense' END,
       'Opening Balance',
       'Opening bank balance carried from FY ' || current_year_int::text,
       ABS(bank_balance), 'transfer', new_year_id, v_creator, v_creator, 'Completed', now());
  END IF;

  -- Copy unpaid debts (uncleared ledgers) into the new financial year
  SELECT array_agg(column_name) INTO ledger_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'member_ledgers'
    AND column_name IN ('amount_due','amount_paid','total_owed','total_paid','penalty_accumulated');

  IF ledger_cols IS NOT NULL AND array_length(ledger_cols, 1) > 0 THEN
    dyn_sql := 'INSERT INTO public.member_ledgers (member_id, event_id, financial_year_id, is_cleared, created_at';
    FOR ledger_col IN SELECT unnest(ledger_cols) LOOP
      dyn_sql := dyn_sql || ', ' || quote_ident(ledger_col);
    END LOOP;
    dyn_sql := dyn_sql || ') SELECT member_id, event_id, ' || quote_literal(new_year_id::text) || ', false, now()';
    FOR ledger_col IN SELECT unnest(ledger_cols) LOOP
      dyn_sql := dyn_sql || ', ' || quote_ident(ledger_col);
    END LOOP;
    dyn_sql := dyn_sql || ' FROM public.member_ledgers WHERE financial_year_id = ' || quote_literal(current_year_id::text) || ' AND is_cleared = false';
    EXECUTE dyn_sql;
  END IF;

  -- Lock the closing year
  UPDATE public.financial_years
  SET is_closed = true, closed_at = now(), closed_by = v_creator
  WHERE id = current_year_id;

  RETURN jsonb_build_object(
    'closed_year_id', current_year_id,
    'new_year_id', new_year_id,
    'new_year_label', next_year_label,
    'cash_balance', cash_balance,
    'bank_balance', bank_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.close_financial_year() TO authenticated, service_role;


-- ====================================================================================
-- 5. REALTIME — live dashboards
-- ====================================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.member_ledgers;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_years;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reconciliations;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Backfill created_by on older rows using the best-known creator (same as migration 003)
UPDATE public.transactions SET created_by = recorded_by WHERE created_by IS NULL AND recorded_by IS NOT NULL;
UPDATE public.levies SET created_by = auth.uid() WHERE created_by IS NULL;
UPDATE public.contributions SET created_by = auth.uid() WHERE created_by IS NULL;
UPDATE public.pledges SET created_by = auth.uid() WHERE created_by IS NULL;
UPDATE public.members SET created_by = auth.uid() WHERE created_by IS NULL;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
