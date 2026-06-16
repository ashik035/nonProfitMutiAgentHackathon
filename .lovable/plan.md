# Replicate `/events` Hub into Another Lovable Project

This is a copy-paste-ready brief you can drop into your other Lovable project's chat. It captures the exact schema, hooks, routes, and UI structure of the current `/events` page so the target project rebuilds it 1:1.

---

## What `/events` actually is (so you know what you're replicating)

A single tabbed hub at route `/events` (with `/event-management` redirecting to `/events?tab=manage`):

- **Tab 1 — Manage** (`EventLifecycleTab`): full event lifecycle backed by live Supabase tables
  - Create / edit events (title, date, location, capacity, status)
  - Status pills: `Upcoming` / `Active` / `Past`
  - Registrants list with check-in toggle
  - Ticket types, speakers, agenda items per event
- **Tab 2 — Post-Event Intelligence** (`PostEventIntelligenceTab`): engagement scoring + AI follow-up insights (demo data)

Deep-linkable tabs via `?tab=manage | ?tab=post-event`.

## Database (6 tables)

```text
nonprofit_events
  ├── nonprofit_event_ticket_types   (event_id FK)
  ├── nonprofit_event_speakers       (event_id FK, display_order)
  ├── nonprofit_event_agenda_items   (event_id FK, display_order)
  └── nonprofit_event_registrants    (event_id FK, checked_in bool)
```

All tables: RLS enabled, `authenticated`-only policies, `updated_at` trigger, GRANTs for `authenticated` + `service_role`.

## File layout to create in the target project

```text
src/
  pages/EventsHubPage.tsx                       # tabbed shell, reads ?tab=
  components/events/
    EventLifecycleTab.tsx                       # Manage tab
    PostEventIntelligenceTab.tsx                # Post-event tab (demo)
    EventForm.tsx                               # create/edit dialog
    EventCard.tsx, EventDetailPanel.tsx         # list + detail UI
    RegistrantsTable.tsx                        # with check-in toggle
  hooks/useNonprofitEvents.ts                   # all React Query hooks
  lib/cache.ts                                  # queryKeys.nonprofit.events.*
supabase/migrations/<ts>_events_hub.sql         # 6 tables + RLS + GRANTs
```

Add route in the target project's router:
```tsx
<Route path="/events" element={<EventsHubPage />} />
<Route path="/event-management" element={<Navigate to="/events?tab=manage" replace />} />
```

## The prompt to paste into the other Lovable project

> Copy everything inside the fenced block below into the other project's chat. It assumes the target project already has Lovable Cloud (Supabase) + shadcn/ui + React Query + React Router. If not, prepend: "First enable Lovable Cloud."

```text
Build an Events Hub at /events that exactly matches this spec.

ROUTE
- /events  → EventsHubPage with two tabs, deep-linkable via ?tab=manage|post-event
- /event-management → redirect to /events?tab=manage

DATABASE (one migration, RLS on, GRANT to authenticated + service_role, updated_at trigger on each)
- nonprofit_events(id uuid pk, title text not null, description text, date timestamptz not null,
  location text, capacity int, status text check in ('Upcoming','Active','Past') default 'Upcoming',
  cover_image_url text, created_by uuid references auth.users, created_at, updated_at)
- nonprofit_event_ticket_types(id, event_id fk cascade, name text, price numeric, quantity int,
  description text, created_at)
- nonprofit_event_speakers(id, event_id fk cascade, name text, title text, bio text,
  photo_url text, display_order int, created_at)
- nonprofit_event_agenda_items(id, event_id fk cascade, start_time text, title text,
  description text, display_order int, created_at)
- nonprofit_event_registrants(id, event_id fk cascade, name text, email text, ticket_type_id uuid,
  checked_in bool default false, registered_at timestamptz default now(), created_at)
Policy on every table: FOR ALL TO authenticated USING (true) WITH CHECK (true).

HOOKS  (src/hooks/useNonprofitEvents.ts, React Query, typed off Database types)
- useNonprofitEvents({ search?, status? })          → list, filterable
- useNonprofitEventById(id)
- useEventRegistrants(eventId)
- useEventSpeakers(eventId)
- useEventAgendaItems(eventId)
- useEventTicketTypes(eventId)
- useCreateNonprofitEvent, useUpdateNonprofitEvent
- useCreateRegistrant
- useToggleCheckin({ id, eventId, checkedIn })
All mutations invalidate the matching queryKeys and show a shadcn toast on success/error.

UI
- EventsHubPage: <Tabs> with "Manage" and "Post-Event Intelligence". Header: Calendar icon + "Events" + subtitle.
- EventLifecycleTab:
  * Top bar: search input, status filter (All/Upcoming/Active/Past), "New event" button (opens EventForm dialog)
  * Grid of EventCard (title, date formatted, location, capacity, status badge)
  * Click card → side panel/drawer with: event details, edit button, tabs for Registrants / Speakers / Agenda / Tickets
  * Registrants tab: table of name/email/ticket/checked-in, toggle switch per row calls useToggleCheckin
- EventForm: react-hook-form + zod (title required, date required, capacity >= 0, status enum)
- PostEventIntelligenceTab: static demo placeholder ok (engagement score cards + AI follow-up suggestions list)

CONVENTIONS
- shadcn components only (Card, Tabs, Dialog, Sheet, Table, Badge, Button, Input, Select, Switch, Form)
- date-fns format("PPP p") for display
- All colors via semantic tokens from index.css — no hardcoded text-white/bg-black
- Toasts via @/hooks/use-toast
- No edge functions needed
- No auth changes
```

## Steps to actually run it

1. Open the other Lovable project's chat.
2. Paste the prompt block above. Lovable will propose the migration first — approve it.
3. After types regenerate, Lovable builds the page, tab, hooks, and form.
4. Smoke test in the preview:
   - Create an event → appears in list with `Upcoming` status
   - Open it → add a registrant → toggle check-in → state persists on refresh
   - Switch tabs via URL `?tab=post-event` → loads directly

## Optional follow-ups (ask in a second prompt after the base works)

- Add `category` enum column to `nonprofit_events` + filter chip
- Public event detail page (no auth) for sharing
- CSV export of registrants
- Cover image upload to Supabase Storage

## Out of scope (intentionally)

- Stripe / paid tickets (the schema has `price` but no checkout)
- Email sending to registrants
- Calendar (ics) export
