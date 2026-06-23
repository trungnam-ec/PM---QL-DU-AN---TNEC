"use client";

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, FolderKanban, FileSignature, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useProjects } from '@/lib/hooks/useProjects';
import { useContracts } from '@/lib/hooks/useContracts';
import { useTransactions } from '@/lib/hooks/useFinance';
import { getStage } from '@/lib/bidStages';

function startOf(period: 'week' | 'month') {
  const now = new Date();
  if (period === 'week') {
    const day = now.getDay() || 7;
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() - day + 1);
    return now;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function ReportSummary({ period }: { period: 'week' | 'month' }) {
  const { data: projects = [] } = useProjects();
  const { data: contractsAB = [] } = useContracts('ab');
  const { data: transactions = [] } = useTransactions();

  const from = useMemo(() => startOf(period), [period]);

  const newProjects = projects.filter((p) => new Date(p.created_at) >= from);
  const newContracts = contractsAB.filter((c) => new Date(c.created_at) >= from);
  const periodTx = transactions.filter((t) => new Date(t.transaction_date) >= from);
  const income = periodTx.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const expense = periodTx.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  // Phân bố dự án theo giai đoạn
  const byStage = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => map.set(p.stage, (map.get(p.stage) || 0) + 1));
    return Array.from(map.entries());
  }, [projects]);

  const kpis = [
    { label: 'Dự án mới', value: newProjects.length, icon: FolderKanban, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'HĐ A-B mới', value: newContracts.length, icon: FileSignature, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Thu trong kỳ', value: <CurrencyDisplay amount={income} />, icon: TrendingUp, color: '#059669', bg: '#ECFDF5' },
    { label: 'Chi trong kỳ', value: <CurrencyDisplay amount={expense} />, icon: TrendingDown, color: '#E11D48', bg: '#FFF1F2' },
  ];

  const periodLabel = period === 'week' ? 'tuần này' : 'tháng này';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="border-surface-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <k.icon className="w-4.5 h-4.5" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-3">{k.label}</p>
            <p className="text-lg font-bold text-surface-900 mt-0.5">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cân đối thu chi */}
        <Card className="border-surface-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-800">Cân đối thu chi {periodLabel}</h3>
          </div>
          <div className="space-y-3">
            <BalanceBar label="Thu" amount={income} total={Math.max(income, expense, 1)} color="#059669" />
            <BalanceBar label="Chi" amount={expense} total={Math.max(income, expense, 1)} color="#E11D48" />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center">
            <span className="text-sm text-surface-500">Chênh lệch</span>
            <span className={`text-base font-bold ${income - expense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <CurrencyDisplay amount={income - expense} />
            </span>
          </div>
        </Card>

        {/* Dự án theo giai đoạn */}
        <Card className="border-surface-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Dự án theo giai đoạn</h3>
          {byStage.length === 0 ? (
            <p className="text-sm text-surface-400 py-6 text-center">Chưa có dữ liệu dự án.</p>
          ) : (
            <div className="space-y-2.5">
              {byStage.map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="text-surface-600 capitalize">{stage}</span>
                  <span className="font-semibold text-surface-900 bg-surface-100 px-2 py-0.5 rounded-md text-xs">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function BalanceBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = Math.round((amount / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-surface-500">{label}</span>
        <span className="font-mono font-medium" style={{ color }}><CurrencyDisplay amount={amount} /></span>
      </div>
      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
