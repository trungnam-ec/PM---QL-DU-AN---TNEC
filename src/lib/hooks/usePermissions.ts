"use client";

import { useCurrentProfile } from './useUsers';
import {
  canView as _canView,
  canEdit as _canEdit,
  canManage as _canManage,
  isAdminRole,
  type ModuleKey,
  type UserRole,
} from '@/lib/permissions';

/**
 * Hook lấy quyền của người dùng đang đăng nhập.
 * Trong lúc tải dữ liệu, mặc định coi như 'staff' (quyền thấp nhất)
 * để tránh lộ menu/nút cho vai trò cao hơn khi chưa xác thực xong.
 */
export function usePermissions() {
  const { data: profile, isLoading } = useCurrentProfile();
  const role: UserRole = profile?.role ?? 'staff';

  return {
    role,
    isLoading,
    isAdmin: isAdminRole(role),
    canView: (module: ModuleKey) => _canView(role, module),
    canEdit: (module: ModuleKey) => _canEdit(role, module),
    canManage: (module: ModuleKey) => _canManage(role, module),
  };
}
