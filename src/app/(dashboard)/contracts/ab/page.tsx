"use client";

import React, { useState } from 'react';
import { useContracts } from '@/lib/hooks/useContracts';
import { ContractFormDialog } from '@/components/contracts/ContractFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const CONTRACT_STATUS: Record<string, { label: string; className: string }> = {
  draft:      { label: 'Nháp',           className: 'bg-surface-100 text-surface-600 border-surface-200' },
  signed:     { label: 'Đã ký',          className: 'bg-blue-50 text-blue-700 border-blue-200' },
  active:     { label: 'Đang thực hiện', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  settled:    { label: 'Đã quyết toán', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  liquidated: { label: 'Đã thanh lý',   className: 'bg-surface-100 text-surface-500 border-surface-200' },
};

export default function ContractsABPage() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: contracts, isLoading } = useContracts('ab');

  const filtered = contracts?.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch =
      !search ||
      c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
      c.partner_name.toLowerCase().includes(search.toLowerCase()) ||
      c.project?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Hợp đồng A-B</h1>
          <p className="text-sm text-surface-500 mt-0.5">Hợp đồng đầu ra — ký với Chủ đầu tư.</p>
        </div>
        <Can module="contracts" action="edit">
          <Button
            className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo Hợp đồng A-B
          </Button>
        </Can>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-100 bg-surface-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
            <Input
              placeholder="Tìm số HĐ, tên dự án, đối tác..."
              className="pl-9 bg-white h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-full sm:w-48 bg-white h-9 text-sm">
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              {Object.entries(CONTRACT_STATUS).map(([v, { label }]) => (
                <SelectItem key={v} value={v}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50 hover:bg-surface-50">
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[170px]">Số HĐ</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider min-w-[200px]">Dự án</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider min-w-[180px]">Chủ đầu tư (Bên A)</TableHead>
                <TableHead className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Giá trị HĐ</TableHead>
                <TableHead className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider w-[110px]">Ngày ký</TableHead>
                <TableHead className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider w-[150px]">Tình trạng</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-surface-400 text-sm">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : !filtered || filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-surface-400 text-sm">
                    Chưa có hợp đồng A-B nào.{' '}
                    <button onClick={() => setIsFormOpen(true)} className="text-brand-primary hover:underline font-medium">
                      Tạo ngay →
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((contract) => {
                  const statusCfg = CONTRACT_STATUS[contract.status] || CONTRACT_STATUS.draft;
                  return (
                    <TableRow key={contract.id} className="hover:bg-surface-50 border-surface-100 group">
                      <TableCell className="font-mono text-sm font-medium text-brand-primary">
                        {contract.contract_number}
                      </TableCell>
                      <TableCell>
                        <button
                          className="text-sm font-medium text-surface-900 hover:text-brand-primary transition-colors text-left"
                          onClick={() => router.push(`/projects/${contract.project_id}`)}
                        >
                          {contract.project?.name || '—'}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-surface-600">{contract.partner_name}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-surface-900">
                        <CurrencyDisplay amount={contract.total_value} />
                      </TableCell>
                      <TableCell className="text-center text-sm text-surface-500">
                        {contract.signed_date
                          ? new Date(contract.signed_date).toLocaleDateString('vi-VN')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                            statusCfg.className
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-surface-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ContractFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} type="ab" />
    </div>
  );
}
