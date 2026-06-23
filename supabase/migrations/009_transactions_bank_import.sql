-- ============================================================
-- 009: Mở rộng transactions cho Import sao kê ngân hàng
-- (sheet NGAN HANG: mã GD chống trùng, khách hàng, chứng từ...)
-- ============================================================

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_code VARCHAR(100);  -- Mã giao dịch (dedup)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS partner_name     VARCHAR(255);  -- Khách hàng / chủ TK đối ứng
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS voucher          VARCHAR(20);   -- Chứng từ: BC1 (thu) / BN1 (chi)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS project_name     VARCHAR(255);  -- Tên dự án (fallback khi chưa map project_id)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS source           VARCHAR(20) DEFAULT 'manual'; -- 'manual' | 'bank_import'

-- Chống trùng: 1 mã GD chỉ ghi sổ 1 lần (bỏ qua dòng NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_transaction_code
  ON public.transactions(transaction_code)
  WHERE transaction_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_partner ON public.transactions(partner_name);
