"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { STAGE_CONFIG } from '@/components/shared/StatusBadge';
import { useProjects } from '@/lib/hooks/useProjects';
import { useBankAccounts } from '@/lib/hooks/useBankAccounts';
import { useProjectBalances } from '@/lib/hooks/useFinanceHub';
import { usePaymentRequests } from '@/lib/hooks/usePaymentRequests';
import { STATUS_CFG } from '@/lib/paymentWorkflow';
import { Wallet, Lock, FileCheck2, AlertTriangle, Landmark } from 'lucide-react';

export default function DashboardPage() {
  const { data: projects = [] } = useProjects();
  const { data: accounts = [] } = useBankAccounts();
  const { data: balances = [] } = useProjectBalances();
  const { data: requests = [] } = usePaymentRequests();

  const fund = useMemo(() => {
    const avail = accounts.reduce((s, a) => s + (a.available_balance || 0), 0);
    const blocked = accounts.reduce((s, a) => s + (a.blocked_balance || 0), 0);
    // Cơ cấu theo nhánh
    const byBranch = new Map<string, number>();
    accounts.forEach((a) => {
      const k = a.branch || 'Khác';
      byBranch.set(k, (byBranch.get(k) || 0) + (a.available_balance || 0) + (a.blocked_balance || 0));
    });
    return { avail, blocked, byBranch: Array.from(byBranch.entries()).sort((a, b) => b[1] - a[1]) };
  }, [accounts]);

  const negativeProjects = useMemo(
    () => balances.filter((b) => b.available_opening < 0).sort((a, b) => a.available_opening - b.available_opening),
    [balances]
  );

  const pendingReqs = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const pendingTotal = pendingReqs.reduce((s, r) => s + r.amount, 0);

  const pipelineData = useMemo(() => {
    const stages = Object.keys(STAGE_CONFIG);
    return stages.map((stage) => ({ stage, count: projects.filter((p) => p.stage === stage).length }));
  }, [projects]);
  const totalProjects = projects.length;
  const grandFund = fund.avail + fund.blocked;

  const KPIS = [
    { label: 'Quỹ khả dụng', value: fund.avail, icon: Wallet, color: '#059669', bg: '#ECFDF5', href: '/finance/fund' },
    { label: 'Quỹ phong tỏa', value: fund.blocked, icon: Lock, color: '#D97706', bg: '#FFFBEB', href: '/finance/fund' },
    { label: 'Đề nghị chờ duyệt', value: pendingTotal, sub: `${pendingReqs.length} đề nghị`, icon: FileCheck2, color: '#2563EB', bg: '#EFF6FF', href: '/finance/requests' },
    { label: 'Dự án âm quỹ', value: negativeProjects.length, isCount: true, sub: 'cần cân nguồn', icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', href: '/finance/balance-report', warn: true },
  ];

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Tổng quan điều hành</h1>
        <p className="text-sm text-surface-500 mt-0.5">Bức tranh tài chính & dự án toàn hệ thống theo thời gian thực.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k, i) => (
          <Link key={i} href={k.href}>
            <Card className="border-surface-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{k.label}</p>
                    <div className={`text-2xl font-bold mt-2 font-mono leading-none ${k.warn && k.value ? 'text-rose-600' : 'text-surface-900'}`}>
                      {k.isCount ? k.value : <CurrencyDisplay amount={k.value} />}
                    </div>
                    <p className="text-xs mt-2 text-surface-400">{k.sub || ' '}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-3" style={{ background: k.bg }}>
                    <k.icon className="w-4.5 h-4.5" style={{ color: k.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Row 2: Cảnh báo âm quỹ + Cơ cấu quỹ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Cảnh báo dòng tiền — dự án âm quỹ khả dụng
            </h2>
            <Link href="/finance/balance-report" className="text-xs text-brand-primary hover:underline font-medium">Cân nguồn →</Link>
          </div>
          <Card className="border-surface-200 shadow-sm overflow-hidden">
            {negativeProjects.length === 0 ? (
              <div className="py-12 text-center text-sm text-surface-400">Không có dự án nào âm quỹ. 👍</div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                  <th className="text-left font-medium px-5 py-2.5">Dự án</th>
                  <th className="text-left font-medium px-3 py-2.5">Tài khoản</th>
                  <th className="text-right font-medium px-5 py-2.5 w-[170px]">Khả dụng (âm)</th>
                </tr></thead>
                <tbody>
                  {negativeProjects.map((b) => (
                    <tr key={b.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                      <td className="px-5 py-2.5 text-sm font-medium text-surface-800">{b.project_name}</td>
                      <td className="px-3 py-2.5 text-xs text-surface-500 font-mono line-clamp-1">{b.bank_accounts_note || '—'}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-sm font-semibold text-rose-600"><CurrencyDisplay amount={b.available_opening} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-1.5"><Landmark className="w-4 h-4 text-surface-400" /> Cơ cấu quỹ theo nhánh</h2>
          <Card className="border-surface-200 shadow-sm p-5">
            <p className="text-xs text-surface-500">Tổng quỹ</p>
            <p className="text-xl font-bold text-surface-900 font-mono mt-1"><CurrencyDisplay amount={grandFund} /></p>
            <div className="mt-4 space-y-2.5">
              {fund.byBranch.map(([branch, val]) => {
                const pct = grandFund > 0 ? Math.round((val / grandFund) * 100) : 0;
                return (
                  <div key={branch}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-surface-600">{branch}</span>
                      <span className="font-mono text-surface-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                  </div>
                );
              })}
              {fund.byBranch.length === 0 && <p className="text-sm text-surface-400 text-center py-4">Chưa có dữ liệu quỹ.</p>}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Đề nghị chờ duyệt + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-800">Đề nghị chi mới nhất</h2>
            <Link href="/finance/requests" className="text-xs text-brand-primary hover:underline font-medium">Tất cả →</Link>
          </div>
          <Card className="border-surface-200 shadow-sm">
            <CardContent className="p-0 divide-y divide-surface-100">
              {requests.slice(0, 5).map((r) => {
                const sc = STATUS_CFG[r.status];
                return (
                  <div key={r.id} className="p-3.5 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-800 line-clamp-1">{r.content}</p>
                      <p className="text-[11px] text-surface-400 mt-0.5 font-mono">{r.code} · <CurrencyDisplay amount={r.amount} /></p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                  </div>
                );
              })}
              {requests.length === 0 && <div className="py-10 text-center text-sm text-surface-400">Chưa có đề nghị chi nào.</div>}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-surface-800 mb-3">Pipeline Dự án ({totalProjects})</h2>
          <Card className="border-surface-200 shadow-sm p-5">
            <div className="flex w-full h-6 rounded-lg overflow-hidden bg-surface-100 gap-px">
              {pipelineData.map((item, idx) => {
                const config = STAGE_CONFIG[item.stage as keyof typeof STAGE_CONFIG];
                const percentage = (item.count / (totalProjects || 1)) * 100;
                if (item.count === 0) return null;
                return (
                  <div key={idx} style={{ width: `${Math.max(percentage, 2)}%` }} className={`${config.dot} flex items-center justify-center`} title={`${config.label}: ${item.count}`}>
                    {percentage > 6 && <span className="text-[10px] text-white font-semibold">{item.count}</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
              {pipelineData.filter((i) => i.count > 0).map((item, idx) => {
                const config = STAGE_CONFIG[item.stage as keyof typeof STAGE_CONFIG];
                return (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span className="text-surface-500">{config.label}</span>
                    <span className="font-mono font-semibold text-surface-800">{item.count}</span>
                  </div>
                );
              })}
              {totalProjects === 0 && <p className="text-sm text-surface-400">Chưa có dự án.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
