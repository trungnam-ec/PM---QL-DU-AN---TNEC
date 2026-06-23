-- ============================================================
-- 006: Nhà thầu phụ / Nhà cung cấp (NTP / NCC)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contractors (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(20) NOT NULL DEFAULT 'ntp',  -- 'ntp' (thầu phụ) | 'ncc' (cung cấp)
    tax_code        VARCHAR(50),
    field           VARCHAR(255),                         -- lĩnh vực hoạt động
    contact_person  VARCHAR(255),
    phone           VARCHAR(30),
    email           VARCHAR(255),
    address         TEXT,
    rating          SMALLINT DEFAULT 0,                   -- đánh giá 0-5
    is_active       BOOLEAN DEFAULT true,
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT contractors_type_check CHECK (type IN ('ntp', 'ncc')),
    CONSTRAINT contractors_rating_check CHECK (rating BETWEEN 0 AND 5)
);

ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

-- Đọc: mọi user đã đăng nhập
DROP POLICY IF EXISTS "contractors_read" ON public.contractors;
CREATE POLICY "contractors_read" ON public.contractors
  FOR SELECT TO authenticated USING (true);

-- Ghi: chỉ manager trở lên (cần hàm is_admin từ migration 005 + hàm is_manager)
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'director', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "contractors_write" ON public.contractors;
CREATE POLICY "contractors_write" ON public.contractors
  FOR ALL TO authenticated
  USING (public.is_manager_or_above())
  WITH CHECK (public.is_manager_or_above());

CREATE INDEX IF NOT EXISTS idx_contractors_type ON public.contractors(type);
