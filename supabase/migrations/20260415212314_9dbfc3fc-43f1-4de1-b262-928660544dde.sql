
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  subject text not null,
  category text not null,
  description text not null,
  status text not null default 'open',
  admin_notes text
);

-- Validation trigger for category
create or replace function public.validate_support_ticket_category()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.category not in ('Bug Report', 'Feature Request', 'Integration Issue', 'General Question') then
    raise exception 'Invalid category: %', new.category;
  end if;
  return new;
end;
$$;

create trigger validate_support_ticket_category_trigger
  before insert or update on public.support_tickets
  for each row execute function public.validate_support_ticket_category();

-- Validation trigger for status
create or replace function public.validate_support_ticket_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status not in ('open', 'in_progress', 'resolved') then
    raise exception 'Invalid status: %', new.status;
  end if;
  return new;
end;
$$;

create trigger validate_support_ticket_status_trigger
  before insert or update on public.support_tickets
  for each row execute function public.validate_support_ticket_status();

-- Updated_at trigger
create trigger update_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.update_updated_at_column();

-- RLS
alter table public.support_tickets enable row level security;

create policy "Users can create tickets"
  on public.support_tickets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own tickets"
  on public.support_tickets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all tickets"
  on public.support_tickets for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update tickets"
  on public.support_tickets for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Service role bypass"
  on public.support_tickets for all
  to service_role
  using (true)
  with check (true);

-- Index for common queries
create index idx_support_tickets_user_id on public.support_tickets(user_id);
create index idx_support_tickets_status on public.support_tickets(status);
create index idx_support_tickets_created_at on public.support_tickets(created_at desc);
