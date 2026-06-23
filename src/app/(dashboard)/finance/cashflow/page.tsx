"use client";

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { TransactionFormDialog } from '@/components/finance/TransactionFormDialog';
import { Download, Search, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactions } from '@/lib/hooks/useFinance';
import { cn } from '@/lib/utils';

export default function CashflowDashboardPage() {
  const { data: transactions, isLoading } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<'in' | 'out'>('in');
  const [search, setSearch] = useState('');

  const kpi = useMemo(() => {
    if (!transactions) return { in: 0, out: 0, net: 0 };
    let totalIn = 0, totalOut = 0;
    transactions.forEach((tx) => {
      if (tx.status !== 'cancelled') {
        if (tx.type === 'in') totalIn += tx.amount;
        if (tx.type === 'out') totalOut += tx.amount;
      }
    });
    return { in: totalIn, out: totalOut, net: totalIn - totalOut };
  }, [transactions]);

  const filtered = transactions?.filter((t) => {
    if (!search) return true;
    return (
      t.note?.toLowerCase().includes(search.toLowerCase()) ||
      t.project?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openForm = (type: 'in' | 'out') => {
    setDefaultType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Dòng tiền</h1>
          <p className="text-sm text-surface-500 mt-0.5">Theo dõi thu chi và kiểm soát tài chính tổng thể.</p>
        </div>
        <div className="flex items-center gap-2">
          <Can module="finance" action="edit">
            <Button
              variant="outline"
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-9 text-sm"
              onClick={() => openForm('in')}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ghi Thu
            </Button>
            <Button
              variant="outline"
              className="text-rose-700 border-rose-200 hover:bg-rose-50 h-9 text-sm"
              onClick={() => openForm('out')}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ghi Chi
            </Button>
          </Can>
          <Button variant="outline" className="h-9 text-sm text-surface-600">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Xuất
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm border-t-2 border-t-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Tổng Thu</p>
                <div className="text-2xl font-bold text-emerald-600 font-mono mt-2 leading-none">
                  <CurrencyDisplay amount={kpi.in} />
                </div>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface-200 shadow-sm border-t-2 border-t-rose-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Tổng Chi</p>
                <div className="text-2xl font-bold text-rose-600 font-mono mt-2 leading-none">
                  <CurrencyDisplay amount={kpi.out} />
                </div>
              </div>
              <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4.5 h-4.5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface-200 shadow-sm border-t-2 border-t-brand-primary hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Số dư (Net)</p>
                <div
                  className={cn(
                    'text-2xl font-bold font-mono mt-2 leading-none',
                    kpi.net >= 0 ? 'text-surface-900' : 'text-rose-600'
                  )}
                >
                  <CurrencyDisplay amount={kpi.net} />
                </div>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <div>
        <h2 className="text-sm font-semibold text-surface-800 mb-3">Sổ phụ Giao dịch</h2>
        <Card className="border-surface-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-100 bg-surface-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
              <Input
                placeholder="Tìm nội dung, dự án..."
                className="pl-9 bg-white h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-50 hover:bg-surface-50">
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[110px]">Ngày</TableHead>
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Dự án</TableHead>
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[100px]">Loại</TableHead>
                  <TableHead className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Số tiền</TableHead>
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Nội dung</TableHead>
                  <TableHead className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider w-[120px]">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-surface-400 text-sm">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : !filtered || filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-surface-400 text-sm">
                      Chưa có giao dịch nào.{' '}
                      <button onClick={() => openForm('in')} className="text-brand-primary hover:underline font-medium">
                        Ghi nhận ngay →
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((txn) => (
                    <TableRow key={txn.id} className="hover:bg-surface-50 border-surface-100">
                      <TableCell className="text-sm text-surface-500 font-mono">
                        {new Date(txn.transaction_date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-surface-800">
                        {txn.project?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                            txn.type === 'in'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          )}
                        >
                          {txn.type === 'in' ? '+ Thu' : '− Chi'}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-mono text-sm font-semibold',
                          txn.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
                        )}
                      >
                        <CurrencyDisplay amount={txn.amount} />
                      </TableCell>
                      <TableCell className="text-sm text-surface-500 max-w-[240px] truncate">
                        {txn.note || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs',
                            txn.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : txn.status === 'pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-surface-100 text-surface-500'
                          )}
                        >
                          {txn.status === 'completed' ? 'Hoàn thành' : txn.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <TransactionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultType={defaultType}
      />
    </div>
  );
}
