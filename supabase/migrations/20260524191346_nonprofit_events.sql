-- Nonprofit Event Management tables
-- Full event lifecycle: events, ticket types, speakers, agenda, and registrants.
-- NOTE: Separate from /events (post-event intelligence). This backs /event-management.

CREATE TABLE IF NOT EXISTS public.nonprofit_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title       text NOT NULL,
  status      text NOT NULL CHECK (status IN ('Upcoming','Active','Past')) DEFAULT 'Upcoming',
  date        date NOT NULL,
  location    text,
  description text,
  capacity    integer NOT NULL DEFAULT 100,
  fund_raised numeric DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_ticket_types (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  tier      text NOT NULL,
  price     numeric NOT NULL DEFAULT 0,
  capacity  integer NOT NULL DEFAULT 0,
  sold      integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_speakers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  name          text NOT NULL,
  title         text,
  bio           text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_agenda_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  time          text NOT NULL,
  title         text NOT NULL,
  speaker_name  text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_registrants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  ticket_tier   text,
  checked_in    boolean DEFAULT false,
  registered_at timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

-- Enable RLS on all event tables
ALTER TABLE public.nonprofit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_registrants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage nonprofit events" ON public.nonprofit_events;
CREATE POLICY "Authenticated users manage nonprofit events"
  ON public.nonprofit_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event ticket types" ON public.nonprofit_event_ticket_types;
CREATE POLICY "Authenticated users manage event ticket types"
  ON public.nonprofit_event_ticket_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event speakers" ON public.nonprofit_event_speakers;
CREATE POLICY "Authenticated users manage event speakers"
  ON public.nonprofit_event_speakers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event agenda" ON public.nonprofit_event_agenda_items;
CREATE POLICY "Authenticated users manage event agenda"
  ON public.nonprofit_event_agenda_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event registrants" ON public.nonprofit_event_registrants;
CREATE POLICY "Authenticated users manage event registrants"
  ON public.nonprofit_event_registrants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at on events only (child tables don't need it)
DROP TRIGGER IF EXISTS update_nonprofit_events_updated_at ON public.nonprofit_events;
CREATE TRIGGER update_nonprofit_events_updated_at
  BEFORE UPDATE ON public.nonprofit_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
