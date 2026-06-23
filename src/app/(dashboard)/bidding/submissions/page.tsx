import React from 'react';
import { BidPackageTable } from '@/components/bidding/BidPackageTable';
import { SUBMISSION_STAGES } from '@/lib/bidStages';

export default function SubmissionsPage() {
  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Hồ sơ Dự thầu</h1>
        <p className="text-sm text-surface-500 mt-0.5">Gói thầu đang quyết định dự thầu, dự thầu & thương thảo HĐ.</p>
      </div>
      <BidPackageTable stageFilter={SUBMISSION_STAGES} emptyHint="Chưa có hồ sơ dự thầu nào." />
    </div>
  );
}
