"use client";

import React, { useState } from 'react';
import { useContracts } from '@/lib/hooks/useContracts';
import { ContractFormDialog } from '@/components/contracts/ContractFormDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractTabProps {
  projectId: string;
}

const CONTRACT_STATUS: Record<string, { label: string; className: string }> = {
  draft:      { label: 'Nháp',           className: 'bg-surface-100 text-surface-500' },
  signed:     { label: 'Đã ký',          className: 'bg-blue-50 text-blue-700' },
  active:     { label: 'Đang thực hiện', className: 'bg-emerald-50 text-emerald-700' },
  settled:    { label: 'Đã quyết toán', className: 'bg-violet-50 text-violet-700' },
  liquidated: { label: 'Đã thanh lý',   className: 'bg-surface-100 text-surface-400' },
};

export function ContractTab({ projectId }: ContractTabProps) {
  const { data: contractsAB, isLoading: loadAB } = useContracts('ab', projectId);
  const { data: contractsBC, isLoading: loadBC } = useContracts('bc', projectId);
  const [formType, setFormType] = useState<'ab' | 'bc' | null>(null);

  const renderTable = (contracts: any[] | undefined, isLoading: boolean, type: 'ab' | 'bc') => {
    if (isLoading) {
      return <div className="p-6 text-center text-sm text-surface-400">Đang tải...</div>;
    }

    if (!contracts || contracts.length === 0) {
      return (
        <div className="p-10 text-center">
          <p className="text-sm text-surface-400">Chưa có hợp đồng nào.</p>
          <button
            onClick={() => setFormType(type)}
            className="mt-2 text-sm text-brand-primary hover:underline font-medium"
          >
            + Tạo hợp đồng {type.toUpperCase()}
          </button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-50 hover:bg-surface-50">
            <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Số HĐ</TableHead>
            <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              {type === 'ab' ? 'Chủ đầu tư (Bên A)' : 'Nhà thầu phụ / NCC'}
            </TableHead>
            <TableHead className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Giá trị</TableHead>
            <TableHead className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider w-[110px]">Ngày ký</TableHead>
            <TableHead className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider w-[140px]">Tình trạng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const statusCfg = CONTRACT_STATUS[contract.status] || CONTRACT_STATUS.draft;
            return (
              <TableRow key={contract.id} className="hover:bg-surface-50 border-surface-100">
                <TableCell className="font-mono text-sm font-medium text-brand-primary">
                  {contract.contract_number}
                </TableCell>
                <TableCell className="text-sm text-surface-700">{contract.partner_name}</TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-surface-900">
                  <CurrencyDisplay amount={contract.total_value} />
                </TableCell>
                <TableCell className="text-center text-sm text-surface-500">
                  {contract.signed_date
                    ? new Date(contract.signed_date).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', statusCfg.className)}>
                    {statusCfg.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-5">
      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-surface-100 py-3.5 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-surface-900">
            Hợp đồng A-B — Với Chủ đầu tư
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-surface-200 text-surface-600"
            onClick={() => setFormType('ab')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Thêm
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {renderTable(contractsAB, loadAB, 'ab')}
        </CardContent>
      </Card>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-surface-100 py-3.5 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-surface-900">
            Hợp đồng B-C — Với Nhà thầu phụ / NCC
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-surface-200 text-surface-600"
            onClick={() => setFormType('bc')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Thêm
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {renderTable(contractsBC, loadBC, 'bc')}
        </CardContent>
      </Card>

      {formType && (
        <ContractFormDialog
          open={!!formType}
          onOpenChange={(open) => !open && setFormType(null)}
          type={formType}
          defaultProjectId={projectId}
        />
      )}
    </div>
  );
}
