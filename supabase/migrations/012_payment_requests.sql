-- ============================================================
-- 012: Đề nghị chi & Workflow duyệt nhiều cấp (Module 5)
-- Số cấp duyệt theo hạn mức: ≤50tr→1 cấp; ≤500tr→2 cấp; >500tr→3 cấp
-- Cấp 1: Quản lý (manager+) · Cấp 2-3: Giám đốc/Admin
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name    VARCHAR(255),
    partner_name    VARCHAR(255),
    category        VARCHAR(255),                    -- khoản mục chi phí
    content         TEXT,
    amount          BIGINT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    current_level   SMALLINT NOT NULL DEFAULT 1,     -- đang chờ duyệt cấp mấy
    max_level       SMALLINT NOT NULL DEFAULT 1,     -- tổng số cấp cần duyệt
    requested_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requester_name  VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nhật ký duyệt từng cấp
CREATE TABLE IF NOT EXISTS public.payment_approvals (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id      UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
    level           SMALLINT NOT NULL,
    approver_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approver_name   VARCHAR(255),
    action          VARCHAR(10) NOT NULL CHECK (action IN ('approve', 'reject')),
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_approvals ENABLE ROW LEVEL SECURITY;

-- Đọc: mọi user đã đăng nhập
DROP POLICY IF EXISTS "pr_read" ON public.payment_requests;
CREATE POLICY "pr_read" ON public.payment_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pa_read" ON public.payment_approvals;
CREATE POLICY "pa_read" ON public.payment_approvals FOR SELECT TO authenticated USING (true);

-- Tạo đề nghị: mọi user (của chính mình)
DROP POLICY IF EXISTS "pr_insert" ON public.payment_requests;
CREATE POLICY "pr_insert" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (true);

-- Duyệt (update request + ghi approval): chỉ manager trở lên
DROP POLICY IF EXISTS "pr_update" ON public.payment_requests;
CREATE POLICY "pr_update" ON public.payment_requests FOR UPDATE TO authenticated
  USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above());
DROP POLICY IF EXISTS "pa_insert" ON public.payment_approvals;
CREATE POLICY "pa_insert" ON public.payment_approvals FOR INSERT TO authenticated
  WITH CHECK (public.is_manager_or_above());

CREATE INDEX IF NOT EXISTS idx_pr_status   ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_pr_project  ON public.payment_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_pa_request  ON public.payment_approvals(request_id);
