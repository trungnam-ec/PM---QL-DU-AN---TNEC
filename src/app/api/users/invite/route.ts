import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES = ['admin', 'director', 'manager', 'staff'];

export async function POST(request: NextRequest) {
  // 1. Xác thực người gọi + kiểm tra quyền admin/director
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!me || !['admin', 'director'].includes(me.role)) {
    return NextResponse.json({ error: 'Không có quyền tạo người dùng.' }, { status: 403 });
  }

  // 2. Đọc & kiểm tra dữ liệu
  const body = await request.json();
  const { email, password, full_name, phone, role, position, department_id } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: 'Cần email và mật khẩu.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự.' }, { status: 400 });
  }
  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Vai trò không hợp lệ.' }, { status: 400 });
  }

  // 3. Tạo user bằng service role (auto xác nhận email)
  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || null },
  });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message || 'Không tạo được người dùng.' },
      { status: 400 }
    );
  }

  // 4. Cập nhật profile (trigger đã tạo sẵn dòng role 'staff')
  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      full_name: full_name || null,
      email,
      phone: phone || null,
      role: role || 'staff',
      position: position || null,
      department_id: department_id || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', created.user.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
