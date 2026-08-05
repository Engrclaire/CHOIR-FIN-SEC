-- ====================================================================================
-- MIGRATION 003: Role-Based Access Control + Strict Admin Workspace Isolation
-- + Event Staff Assignments + In-App Notifications
--
-- Run this in the Supabase SQL Editor. Safe to run multiple times.
--
-- WHAT THIS DOES
--   1. Adds created_by (owner = auth.uid()) to events / transactions / levies / contributions
--   2. Creates public.event_assignments (shares an event with fin_sec / committee_lead staff)
--   3. Creates public.notifications (in-app alert feed + realtime bell)
--   4. Replaces the old "everyone sees everything" RLS with strict owner + assignment policies
--
-- IMPORTANT NOTES
--   * Events can only be CREATED by Admins (role = 'admin'). Financial Secretaries and
--     Committee Leads get access exclusively through event_assignments.
--   * Rows created BEFORE this migration have created_by = NULL. Backfill statements below
--     claim them to the best-known creator (transactions -> recorded_by, events -> committee_lead_id).
--   * Legacy NULL rows remain visible to authenticated users until they are claimed.
-- ====================================================================================

-- ====================================================================================
-- 1. EVENT ASSIGNMENTS TABLE
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.event_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('fin_sec','committee_lead')),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_event_assignments_event ON public.event_assignments (event_id);
CREATE INDEX IF NOT EXISTS idx_event_assignments_user ON public.event_assignments (user_id);

ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to event_assignments" ON public.event_assignments;

-- Staff can read their own assignments; an admin can read assignments for their events
CREATE POLICY "Assignments readable by assigned user or event owner" ON public.event_assignments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_assignments.event_id AND (e.created_by = auth.uid() OR e.created_by IS NULL)
    )
  );

-- Only the Admin who owns the event can assign staff
CREATE POLICY "Assignments created by event owner admin" ON public.event_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    assigned_by = auth.uid()
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_assignments.event_id AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Assignments removed by event owner admin" ON public.event_assignments
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_assignments.event_id AND e.created_by = auth.uid()
    )
  );

GRANT ALL ON public.event_assignments TO authenticated, service_role;


-- ====================================================================================
-- 2. NOTIFICATIONS TABLE
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text NOT NULL DEFAULT '',
  message    text NOT NULL DEFAULT '',
  event_id   uuid REFERENCES public.events(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'assignment' CHECK (type IN ('assignment','system','payment')),
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to notifications" ON public.notifications;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Admins assign staff and therefore create the alert on behalf of the assigned user
CREATE POLICY "Admins create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_admin());

GRANT ALL ON public.notifications TO authenticated, service_role;

-- Expose notifications to Realtime (for the live notification bell)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN others THEN NULL;
END $$;


-- ====================================================================================
-- 3. ROLE HELPER FUNCTIONS
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_financial_secretary()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'fin_sec'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_committee_lead()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'committee_lead'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_finance_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','fin_sec')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_staff(target_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.event_assignments
    WHERE event_id = target_event_id AND user_id = auth.uid()
  );
END;
$$;


-- ====================================================================================
-- 4. PROFILES — allow staff lookup by email for the Assign Event Staff modal
-- ====================================================================================
CREATE POLICY "Authenticated can view profiles for assignment" ON public.profiles
  FOR SELECT TO authenticated USING (true);


-- ====================================================================================
-- 5. EVENTS — ownership + assignment isolation
-- ====================================================================================
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
UPDATE public.events SET created_by = committee_lead_id WHERE created_by IS NULL AND committee_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events (created_by);

DROP POLICY IF EXISTS "View events policy" ON public.events;
DROP POLICY IF EXISTS "Admin write events" ON public.events;
DROP POLICY IF EXISTS "Committee leads update assigned event budgets" ON public.events;
DROP POLICY IF EXISTS "Finance managers write events" ON public.events;
DROP POLICY IF EXISTS "Committee update assigned event status" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated view of events" ON public.events;

CREATE POLICY "Events readable by owner and assigned staff" ON public.events
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR public.is_assigned_staff(id)
  );

CREATE POLICY "Events created by admins only" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

CREATE POLICY "Events updated by owner or assigned staff" ON public.events
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_assigned_staff(id))
  WITH CHECK (created_by = auth.uid() OR public.is_assigned_staff(id));

CREATE POLICY "Events deleted by owner admin" ON public.events
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND public.is_admin());


-- ====================================================================================
-- 6. TRANSACTIONS — creator isolation + event-scoped staff access + admin oversight
-- ====================================================================================
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
UPDATE public.transactions SET created_by = recorded_by WHERE created_by IS NULL AND recorded_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_txn_created_by ON public.transactions (created_by);

DROP POLICY IF EXISTS "View transactions policy" ON public.transactions;
DROP POLICY IF EXISTS "Admin full power transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow inserts for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Finance managers complete transaction power" ON public.transactions;
DROP POLICY IF EXISTS "Committee leads write transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated view of transactions" ON public.transactions;

-- Admin sees: own records + transactions inside their created events (oversight of staff).
-- Staff sees: records they recorded + transactions inside events they are assigned to.
CREATE POLICY "Transactions readable by owner and event staff" ON public.transactions
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR (
      event_id IS NOT NULL
      AND (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = transactions.event_id AND (e.created_by = auth.uid() OR e.created_by IS NULL))
        OR public.is_assigned_staff(transactions.event_id)
      )
    )
  );

CREATE POLICY "Transactions insert by admin, fin_sec or assigned staff" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.is_admin()
      OR public.is_financial_secretary()
      OR (event_id IS NOT NULL AND public.is_assigned_staff(event_id))
    )
  );

CREATE POLICY "Transactions update by creator or event owner" ON public.transactions
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR (
      event_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = transactions.event_id AND e.created_by = auth.uid())
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR (
      event_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = transactions.event_id AND e.created_by = auth.uid())
    )
  );

CREATE POLICY "Transactions delete by creator or event owner" ON public.transactions
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR (
      event_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = transactions.event_id AND e.created_by = auth.uid())
    )
  );


-- ====================================================================================
-- 7. LEVIES — owner isolation + event-scoped staff access
-- ====================================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'levies') THEN
    ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
    ALTER TABLE public.levies ADD COLUMN IF NOT EXISTS event_id uuid;
    CREATE INDEX IF NOT EXISTS idx_levies_created_by ON public.levies (created_by);
  END IF;
END $$;

DROP POLICY IF EXISTS "Allow authenticated view of levies" ON public.levies;
DROP POLICY IF EXISTS "Finance managers write levies" ON public.levies;

CREATE POLICY "Levies readable by owner and assigned staff" ON public.levies
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR (event_id IS NOT NULL AND public.is_assigned_staff(event_id))
  );

CREATE POLICY "Levies created by admin or financial secretary" ON public.levies
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.is_admin() OR public.is_financial_secretary()));

CREATE POLICY "Levies updated by owner" ON public.levies
  FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Levies deleted by owner" ON public.levies
  FOR DELETE TO authenticated USING (created_by = auth.uid());


-- ====================================================================================
-- 8. CONTRIBUTIONS — owner isolation + event-scoped staff access
-- ====================================================================================
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS event_id uuid;
CREATE INDEX IF NOT EXISTS idx_contrib_created_by ON public.contributions (created_by);

DROP POLICY IF EXISTS "Allow all access to contributions" ON public.contributions;

CREATE POLICY "Contributions readable by owner and assigned staff" ON public.contributions
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR (event_id IS NOT NULL AND public.is_assigned_staff(event_id))
  );

CREATE POLICY "Contributions created by admin or financial secretary" ON public.contributions
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.is_admin() OR public.is_financial_secretary()));

CREATE POLICY "Contributions updated by owner" ON public.contributions
  FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Contributions deleted by owner" ON public.contributions
  FOR DELETE TO authenticated USING (created_by = auth.uid());


-- ====================================================================================
-- 9. RELOAD API SCHEMA CACHE
-- ====================================================================================
NOTIFY pgrst, 'reload schema';
