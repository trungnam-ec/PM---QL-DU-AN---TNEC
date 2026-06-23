"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { ModuleKey } from '@/lib/permissions';

interface RequireAccessProps {
  module: ModuleKey;
  action?: 'view' | 'edit' | 'manage';
  children: React.ReactNode;
}

/**
 * Bảo vệ cả trang: nếu không đủ quyền sẽ hiển thị thông báo từ chối
 * thay vì nội dung. Dùng bọc nội dung trang cần kiểm soát truy cập.
 */
export function RequireAccess({ module, action = 'view', children }: RequireAccessProps) {
  const { canView, canEdit, canManage, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-brand-primary animate-spin" />
      </div>
    );
  }

  const allowed =
    action === 'view' ? canView(module)
    : action === 'manage' ? canManage(module)
    : canEdit(module);

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Không có quyền truy cập</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Bạn không được cấp quyền vào khu vực này. Vui lòng liên hệ Quản trị viên nếu cần.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
