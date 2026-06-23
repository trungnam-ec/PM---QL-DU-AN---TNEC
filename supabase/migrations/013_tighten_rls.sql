-- ============================================================
-- 013: SIẾT RLS theo vai trò cho các bảng nghiệp vụ
--   SELECT  : mọi user đã đăng nhập (giữ nguyên)
--   INSERT/UPDATE : manager trở lên  (is_manager_or_above)
--   DELETE  : admin/director         (is_admin)
-- An toàn: chỉ áp dụng cho bảng thực sự tồn tại (to_regclass).
-- Idempotent: chạy lại nhiều lần được.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'projects','contracts','transactions','tasks',
    'bid_packages','package_stage_logs','departments','bank_accounts'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Bỏ qua nếu bảng chưa được tạo trên DB này
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Bỏ qua: bảng % chưa tồn tại', t;
      CONTINUE;
    END IF;

    -- Gỡ các policy ghi "mở" cũ (đặt theo quy ước "Authenticated users can ...")
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can insert %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete %s" ON public.%I', t, t);

    -- INSERT: manager trở lên
    EXECUTE format('DROP POLICY IF EXISTS "%s_ins" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_ins" ON public.%I FOR INSERT TO authenticated
         WITH CHECK (public.is_manager_or_above())', t, t);

    -- UPDATE: manager trở lên
    EXECUTE format('DROP POLICY IF EXISTS "%s_upd" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_upd" ON public.%I FOR UPDATE TO authenticated
         USING (public.is_manager_or_above()) WITH CHECK (public.is_manager_or_above())', t, t);

    -- DELETE: chỉ admin/director
    EXECUTE format('DROP POLICY IF EXISTS "%s_del" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_del" ON public.%I FOR DELETE TO authenticated
         USING (public.is_admin())', t, t);

    RAISE NOTICE 'Đã siết RLS: %', t;
  END LOOP;
END $$;
