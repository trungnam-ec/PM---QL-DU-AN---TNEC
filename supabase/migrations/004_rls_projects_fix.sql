-- ============================================================
-- Migration 004: Fix RLS for projects table
-- ============================================================

-- PROJECTS
create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- DEPARTMENTS
create policy "Authenticated users can insert departments"
  on public.departments for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update departments"
  on public.departments for update
  to authenticated
  using (true);

create policy "Authenticated users can delete departments"
  on public.departments for delete
  to authenticated
  using (true);

-- BANK ACCOUNTS
create policy "Authenticated users can insert bank_accounts"
  on public.bank_accounts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update bank_accounts"
  on public.bank_accounts for update
  to authenticated
  using (true);

create policy "Authenticated users can delete bank_accounts"
  on public.bank_accounts for delete
  to authenticated
  using (true);
