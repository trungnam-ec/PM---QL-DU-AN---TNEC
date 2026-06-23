-- ============================================================
-- 007: TCKT Financial Hub (PH3) — Số dư quỹ, Giải tỏa, Cân nguồn
-- Cấu trúc bám theo file Excel báo cáo KHTC thật của kế toán.
-- ============================================================

-- 1. Bổ sung số dư cho tài khoản ngân hàng (sheet QUỸ)
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS available_balance  BIGINT DEFAULT 0;  -- Số dư khả dụng
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS blocked_balance    BIGINT DEFAULT 0;  -- Số dư phong tỏa
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS is_active          BOOLEAN DEFAULT true;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS balance_updated_at TIMESTAMP WITH TIME ZONE;
-- branch (Nhánh) và project_group đã có sẵn từ migration 001

-- 2. Phong tỏa / Giải tỏa theo dự án (sheet BC Giải tỏa)
CREATE TABLE IF NOT EXISTS public.escrow_releases (
    id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id     UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name   VARCHAR(255) NOT NULL,           -- tên dự án (fallback khi chưa map project_id)
    total_income   BIGINT DEFAULT 0,                -- Tổng thu
    total_expense  BIGINT DEFAULT 0,                -- Tổng chi
    deposit        BIGINT DEFAULT 0,                -- Ký quỹ
    fee            BIGINT DEFAULT 0,                -- Tổng phí dự trù
    note           TEXT,
    period_label   VARCHAR(50),                     -- vd: "Tuần 2 Tháng 6"
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Giá trị giải tỏa còn lại = Tổng thu − Tổng chi − Ký quỹ (tính ở tầng ứng dụng)

-- 3. Kế hoạch dòng tiền (sheet Data kế hoạch) — Dự thu / Dự chi theo dự án × tuần
CREATE TABLE IF NOT EXISTS public.cashflow_plans (
    id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id     UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name   VARCHAR(255) NOT NULL,
    type           VARCHAR(10) NOT NULL,            -- 'thu' | 'chi'
    source         VARCHAR(20) NOT NULL DEFAULT 'available',  -- 'available' (khả dụng) | 'blocked' (phong tỏa)
    amount         BIGINT NOT NULL DEFAULT 0,
    week           SMALLINT,
    month          SMALLINT,
    year           SMALLINT,
    note           TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cashflow_plans_type_check   CHECK (type IN ('thu', 'chi')),
    CONSTRAINT cashflow_plans_source_check CHECK (source IN ('available', 'blocked'))
);

-- 4. Số dư đầu kỳ theo dự án (cho Báo cáo Cân nguồn — Tồn đầu kỳ)
CREATE TABLE IF NOT EXISTS public.project_balances (
    id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id         UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name       VARCHAR(255) NOT NULL,
    available_opening  BIGINT DEFAULT 0,            -- Tồn đầu kỳ - Khả dụng
    blocked_opening    BIGINT DEFAULT 0,            -- Tồn đầu kỳ - Phong tỏa
    period_label       VARCHAR(50),
    bank_accounts_note VARCHAR(255),                -- vd "TK:0190 5801 011"
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS — đọc cho mọi user, ghi cho manager trở lên (dùng is_manager_or_above từ migration 006)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['escrow_releases','cashflow_plans','project_balances'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_read" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s_read" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_write" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s_write" ON public.%I FOR ALL TO authenticated USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above())', t, t);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_escrow_project   ON public.escrow_releases(project_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_project ON public.cashflow_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_period  ON public.cashflow_plans(year, month, week);
