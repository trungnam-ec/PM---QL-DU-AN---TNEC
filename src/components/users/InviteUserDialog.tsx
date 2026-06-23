"use client";

import React, { useState } from 'react';
import { X, UserPlus, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/lib/hooks/useDepartments';
import {
  ROLE_CONFIG, POSITION_CONFIG, type UserRole, type Position,
} from '@/lib/permissions';

const ROLE_KEYS: UserRole[] = ['admin', 'director', 'manager', 'staff'];
const POSITION_KEYS: Position[] = ['director', 'dept_head', 'deputy_head', 'team_lead', 'specialist', 'staff'];

function randomPassword() {
  return 'TNec@' + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10);
}

const EMPTY = {
  email: '', password: randomPassword(), full_name: '', phone: '',
  role: 'staff' as UserRole, position: 'staff' as Position, department_id: 'none',
};

export function InviteUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: departments = [] } = useDepartments();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          department_id: form.department_id === 'none' ? null : form.department_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

      queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm({ ...EMPTY, password: randomPassword() });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const valid = form.email && form.password.length >= 6;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Thêm thành viên</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Tạo tài khoản mới — thành viên đăng nhập được ngay bằng email + mật khẩu dưới đây.</p>

        <div className="space-y-3">
          <div><Label className="text-xs">Email đăng nhập *</Label><Input type="email" value={form.email} onChange={set('email')} placeholder="nhanvien@trungnam.com" className="h-9 mt-1" /></div>

          <div>
            <Label className="text-xs">Mật khẩu khởi tạo *</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.password} onChange={set('password')} className="h-9 font-mono text-sm" />
              <Button type="button" variant="outline" className="h-9 px-2.5 shrink-0" onClick={() => setForm((f) => ({ ...f, password: randomPassword() }))} title="Tạo mật khẩu mới">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Gửi mật khẩu này cho thành viên, họ tự đổi sau khi đăng nhập.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Họ tên</Label><Input value={form.full_name} onChange={set('full_name')} className="h-9 mt-1" /></div>
            <div><Label className="text-xs">Điện thoại</Label><Input value={form.phone} onChange={set('phone')} className="h-9 mt-1" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Phòng ban</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm((f) => ({ ...f, department_id: v ?? 'none' }))}>
                <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa phân</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Chức danh</Label>
              <Select value={form.position} onValueChange={(v) => setForm((f) => ({ ...f, position: (v ?? 'staff') as Position }))}>
                <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITION_KEYS.map((p) => <SelectItem key={p} value={p}>{POSITION_CONFIG[p].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Vai trò / Quyền</Label>
            <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: (v ?? 'staff') as UserRole }))}>
              <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_KEYS.map((r) => (
                  <SelectItem key={r} value={r}>
                    <span className="flex flex-col">
                      <span className="font-semibold" style={{ color: ROLE_CONFIG[r].color }}>{ROLE_CONFIG[r].label}</span>
                      <span className="text-[10.5px] text-slate-400">{ROLE_CONFIG[r].desc}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" className="h-9 text-sm" onClick={onClose}>Hủy</Button>
          <Button className="bg-brand-primary text-white h-9 text-sm" disabled={!valid || loading} onClick={submit}>
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
