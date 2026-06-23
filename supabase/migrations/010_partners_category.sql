-- ============================================================
-- 010: Mở rộng danh mục Đối tác (contractors) cho 324 đối tác thật
-- Loại hình: Công ty / Cá nhân / Cá nhân (nội bộ) / Cơ quan NN / Ngân hàng
-- ============================================================

ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS category          VARCHAR(50);  -- loại hình pháp lý
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0;  -- số giao dịch (từ Excel)

-- type (ntp/ncc) giữ nguyên; với đối tác import mặc định 'ncc' (nhà cung cấp/khách hàng)
CREATE INDEX IF NOT EXISTS idx_contractors_category ON public.contractors(category);
