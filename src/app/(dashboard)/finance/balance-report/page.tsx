"use client";

import React, { useMemo } from 'react';
import { Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useProjectBalances, useCashflowPlans } from '@/lib/hooks/useFinanceHub';
import { cn } from '@/lib/utils';

type Row = {
  project: string;
  openA: number; openB: number;       // tồn đầu: khả dụng / phong tỏa
  thuA: number; thuB: number;         // dự thu
  chiA: number; chiB: number;         // dự chi
};

export default function BalanceReportPage() {
  const { data: balances = [], isLoading } = useProjectBalances();
  const { data: plans = [] } = useCashflowPlans();

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    const get = (name: string) => {
      if (!map.has(name)) map.set(name, { project: name, openA: 0, openB: 0, thuA: 0, thuB: 0, chiA: 0, chiB: 0 });
      return map.get(name)!;
    };
    balances.forEach((b) => {
      const r = get(b.project_name);
      r.openA += b.available_opening; r.openB += b.blocked_opening;
    });
    plans.forEach((p) => {
      const r = get(p.project_name);
      const avail = p.source === 'available';
      if (p.type === 'thu') { if (avail) r.thuA += p.amount; else r.thuB += p.amount; }
      else { if (avail) r.chiA += p.amount; else r.chiB += p.amount; }
    });
    return Array.from(map.values());
  }, [balances, plans]);

  const endA = (r: Row) => r.openA + r.thuA - r.chiA;
  const endB = (r: Row) => r.openB + r.thuB - r.chiB;

  const sum = (f: (r: Row) => number) => rows.reduce((s, r) => s + f(r), 0);

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Báo cáo Cân nguồn</h1>
        <p className="text-sm text-surface-500 mt-0.5">Tồn cuối kỳ = Tồn đầu kỳ + Dự thu − Dự chi, theo từng dự án.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-emerald-600 font-medium">Tồn cuối — Khả dụng</p><p className="text-lg font-bold text-surface-900 mt-1"><CurrencyDisplay amount={sum(endA)} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-amber-600 font-medium">Tồn cuối — Phong tỏa</p><p className="text-lg font-bold text-surface-900 mt-1"><CurrencyDisplay amount={sum(endB)} /></p></Card>
        <Card className="border-brand-primary/30 bg-blue-50/40 shadow-sm p-4"><p className="text-xs text-brand-primary font-medium">Tổng tồn cuối kỳ</p><p className="text-lg font-bold text-brand-primary mt-1"><CurrencyDisplay amount={sum(endA) + sum(endB)} /></p></Card>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5 min-w-[170px]" rowSpan={2}>Dự án</th>
                <th className="text-right font-medium px-3 py-1.5 border-l border-surface-100" colSpan={2}>Tồn đầu kỳ</th>
                <th className="text-right font-medium px-3 py-1.5 border-l border-surface-100" colSpan={2}>Dự thu</th>
                <th className="text-right font-medium px-3 py-1.5 border-l border-surface-100" colSpan={2}>Dự chi</th>
                <th className="text-right font-medium px-5 py-1.5 border-l border-surface-100 bg-blue-50/40" colSpan={2}>Tồn cuối kỳ</th>
              </tr>
              <tr className="border-b border-surface-100 bg-surface-50 text-[10px] text-surface-400 uppercase">
                <th className="text-right font-medium px-3 py-1 border-l border-surface-100">Khả dụng</th><th className="text-right font-medium px-3 py-1">Phong tỏa</th>
                <th className="text-right font-medium px-3 py-1 border-l border-surface-100">Khả dụng</th><th className="text-right font-medium px-3 py-1">Phong tỏa</th>
                <th className="text-right font-medium px-3 py-1 border-l border-surface-100">Khả dụng</th><th className="text-right font-medium px-3 py-1">Phong tỏa</th>
                <th className="text-right font-medium px-3 py-1 border-l border-surface-100 bg-blue-50/40">Khả dụng</th><th className="text-right font-medium px-5 py-1 bg-blue-50/40">Phong tỏa</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12.5px]">
              {isLoading ? (
                <tr><td colSpan={9} className="h-32 text-center text-surface-400 text-sm font-sans">Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center font-sans">
                  <Scale className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Chưa có dữ liệu cân nguồn. Cần nhập Tồn đầu kỳ & Kế hoạch dòng tiền.</p>
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.project} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                  <td className="px-5 py-2.5 font-sans font-medium text-surface-800">{r.project}</td>
                  <td className="px-3 py-2.5 text-right text-surface-600 border-l border-surface-50"><CurrencyDisplay amount={r.openA} /></td>
                  <td className="px-3 py-2.5 text-right text-surface-600"><CurrencyDisplay amount={r.openB} /></td>
                  <td className="px-3 py-2.5 text-right text-emerald-700 border-l border-surface-50"><CurrencyDisplay amount={r.thuA} /></td>
                  <td className="px-3 py-2.5 text-right text-emerald-700"><CurrencyDisplay amount={r.thuB} /></td>
                  <td className="px-3 py-2.5 text-right text-rose-600 border-l border-surface-50"><CurrencyDisplay amount={r.chiA} /></td>
                  <td className="px-3 py-2.5 text-right text-rose-600"><CurrencyDisplay amount={r.chiB} /></td>
                  <td className={cn('px-3 py-2.5 text-right font-semibold border-l border-surface-100 bg-blue-50/30', endA(r) < 0 ? 'text-rose-600' : 'text-surface-900')}><CurrencyDisplay amount={endA(r)} /></td>
                  <td className={cn('px-5 py-2.5 text-right font-semibold bg-blue-50/30', endB(r) < 0 ? 'text-rose-600' : 'text-surface-900')}><CurrencyDisplay amount={endB(r)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
