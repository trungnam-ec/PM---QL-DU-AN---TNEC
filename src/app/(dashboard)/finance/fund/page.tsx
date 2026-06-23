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
    <div className="space-y-6 max-w-screen-xl animate-in fade-in duration-300">
      {/* Header section with accent strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Số dư quỹ đa ngân hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Khả dụng vs Phong tỏa theo từng tài khoản & nhánh quản lý trong hệ thống Trungnam E&C.
          </p>
        </div>
      </div>

      {/* KPI Cards section with rich gradients & soft shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Available Balance */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-2.5 text-emerald-700">
            <div className="p-2 bg-emerald-100/80 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Số dư khả dụng</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              <CurrencyDisplay amount={totalAvail} />
            </p>
          </div>
        </div>

        {/* Card 2: Blocked Balance */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="p-2 bg-amber-100/80 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Đang phong tỏa</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              <CurrencyDisplay amount={totalBlocked} />
            </p>
          </div>
        </div>

        {/* Card 3: Total Grand Balance */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-2.5 text-blue-700">
            <div className="p-2 bg-blue-100/80 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Tổng cộng quỹ</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-blue-600 tracking-tight font-mono">
              <CurrencyDisplay amount={grand} />
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-medium">Đang tải thông tin quỹ...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center shadow-sm">
          <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-base font-semibold text-slate-700">Chưa có tài khoản nào</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Vui lòng thêm tài khoản ngân hàng mới tại mục <strong>Tài khoản NH</strong> để hệ thống bắt đầu thống kê.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([branch, list]) => {
            const grAvail = sumGroup(list, 'available_balance');
            const grBlocked = sumGroup(list, 'blocked_balance');
            const grTotal = grAvail + grBlocked;

            return (
              <div key={branch} className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
                {/* Header of group */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {branch}
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-600 rounded-full">
                          {list.length} TK
                        </span>
                      </h3>
                    </div>
                  </div>
                  
                  {/* Branch aggregate info using pill design */}
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-white border border-slate-100 px-3 py-1.5 rounded-xl font-mono">
                    <span className="text-slate-500">Khả dụng: <strong className="text-emerald-700 font-bold"><CurrencyDisplay amount={grAvail} /></strong></span>
                    <span className="text-slate-200">|</span>
                    <span className="text-slate-500">Phong tỏa: <strong className="text-amber-700 font-bold"><CurrencyDisplay amount={grBlocked} /></strong></span>
                    <span className="text-slate-200">|</span>
                    <span className="text-slate-800 font-extrabold">Tổng: <CurrencyDisplay amount={grTotal} /></span>
                  </div>
                </div>

                {/* Account list table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30 text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                        <th className="px-6 py-3 w-[160px]">Số tài khoản</th>
                        <th className="px-4 py-3 min-w-[280px]">Tên tài khoản</th>
                        <th className="px-4 py-3 text-right w-[180px]">Khả dụng</th>
                        <th className="px-4 py-3 text-right w-[180px]">Phong tỏa</th>
                        <th className="px-6 py-3 text-right w-[190px]">Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((a) => {
                        const total = (a.available_balance || 0) + (a.blocked_balance || 0);
                        return (
                          <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors duration-150">
                            <td className="px-6 py-3.5 font-mono text-xs text-slate-500 font-medium">{a.account_number}</td>
                            <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{a.account_name}</td>
                            <td className="px-4 py-3.5 text-right font-mono text-sm font-bold text-emerald-600"><CurrencyDisplay amount={a.available_balance || 0} /></td>
                            <td className="px-4 py-3.5 text-right font-mono text-sm font-bold text-amber-600"><CurrencyDisplay amount={a.blocked_balance || 0} /></td>
                            <td className="px-6 py-3.5 text-right font-mono text-sm font-black text-slate-900 bg-slate-50/20"><CurrencyDisplay amount={total} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

