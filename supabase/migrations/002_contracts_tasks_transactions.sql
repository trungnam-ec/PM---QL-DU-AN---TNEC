-- ============================================================
-- Migration 002: contracts, tasks, transactions tables
-- ============================================================

-- CONTRACTS
create table if not exists public.contracts (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  type            varchar(2) not null check (type in ('ab', 'bc')),
  contract_number varchar(100) not null,
  partner_name    varchar(255) not null,
  total_value     numeric(20, 2) not null default 0,
  signed_date     date,
  status          varchar(20) not null default 'draft'
                    check (status in ('draft', 'signed', 'active', 'settled', 'liquidated')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.contracts enable row level security;

create policy "Authenticated users can view contracts"
  on public.contracts for select
  to authenticated
  using (true);

create policy "Authenticated users can insert contracts"
  on public.contracts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update contracts"
  on public.contracts for update
  to authenticated
  using (true);

-- TASKS
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           varchar(500) not null,
  description     text,
  status          varchar(20) not null default 'todo'
                    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  assignee_id     uuid references public.profiles(id) on delete set null,
  due_date        date,
  position_order  integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Authenticated users can view tasks"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tasks"
  on public.tasks for update
  to authenticated
  using (true);

create policy "Authenticated users can delete tasks"
  on public.tasks for delete
  to authenticated
  using (true);

-- TRANSACTIONS
create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid references public.projects(id) on delete set null,
  contract_id      uuid references public.contracts(id) on delete set null,
  type             varchar(3) not null check (type in ('in', 'out')),
  amount           numeric(20, 2) not null default 0,
  transaction_date date not null,
  note             text,
  status           varchar(20) not null default 'completed'
                     check (status in ('pending', 'completed', 'cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Authenticated users can view transactions"
  on public.transactions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert transactions"
  on public.transactions for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update transactions"
  on public.transactions for update
  to authenticated
  using (true);

-- Updated_at trigger function (shared)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger contracts_updated_at
  before update on public.contracts
  for each row execute procedure public.handle_updated_at();

create or replace trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create or replace trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index if not exists idx_contracts_project_id on public.contracts(project_id);
create index if not exists idx_contracts_type on public.contracts(type);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_transactions_project_id on public.transactions(project_id);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
