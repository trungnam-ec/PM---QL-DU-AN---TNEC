import React from 'react';
import { ReportSummary } from '@/components/reports/ReportSummary';

export default function WeeklyReportPage() {
  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Báo cáo tuần</h1>
        <p className="text-sm text-surface-500 mt-0.5">Tổng hợp hoạt động từ đầu tuần đến nay.</p>
      </div>
      <ReportSummary period="week" />
    </div>
  );
}
