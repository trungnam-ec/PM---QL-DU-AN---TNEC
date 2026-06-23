-- ============================================================
-- Migration 003: bid_packages, package_stage_logs and update contracts
-- ============================================================

-- BID PACKAGES
create table if not exists public.bid_packages (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  package_code    varchar(100) not null,
  name            varchar(255) not null,
  package_type    varchar(50) default 'xay_lap', -- 'xay_lap', 'tu_van', 'hang_hoa'
  estimated_value numeric(20, 2) default 0,
  current_stage   integer not null default 1 check (current_stage between 1 and 10),
  -- 1: Tìm kiếm cơ hội
  -- 2: Đánh giá khả thi
  -- 3: Quyết định dự thầu
  -- 4: Dự thầu
  -- 5: Thương thảo/Ký HĐ A-B
  -- 6: Lựa chọn NTP/NCC
  -- 7: Chuẩn bị & Triển khai thi công
  -- 8: Quyết toán
  -- 9: Bảo hành
  -- 10: Thanh lý HĐ
  status          varchar(50) default 'active', -- 'active', 'won', 'lost', 'cancelled', 'completed'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.bid_packages enable row level security;

create policy "Authenticated users can view bid_packages"
  on public.bid_packages for select
  to authenticated
  using (true);

create policy "Authenticated users can insert bid_packages"
  on public.bid_packages for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update bid_packages"
  on public.bid_packages for update
  to authenticated
  using (true);

create policy "Authenticated users can delete bid_packages"
  on public.bid_packages for delete
  to authenticated
  using (true);

-- PACKAGE STAGE LOGS
create table if not exists public.package_stage_logs (
  id              uuid primary key default gen_random_uuid(),
  bid_package_id  uuid not null references public.bid_packages(id) on delete cascade,
  stage_number    integer not null,
  stage_name      varchar(100) not null,
  status          varchar(20) default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  started_at      timestamptz,
  completed_at    timestamptz,
  notes           text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.package_stage_logs enable row level security;

create policy "Authenticated users can view package_stage_logs"
  on public.package_stage_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert package_stage_logs"
  on public.package_stage_logs for insert
  to authenticated
  with check (true);

-- UPDATE CONTRACTS
-- Add bid_package_id to contracts table
alter table public.contracts 
add column if not exists bid_package_id uuid references public.bid_packages(id) on delete set null;

-- Add updated_at trigger for bid_packages
create or replace trigger bid_packages_updated_at
  before update on public.bid_packages
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index if not exists idx_bid_packages_project_id on public.bid_packages(project_id);
create index if not exists idx_bid_packages_stage on public.bid_packages(current_stage);
create index if not exists idx_package_stage_logs_package_id on public.package_stage_logs(bid_package_id);
