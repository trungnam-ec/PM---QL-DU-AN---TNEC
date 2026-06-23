import React from 'react';
import { ReportSummary } from '@/components/reports/ReportSummary';

export default function MonthlyReportPage() {
  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Báo cáo tháng</h1>
        <p className="text-sm text-surface-500 mt-0.5">Tổng hợp hoạt động từ đầu tháng đến nay.</p>
      </div>
      <ReportSummary period="month" />
    </div>
  );
}
