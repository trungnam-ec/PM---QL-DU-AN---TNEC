"use client";

import React, { useState, useMemo } from 'react';
import { Search, UserPlus } from 'lucide-react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InviteUserDialog } from './InviteUserDialog';
import { useUsers, useUpdateUser } from '@/lib/hooks/useUsers';
import { useDepartments } from '@/lib/hooks/useDepartments';
import {
  ROLE_CONFIG, POSITION_CONFIG, type UserRole, type Position,
} from '@/lib/permissions';
import { Profile } from '@/types/database';
import { cn } from '@/lib/utils';

const ROLE_KEYS: UserRole[] = ['admin', 'director', 'manager', 'staff'];
const POSITION_KEYS: Position[] = ['director', 'dept_head', 'deputy_head', 'team_lead', 'specialist', 'staff'];

function initials(name: string | null, email: string | null) {
  const base = name || email || 'U';
  return base.charAt(0).toUpperCase();
}

function UserRow({ user, departments }: { user: Profile; departments: { id: string; name: string }[] }) {
  const updateUser = useUpdateUser();

  const setRole = (role: UserRole) =>
    updateUser.mutate({ id: user.id, role });
  const setPosition = (position: Position) =>
    updateUser.mutate({ id: user.id, position });
  const setDepartment = (department_id: string) =>
    updateUser.mutate({ id: user.id, department_id: department_id === 'none' ? null : department_id });
  const toggleActive = () =>
    updateUser.mutate({ id: user.id, is_active: !user.is_active });

  const roleCfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.staff;

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
      {/* User */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
            style={{ background: roleCfg.color }}
          >
            {initials(user.full_name, user.email)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">
              {user.full_name || 'Chưa đặt tên'}
            </p>
            <p className="text-[11.5px] text-slate-400 truncate">{user.email || '—'}</p>
          </div>
        </div>
      </td>

      {/* Phòng ban */}
      <td className="px-3 py-3">
        <Select value={user.department_id ?? 'none'} onValueChange={(v) => setDepartment(v ?? 'none')}>
          <SelectTrigger className="w-full h-8 text-[12.5px] bg-white">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Chưa phân</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Chức danh */}
      <td className="px-3 py-3">
        <Select value={user.position ?? 'staff'} onValueChange={(v) => setPosition((v ?? 'staff') as Position)}>
          <SelectTrigger className="w-full h-8 text-[12.5px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITION_KEYS.map((p) => (
              <SelectItem key={p} value={p}>{POSITION_CONFIG[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Vai trò (quyền) */}
      <td className="px-3 py-3">
        <Select value={user.role} onValueChange={(v) => setRole((v ?? 'staff') as UserRole)}>
          <SelectTrigger
            className="w-full h-8 text-[12.5px] font-semibold border-0"
            style={{ color: roleCfg.color, background: roleCfg.bg }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_KEYS.map((r) => (
              <SelectItem key={r} value={r}>
                <span className="flex flex-col">
                  <span className="font-semibold" style={{ color: ROLE_CONFIG[r].color }}>
                    {ROLE_CONFIG[r].label}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{ROLE_CONFIG[r].desc}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Trạng thái */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={toggleActive}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
          )}
          title={user.is_active ? 'Đang hoạt động' : 'Đã khoá'}
        >
          <span
            className={cn(
              'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
              user.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
            )}
          />
        </button>
      </td>
    </tr>
  );
}

export function UsersTable() {
  const { data: users = [], isLoading } = useUsers();
  const { data: departments = [] } = useDepartments();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">Người dùng & phân quyền</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {filtered.length} người dùng · đổi vai trò để cấp quyền tức thì
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Tìm tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
            <SelectTrigger className="h-8 text-[12.5px] w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {ROLE_KEYS.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-brand-primary hover:bg-brand-primary-hover text-white h-8 text-[12.5px]"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Thêm thành viên
          </Button>
        </div>
      </div>

      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-[12px] font-semibold text-slate-500 px-5 py-2.5">Người dùng</th>
              <th className="text-left text-[12px] font-semibold text-slate-500 px-3 py-2.5 w-[160px]">Phòng ban</th>
              <th className="text-left text-[12px] font-semibold text-slate-500 px-3 py-2.5 w-[150px]">Chức danh</th>
              <th className="text-left text-[12px] font-semibold text-slate-500 px-3 py-2.5 w-[170px]">Vai trò / Quyền</th>
              <th className="text-center text-[12px] font-semibold text-slate-500 px-3 py-2.5 w-[90px]">Hoạt động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={5} className="px-5 py-3">
                    <div className="h-9 bg-slate-100 rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-slate-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <UserRow key={u.id} user={u} departments={departments} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
