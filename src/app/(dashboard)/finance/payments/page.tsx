"use client";

import React, { useMemo, useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useTransactions } from '@/lib/hooks/useFinance';
import { cn } from '@/lib/utils';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Đã thanh toán',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy',         cls: 'bg-surface-100 text-surface-500 border-surface-200' },
};

export default function PaymentsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Thanh toán = các khoản chi (type 'out')
  const payments = useMemo(
    () => transactions.filter((t) => t.type === 'out'),
    [transactions]
  );

  const rows = useMemo(() => payments.filter((p) => {
    const ms = statusFilter === 'all' || p.status === statusFilter;
    const msearch = !search ||
      (p.note || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.project?.name || '').toLowerCase().includes(search.toLowerCase());
    return ms && msearch;
  }), [payments, search, statusFilter]);

  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Thanh toán</h1>
        <p className="text-sm text-surface-500 mt-0.5">Theo dõi các đợt chi / thanh toán cho đối tác.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm p-4">
          <p className="text-xs text-surface-500">Chờ thanh toán</p>
          <p className="text-xl font-bold text-amber-600 mt-1"><CurrencyDisplay amount={totalPending} /></p>
        </Card>
        <Card className="border-surface-200 shadow-sm p-4">
          <p className="text-xs text-surface-500">Đã thanh toán</p>
          <p className="text-xl font-bold text-emerald-600 mt-1"><CurrencyDisplay amount={totalPaid} /></p>
        </Card>
        <Card className="border-surface-200 shadow-sm p-4">
          <p className="text-xs text-surface-500">Số đợt</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{payments.length}</p>
        </Card>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-100 bg-surface-50/50 flex gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
            <Input placeholder="Tìm nội dung, dự án..." className="pl-9 bg-white h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-48 bg-white h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              {Object.entries(STATUS_CFG).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-2.5 w-[110px]">Ngày</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 min-w-[200px]">Nội dung</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 min-w-[160px]">Dự án</th>
                <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 w-[150px]">Số tiền</th>
                <th className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 w-[150px]">Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <CreditCard className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Chưa có khoản thanh toán nào.</p>
                </td></tr>
              ) : rows.map((p) => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG.pending;
                return (
                  <tr key={p.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                    <td className="px-5 py-3 text-sm text-surface-500 font-mono text-xs">{new Date(p.transaction_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-3 py-3 text-sm text-surface-800 line-clamp-1">{p.note || '—'}</td>
                    <td className="px-3 py-3 text-sm text-surface-600 line-clamp-1">{p.project?.name || '—'}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-rose-600">-<CurrencyDisplay amount={p.amount} /></td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', sc.cls)}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
