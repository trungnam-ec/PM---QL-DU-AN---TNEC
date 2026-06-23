import React from 'react';
import { BidPackageTable } from '@/components/bidding/BidPackageTable';
import { OPPORTUNITY_STAGES } from '@/lib/bidStages';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Cơ hội Đấu thầu</h1>
        <p className="text-sm text-surface-500 mt-0.5">Gói thầu đang ở giai đoạn tìm kiếm & đánh giá khả thi.</p>
      </div>
      <BidPackageTable stageFilter={OPPORTUNITY_STAGES} emptyHint="Chưa có cơ hội đấu thầu nào." />
    </div>
  );
}
