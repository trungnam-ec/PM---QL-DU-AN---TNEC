import React from 'react';
import { BidPackageTable } from '@/components/bidding/BidPackageTable';

export default function BidPackagesPage() {
  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Danh sách Gói thầu</h1>
        <p className="text-sm text-surface-500 mt-0.5">Toàn bộ gói thầu trong hệ thống, mọi giai đoạn.</p>
      </div>
      <BidPackageTable emptyHint="Chưa có gói thầu nào. Tạo từ trang Pipeline KHĐT." />
    </div>
  );
}
