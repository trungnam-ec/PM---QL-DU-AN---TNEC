"use client";

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/shared/Can';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import {
  useCashflowPlans, useUpsertCashflowPlan, useDeleteCashflowPlan, useProjectBalances,
} from '@/lib/hooks/useFinanceHub';
import { useProjects } from '@/lib/hooks/useProjects';
import { cn } from '@/lib/utils';

const now = new Date();
const EMPTY = {
  project_name: '', type: 'thu' as 'thu' | 'chi', source: 'available' as 'available' | 'blocked',
  amount: '', week: String(2), month: String(now.getMonth() + 1), year: String(now.getFullYear()), note: '',
};

export default function CashflowPlanPage() {
  const { data: plans = [], isLoading } = useCashflowPlans();
  const { data: balances = [] } = useProjectBalances();
  const { data: projects = [] } = useProjects();
  const upsert = useUpsertCashflowPlan();
  const del = useDeleteCashflowPlan();
  const [form, setForm] = useState(EMPTY);

  // Danh sách dự án: ưu tiên tên trong Cân nguồn (để khớp), bổ sung từ danh mục dự án
  const projectOptions = useMemo(() => {
    const s = new Set<string>();
    balances.forEach((b) => s.add(b.project_name));
    projects.forEach((p) => s.add(p.name));
    plans.forEach((p) => s.add(p.project_name));
    return Array.from(s).sort();
  }, [balances, projects, plans]);

  const num = (s: string) => Number(String(s).replace(/[^\d-]/g, '')) || 0;

  const totals = useMemo(() => ({
    thu: plans.filter((p) => p.type === 'thu').reduce((s, p) => s + p.amount, 0),
    chi: plans.filter((p) => p.type === 'chi').reduce((s, p) => s + p.amount, 0),
  }), [plans]);

  const add = async () => {
    if (!form.project_name || num(form.amount) <= 0) return;
    await upsert.mutateAsync({
      project_name: form.project_name,
      project_id: projects.find((p) => p.name === form.project_name)?.id ?? null,
      type: form.type, source: form.source, amount: num(form.amount),
      week: num(form.week) || null, month: num(form.month) || null, year: num(form.year) || null,
      note: form.note || null,
    });
    setForm({ ...EMPTY, project_name: form.project_name, week: form.week, month: form.month, year: form.year });
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Kế hoạch dòng tiền</h1>
        <p className="text-sm text-surface-500 mt-0.5">Nhập Dự thu / Dự chi theo dự án × tuần → Báo cáo Cân nguồn tự tính Tồn cuối kỳ.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-emerald-600"><TrendingUp className="w-4 h-4" /><span className="text-xs font-medium">Tổng Dự thu</span></div><p className="text-lg font-bold text-surface-900 mt-1.5"><CurrencyDisplay amount={totals.thu} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-rose-600"><TrendingDown className="w-4 h-4" /><span className="text-xs font-medium">Tổng Dự chi</span></div><p className="text-lg font-bold text-surface-900 mt-1.5"><CurrencyDisplay amount={totals.chi} /></p></Card>
        <Card className="border-brand-primary/30 bg-blue-50/40 shadow-sm p-4"><div className="flex items-center gap-1.5 text-brand-primary"><CalendarRange className="w-4 h-4" /><span className="text-xs font-medium">Chênh lệch</span></div><p className="text-lg font-bold text-brand-primary mt-1.5"><CurrencyDisplay amount={totals.thu - totals.chi} /></p></Card>
      </div>

      {/* Form nhập nhanh */}
      <Can module="finance" action="edit">
        <Card className="border-surface-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <Label className="text-xs">Dự án *</Label>
              <Select value={form.project_name} onValueChange={(v) => setForm((f) => ({ ...f, project_name: v ?? '' }))}>
                <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue placeholder="Chọn dự án" /></SelectTrigger>
                <SelectContent>{projectOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Loại *</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? 'thu') as 'thu' | 'chi' }))}>
                <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="thu">Dự thu</SelectItem><SelectItem value="chi">Dự chi</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Nguồn *</Label>
              <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: (v ?? 'available') as 'available' | 'blocked' }))}>
                <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="available">Khả dụng</SelectItem><SelectItem value="blocked">Phong tỏa</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Số tiền *</Label>
              <Input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-9 mt-1 font-mono" />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Tuần</Label>
              <Input value={form.week} onChange={(e) => setForm((f) => ({ ...f, week: e.target.value }))} className="h-9 mt-1" />
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Tháng</Label>
              <Input value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} className="h-9 mt-1" />
            </div>
            <div className="md:col-span-1">
              <Button className="bg-brand-primary text-white h-9 w-full text-sm" disabled={upsert.isPending} onClick={add}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </Can>

      {/* Bảng kế hoạch */}
      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5 min-w-[180px]">Dự án</th>
                <th className="text-center font-medium px-3 py-2.5 w-[80px]">Loại</th>
                <th className="text-left font-medium px-3 py-2.5 w-[110px]">Nguồn</th>
                <th className="text-center font-medium px-3 py-2.5 w-[110px]">Tuần/Tháng</th>
                <th className="text-left font-medium px-3 py-2.5 min-w-[160px]">Ghi chú</th>
                <th className="text-right font-medium px-3 py-2.5 w-[150px]">Số tiền</th>
                <th className="w-[50px]" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <CalendarRange className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Chưa có kế hoạch nào. Nhập ở form phía trên.</p>
                </td></tr>
              ) : plans.map((p) => (
                <tr key={p.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 group">
                  <td className="px-5 py-2.5 text-sm font-medium text-surface-800">{p.project_name}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold', p.type === 'thu' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                      {p.type === 'thu' ? 'THU' : 'CHI'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-surface-600">{p.source === 'available' ? 'Khả dụng' : 'Phong tỏa'}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-surface-500 font-mono">{p.week ? `T${p.week}` : '—'}/{p.month ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-surface-600 line-clamp-1">{p.note || '—'}</td>
                  <td className={cn('px-3 py-2.5 text-right font-mono text-sm font-semibold', p.type === 'thu' ? 'text-emerald-700' : 'text-rose-600')}>
                    {p.type === 'thu' ? '+' : '-'}<CurrencyDisplay amount={p.amount} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Can module="finance" action="edit">
                      <button onClick={() => del.mutate(p.id)} className="text-surface-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Can>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
