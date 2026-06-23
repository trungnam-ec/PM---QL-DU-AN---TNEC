"use client";

import React from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { ModuleKey } from '@/lib/permissions';

type Action = 'view' | 'edit' | 'manage';

interface CanProps {
  module: ModuleKey;
  /** Mức quyền tối thiểu cần có. Mặc định 'edit'. */
  action?: Action;
  children: React.ReactNode;
  /** Hiển thị thay thế khi không đủ quyền (mặc định ẩn hẳn) */
  fallback?: React.ReactNode;
}

/**
 * Bọc quanh nút/khu vực cần kiểm soát quyền.
 * <Can module="finance" action="edit"><Button>Thêm</Button></Can>
 */
export function Can({ module, action = 'edit', children, fallback = null }: CanProps) {
  const { canView, canEdit, canManage } = usePermissions();

  const allowed =
    action === 'view' ? canView(module)
    : action === 'manage' ? canManage(module)
    : canEdit(module);

  return <>{allowed ? children : fallback}</>;
}
