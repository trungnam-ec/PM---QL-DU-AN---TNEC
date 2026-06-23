-- ============================================================
-- 005: Phân quyền người dùng (User Roles & Permissions)
-- Cấp vai trò: admin / director (ngang nhau, toàn quyền)
--              manager (trưởng phòng, phó phòng, tổ trưởng)
--              staff   (nhân viên, chuyên viên)
-- ============================================================

-- 1. Mở rộng bảng profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email        VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone        VARCHAR(30);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position     VARCHAR(50);   -- chức danh: director, dept_head, deputy_head, team_lead, specialist, staff
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active    BOOLEAN DEFAULT true;

-- Chuẩn hoá cột role: admin | director | manager | staff
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'staff';

-- Migrate dữ liệu cũ TRƯỚC khi thêm ràng buộc (role 'user'/NULL/khác -> 'staff')
UPDATE public.profiles
SET role = 'staff'
WHERE role IS NULL OR role NOT IN ('admin', 'director', 'manager', 'staff');

-- Ràng buộc giá trị role hợp lệ (thêm sau khi đã chuẩn hoá dữ liệu)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'director', 'manager', 'staff'));
  END IF;
END $$;

-- Ràng buộc chức danh hợp lệ (cho phép NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_position_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_position_check
      CHECK (position IS NULL OR position IN
        ('director', 'dept_head', 'deputy_head', 'team_lead', 'specialist', 'staff'));
  END IF;
END $$;

-- 2. Đồng bộ email từ auth.users vào profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Hàm kiểm tra quyền quản trị (SECURITY DEFINER tránh đệ quy RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'director')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. RLS: admin/director được cập nhật mọi profile (cấp quyền)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Cập nhật trigger tạo user mới: lưu email + role mặc định staff
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role, is_active)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'staff',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index hỗ trợ lọc
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
