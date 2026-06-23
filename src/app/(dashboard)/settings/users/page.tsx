import React from 'react';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import { UsersTable } from '@/components/users/UsersTable';
import { RequireAccess } from '@/components/shared/RequireAccess';

export default function UsersSettingsPage() {
  return (
    <RequireAccess module="users" action="manage">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Phân quyền người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý vai trò, chức danh và phạm vi truy cập của từng thành viên.
          </p>
        </div>

        <PermissionMatrix />
        <UsersTable />
      </div>
    </RequireAccess>
  );
}
