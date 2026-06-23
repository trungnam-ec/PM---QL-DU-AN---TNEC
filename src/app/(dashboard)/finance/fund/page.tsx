"use client";

import React, { useMemo } from 'react';
import { Landmark, Wallet, Lock, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useBankAccounts } from '@/lib/hooks/useBankAccounts';
import { BankAccount } from '@/types/database';

export default function FundPage() {
  const { data: accounts = [], isLoading } = useBankAccounts();

  // Gom nhóm theo nhánh (EC NEW, ĐÀ NẴNG, CAO TỐC, ...)
  const groups = useMemo(() => {
    const map = new Map<string, BankAccount[]>();
    accounts.forEach((a) => {
      const key = a.branch || 'Khác';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return Array.from(map.entries());
  }, [accounts]);

  const totalAvail = accounts.reduce((s, a) => s + (a.available_balance || 0), 0);
  const totalBlocked = accounts.reduce((s, a) => s + (a.blocked_balance || 0), 0);
  const grand = totalAvail + totalBlocked;

  const sumGroup = (list: BankAccount[], k: 'available_balance' | 'blocked_balance') =>
    list.reduce((s, a) => s + (a[k] || 0), 0);

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Số dư quỹ đa ngân hàng</h1>
        <p className="text-sm text-surface-500 mt-0.5">Khả dụng vs Phong tỏa theo từng tài khoản & nhánh quản lý.</p>
      </div>

      {/* KPI tổng */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm p-4">
          <div className="flex items-center gap-2 text-emerald-600"><Wallet className="w-4 h-4" /><span className="text-xs font-medium">Khả dụng</span></div>
          <p className="text-xl font-bold text-surface-900 mt-2"><CurrencyDisplay amount={totalAvail} /></p>
        </Card>
        <Card className="border-surface-200 shadow-sm p-4">
          <div className="flex items-center gap-2 text-amber-600"><Lock className="w-4 h-4" /><span className="text-xs font-medium">Phong tỏa</span></div>
          <p className="text-xl font-bold text-surface-900 mt-2"><CurrencyDisplay amount={totalBlocked} /></p>
        </Card>
        <Card className="border-brand-primary/30 bg-blue-50/40 shadow-sm p-4">
          <div className="flex items-center gap-2 text-brand-primary"><Coins className="w-4 h-4" /><span className="text-xs font-medium">Tổng cộng</span></div>
          <p className="text-xl font-bold text-brand-primary mt-2"><CurrencyDisplay amount={grand} /></p>
        </Card>
      </div>

      {isLoading ? (
        <Card className="border-surface-200 p-8 text-center text-surface-400 text-sm">Đang tải...</Card>
      ) : accounts.length === 0 ? (
        <Card className="border-surface-200 shadow-sm py-16 text-center">
          <Landmark className="w-10 h-10 text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-400">Chưa có tài khoản. Thêm ở mục Tài khoản NH.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map(([branch, list]) => (
            <Card key={branch} className="border-surface-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-surface-400" />
                  <h3 className="text-sm font-bold text-surface-800">{branch}</h3>
                  <span className="text-xs text-surface-400">({list.length} TK)</span>
                </div>
                <div className="flex gap-5 text-xs">
                  <span className="text-emerald-600 font-mono font-semibold"><CurrencyDisplay amount={sumGroup(list, 'available_balance')} /></span>
                  <span className="text-amber-600 font-mono font-semibold"><CurrencyDisplay amount={sumGroup(list, 'blocked_balance')} /></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100 text-xs text-surface-500 uppercase tracking-wider">
                      <th className="text-left font-medium px-5 py-2 w-[140px]">STK</th>
                      <th className="text-left font-medium px-3 py-2 min-w-[240px]">Tên tài khoản</th>
                      <th className="text-right font-medium px-3 py-2 w-[150px]">Khả dụng</th>
                      <th className="text-right font-medium px-3 py-2 w-[150px]">Phong tỏa</th>
                      <th className="text-right font-medium px-5 py-2 w-[160px]">Tổng cộng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => {
                      const total = (a.available_balance || 0) + (a.blocked_balance || 0);
                      return (
                        <tr key={a.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                          <td className="px-5 py-2.5 font-mono text-xs text-surface-500">{a.account_number}</td>
                          <td className="px-3 py-2.5 text-sm text-surface-800">{a.account_name}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm text-emerald-700"><CurrencyDisplay amount={a.available_balance || 0} /></td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm text-amber-700"><CurrencyDisplay amount={a.blocked_balance || 0} /></td>
                          <td className="px-5 py-2.5 text-right font-mono text-sm font-semibold text-surface-900"><CurrencyDisplay amount={total} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
