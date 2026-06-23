"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useAllBidPackages } from '@/lib/hooks/useBidPackages';
import { getStage } from '@/lib/bidStages';

interface BidPackageTableProps {
  /** Chỉ hiện gói thầu thuộc các giai đoạn này (mặc định: tất cả) */
  stageFilter?: readonly number[];
  emptyHint?: string;
}

export function BidPackageTable({ stageFilter, emptyHint }: BidPackageTableProps) {
  const { data: packages = [], isLoading } = useAllBidPackages();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return packages.filter((p) => {
      const inStage = !stageFilter || stageFilter.includes(p.current_stage);
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.package_code.toLowerCase().includes(search.toLowerCase()) ||
        p.project?.name?.toLowerCase().includes(search.toLowerCase());
      return inStage && matchSearch;
    });
  }, [packages, stageFilter, search]);

  return (
    <Card className="border-surface-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-surface-100 bg-surface-50/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input
            placeholder="Tìm mã gói, tên gói, dự án..."
            className="pl-9 bg-white h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50">
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-2.5 w-[150px]">Mã gói</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 min-w-[220px]">Tên gói thầu</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 min-w-[160px]">Dự án</th>
              <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 w-[160px]">Giá trị dự kiến</th>
              <th className="text-center text-xs font-medium text-surface-500 uppercase tracking-wider px-3 py-2.5 w-[180px]">Giai đoạn</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="h-32 text-center text-surface-400 text-sm">Đang tải dữ liệu...</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <PackageSearch className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">{emptyHint || 'Chưa có gói thầu nào.'}</p>
                </td>
              </tr>
            ) : (
              rows.map((pkg) => {
                const stage = getStage(pkg.current_stage);
                return (
                  <tr key={pkg.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-surface-400 group-hover:text-brand-primary">
                      <Link href={`/bidding/${pkg.id}`}>{pkg.package_code}</Link>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/bidding/${pkg.id}`} className="text-sm font-medium text-surface-900 hover:text-brand-primary transition-colors line-clamp-1">
                        {pkg.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-sm text-surface-600 line-clamp-1">{pkg.project?.name || '—'}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-surface-900">
                      <CurrencyDisplay amount={pkg.estimated_value || 0} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ color: stage.color, background: stage.bg }}
                      >
                        {stage.name}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
