"use client";

import React, { useMemo, useState } from 'react';
import { Search, FolderOpen, TrendingUp, TrendingDown, Wallet, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useTransactions } from '@/lib/hooks/useFinance';
import { Transaction } from '@/types/database';
import { cn } from '@/lib/utils';

const ALL = '__all__';
const projName = (t: Transaction) => t.project?.name || t.project_name || '(Chưa gán dự án)';

export default function CashflowByProjectPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const [selected, setSelected] = useState<string>(ALL);
  const [projSearch, setProjSearch] = useState('');
  const [detailSearch, setDetailSearch] = useState('');

  // Tổng hợp THU/CHI/Số dư theo từng dự án (pivot trái)
  const summary = useMemo(() => {
    const map = new Map<string, { thu: number; chi: number; count: number }>();
    transactions.forEach((t) => {
      if (t.status === 'cancelled') return;
      const k = projName(t);
      if (!map.has(k)) map.set(k, { thu: 0, chi: 0, count: 0 });
      const row = map.get(k)!;
      if (t.type === 'in') row.thu += t.amount; else row.chi += t.amount;
      row.count++;
    });
    return Array.from(map.entries())
      .map(([project, v]) => ({ project, ...v, balance: v.thu - v.chi }))
      .sort((a, b) => b.thu + b.chi - (a.thu + a.chi));
  }, [transactions]);

  const grand = useMemo(() => ({
    thu: summary.reduce((s, r) => s + r.thu, 0),
    chi: summary.reduce((s, r) => s + r.chi, 0),
  }), [summary]);

  const projectList = summary.filter((r) =>
    !projSearch || r.project.toLowerCase().includes(projSearch.toLowerCase()));

  // Chi tiết giao dịch của dự án đang chọn (pivot phải)
  const detail = useMemo(() => {
    return transactions
      .filter((t) => t.status !== 'cancelled')
      .filter((t) => selected === ALL || projName(t) === selected)
      .filter((t) => !detailSearch ||
        (t.note || '').toLowerCase().includes(detailSearch.toLowerCase()) ||
        (t.partner_name || '').toLowerCase().includes(detailSearch.toLowerCase()))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, selected, detailSearch]);

  const detailKpi = useMemo(() => {
    const thu = detail.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const chi = detail.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    return { thu, chi, balance: thu - chi };
  }, [detail]);

  const selectedLabel = selected === ALL ? 'Tất cả dự án' : selected;

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Thu chi thực tế theo dự án</h1>
        <p className="text-sm text-surface-500 mt-0.5">Chọn dự án ở cột trái để xem toàn bộ thu/chi của dự án đó. Dự án mới tự xuất hiện khi có giao dịch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ─── CỘT TRÁI: Slicer dự án + tổng thu/chi ─── */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="border-surface-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 bg-surface-50/50">
              <h2 className="text-sm font-semibold text-surface-800 flex items-center gap-1.5"><Layers className="w-4 h-4 text-surface-400" /> Danh sách dự án</h2>
              <div className="relative mt-2.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <Input placeholder="Lọc dự án..." className="pl-9 bg-white h-8 text-sm" value={projSearch} onChange={(e) => setProjSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {/* Tất cả */}
              <button onClick={() => setSelected(ALL)} className={cn('w-full text-left px-4 py-2.5 border-b border-surface-50 transition-colors', selected === ALL ? 'bg-brand-primary/10' : 'hover:bg-surface-50')}>
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-semibold', selected === ALL ? 'text-brand-primary' : 'text-surface-800')}>Tất cả dự án</span>
                  <span className="text-[11px] text-surface-400">{summary.length} DA</span>
                </div>
                <div className="flex gap-3 mt-1 text-[11px] font-mono">
                  <span className="text-emerald-600"><CurrencyDisplay amount={grand.thu} /></span>
                  <span className="text-rose-500"><CurrencyDisplay amount={grand.chi} /></span>
                </div>
              </button>

              {isLoading ? (
                <p className="px-4 py-8 text-center text-sm text-surface-400">Đang tải...</p>
              ) : projectList.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-surface-400">Chưa có giao dịch. Import sao kê hoặc ghi thu/chi để dự án hiện ra.</p>
              ) : projectList.map((r) => (
                <button key={r.project} onClick={() => setSelected(r.project)} className={cn('w-full text-left px-4 py-2.5 border-b border-surface-50 last:border-0 transition-colors', selected === r.project ? 'bg-brand-primary/10' : 'hover:bg-surface-50')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm font-medium line-clamp-1', selected === r.project ? 'text-brand-primary' : 'text-surface-800')}>{r.project}</span>
                    <span className={cn('text-xs font-mono font-semibold shrink-0', r.balance < 0 ? 'text-rose-600' : 'text-surface-600')}><CurrencyDisplay amount={r.balance} /></span>
                  </div>
                  <div className="flex gap-3 mt-1 text-[11px] font-mono">
                    <span className="text-emerald-600">+<CurrencyDisplay amount={r.thu} /></span>
                    <span className="text-rose-500">−<CurrencyDisplay amount={r.chi} /></span>
                    <span className="text-surface-300">·{r.count} GD</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── CỘT PHẢI: Chi tiết dự án đang chọn ─── */}
        <div className="lg:col-span-8 space-y-4">
          {/* KPI dự án chọn */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-emerald-600"><TrendingUp className="w-4 h-4" /><span className="text-xs font-medium">Thu</span></div><p className="text-lg font-bold text-emerald-600 font-mono mt-1.5"><CurrencyDisplay amount={detailKpi.thu} /></p></Card>
            <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-rose-600"><TrendingDown className="w-4 h-4" /><span className="text-xs font-medium">Chi</span></div><p className="text-lg font-bold text-rose-600 font-mono mt-1.5"><CurrencyDisplay amount={detailKpi.chi} /></p></Card>
            <Card className="border-brand-primary/30 bg-blue-50/40 shadow-sm p-4"><div className="flex items-center gap-1.5 text-brand-primary"><Wallet className="w-4 h-4" /><span className="text-xs font-medium">Số dư còn lại</span></div><p className={cn('text-lg font-bold font-mono mt-1.5', detailKpi.balance < 0 ? 'text-rose-600' : 'text-brand-primary')}><CurrencyDisplay amount={detailKpi.balance} /></p></Card>
          </div>

          <Card className="border-surface-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 bg-surface-50/50 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-surface-800 flex items-center gap-1.5"><FolderOpen className="w-4 h-4 text-brand-primary" /> {selectedLabel} <span className="text-surface-400 font-normal">· {detail.length} GD</span></h2>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <Input placeholder="Tìm nội dung, KH..." className="pl-9 bg-white h-8 text-sm" value={detailSearch} onChange={(e) => setDetailSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-surface-50">
                  <tr className="border-b border-surface-100 text-xs text-surface-500 uppercase tracking-wider">
                    <th className="text-left font-medium px-4 py-2 w-[95px]">Ngày</th>
                    <th className="text-left font-medium px-2 py-2 w-[160px]">Khách hàng</th>
                    <th className="text-left font-medium px-2 py-2 min-w-[260px]">Nội dung</th>
                    <th className="text-right font-medium px-3 py-2 w-[130px]">Thu</th>
                    <th className="text-right font-medium px-4 py-2 w-[130px]">Chi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
                  ) : detail.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center">
                      <FolderOpen className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                      <p className="text-sm text-surface-400">Không có giao dịch cho lựa chọn này.</p>
                    </td></tr>
                  ) : detail.map((t) => (
                    <tr key={t.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                      <td className="px-4 py-2 text-xs font-mono text-surface-500">{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-2 py-2 text-xs text-surface-700 line-clamp-1">{t.partner_name || '—'}</td>
                      <td className="px-2 py-2 text-xs text-surface-600 line-clamp-2 max-w-[420px]" title={t.note || ''}>{t.note || '—'}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-emerald-700">{t.type === 'in' ? <CurrencyDisplay amount={t.amount} /> : ''}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs font-semibold text-rose-600">{t.type === 'out' ? <CurrencyDisplay amount={t.amount} /> : ''}</td>
                    </tr>
                  ))}
                </tbody>
                {detail.length > 0 && (
                  <tfoot className="sticky bottom-0 bg-surface-50 border-t-2 border-surface-200">
                    <tr className="font-mono text-xs font-bold">
                      <td colSpan={3} className="px-4 py-2.5 text-surface-700 font-sans">Tổng cộng</td>
                      <td className="px-3 py-2.5 text-right text-emerald-700"><CurrencyDisplay amount={detailKpi.thu} /></td>
                      <td className="px-4 py-2.5 text-right text-rose-600"><CurrencyDisplay amount={detailKpi.chi} /></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
