"use client";

import React, { useMemo, useState } from 'react';
import { Plus, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Can } from '@/components/shared/Can';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useEscrowReleases, useUpsertEscrow } from '@/lib/hooks/useFinanceHub';

const EMPTY = { project_name: '', total_income: '', total_expense: '', deposit: '', fee: '', period_label: '' };

export default function EscrowPage() {
  const { data: rows = [], isLoading } = useEscrowReleases();
  const upsert = useUpsertEscrow();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const num = (s: string) => Number(String(s).replace(/[^\d-]/g, '')) || 0;

  const totals = useMemo(() => ({
    income: rows.reduce((s, r) => s + r.total_income, 0),
    expense: rows.reduce((s, r) => s + r.total_expense, 0),
    deposit: rows.reduce((s, r) => s + r.deposit, 0),
    remaining: rows.reduce((s, r) => s + (r.total_income - r.total_expense - r.deposit), 0),
  }), [rows]);

  const submit = async () => {
    await upsert.mutateAsync({
      project_name: form.project_name,
      total_income: num(form.total_income),
      total_expense: num(form.total_expense),
      deposit: num(form.deposit),
      fee: num(form.fee),
      period_label: form.period_label || null,
    });
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Phong tỏa / Giải tỏa</h1>
          <p className="text-sm text-surface-500 mt-0.5">Giá trị giải tỏa còn lại = Tổng thu − Tổng chi − Ký quỹ.</p>
        </div>
        <Can module="finance" action="edit">
          <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Thêm dòng giải tỏa
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-surface-500">Tổng thu</p><p className="text-lg font-bold text-emerald-600 mt-1"><CurrencyDisplay amount={totals.income} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-surface-500">Tổng chi</p><p className="text-lg font-bold text-rose-600 mt-1"><CurrencyDisplay amount={totals.expense} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-surface-500">Ký quỹ</p><p className="text-lg font-bold text-amber-600 mt-1"><CurrencyDisplay amount={totals.deposit} /></p></Card>
        <Card className="border-brand-primary/30 bg-blue-50/40 shadow-sm p-4"><p className="text-xs text-surface-500">Giải tỏa còn lại</p><p className="text-lg font-bold text-brand-primary mt-1"><CurrencyDisplay amount={totals.remaining} /></p></Card>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5 min-w-[180px]">Dự án</th>
                <th className="text-right font-medium px-3 py-2.5 w-[150px]">Tổng thu</th>
                <th className="text-right font-medium px-3 py-2.5 w-[150px]">Tổng chi</th>
                <th className="text-right font-medium px-3 py-2.5 w-[130px]">Ký quỹ</th>
                <th className="text-right font-medium px-5 py-2.5 w-[160px]">Giải tỏa còn lại</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Lock className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Chưa có dữ liệu giải tỏa.</p>
                </td></tr>
              ) : rows.map((r) => {
                const remaining = r.total_income - r.total_expense - r.deposit;
                return (
                  <tr key={r.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                    <td className="px-5 py-3 text-sm font-medium text-surface-800">{r.project_name}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-emerald-700"><CurrencyDisplay amount={r.total_income} /></td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-rose-600"><CurrencyDisplay amount={r.total_expense} /></td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-amber-600"><CurrencyDisplay amount={r.deposit} /></td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-brand-primary"><CurrencyDisplay amount={remaining} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Thêm dòng giải tỏa</h2>
              <button onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><Label className="text-xs">Tên dự án *</Label><Input value={form.project_name} onChange={set('project_name')} className="h-9 mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Tổng thu</Label><Input value={form.total_income} onChange={set('total_income')} className="h-9 mt-1 font-mono" placeholder="0" /></div>
                <div><Label className="text-xs">Tổng chi</Label><Input value={form.total_expense} onChange={set('total_expense')} className="h-9 mt-1 font-mono" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Ký quỹ</Label><Input value={form.deposit} onChange={set('deposit')} className="h-9 mt-1 font-mono" placeholder="0" /></div>
                <div><Label className="text-xs">Phí dự trù</Label><Input value={form.fee} onChange={set('fee')} className="h-9 mt-1 font-mono" placeholder="0" /></div>
              </div>
              <div><Label className="text-xs">Kỳ báo cáo</Label><Input value={form.period_label} onChange={set('period_label')} className="h-9 mt-1" placeholder="Tuần 2 Tháng 6" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" className="h-9 text-sm" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className="bg-brand-primary text-white h-9 text-sm" disabled={!form.project_name || upsert.isPending} onClick={submit}>
                {upsert.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
