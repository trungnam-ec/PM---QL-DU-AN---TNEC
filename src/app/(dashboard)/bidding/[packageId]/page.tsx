import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { BidPackage, PackageStageLog } from '@/types/database';
import { StageProgress } from '@/components/shared/StageProgress';
import { StatusBadge, ProjectStage, STAGE_CONFIG } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Map stage numbers to string identifiers
const STAGE_MAP: Record<number, ProjectStage> = {
  1: 'opportunity',
  2: 'feasibility',
  3: 'bid_decision',
  4: 'bidding',
  5: 'negotiating',
  6: 'contracted',
  7: 'selecting_sub',
  8: 'construction',
  9: 'settlement',
  10: 'warranty',
  11: 'completed'
};

export default async function BidPackageDetailPage({ params }: { params: { packageId: string } }) {
  const supabase = await createClient();

  const { data: pkg } = await supabase
    .from('bid_packages')
    .select(`
      *,
      project:projects(id, name, project_code, owner_unit)
    `)
    .eq('id', params.packageId)
    .single();

  if (!pkg) {
    notFound();
  }

  const bidPackage = pkg as unknown as BidPackage;
  const currentStageName = STAGE_MAP[bidPackage.current_stage];
  const isComplete = bidPackage.current_stage >= 6; // Đã qua KHĐT
  
  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Sticky Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/bidding">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{bidPackage.name}</h1>
              <StatusBadge stage={currentStageName} />
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              {bidPackage.package_code} • DA: {bidPackage.project?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {bidPackage.current_stage < 5 && (
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm">
              Chuyển Giai Đoạn <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {bidPackage.current_stage === 5 && (
            <Button className="bg-green-600 text-white hover:bg-green-700 shadow-sm">
              Tạo Hợp Đồng A-B & Bàn Giao QLDA
            </Button>
          )}
          {isComplete && (
            <Button variant="outline" className="text-slate-600 border-slate-200" disabled>
              Đã Bàn Giao QLDA
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Chủ đầu tư</p>
                <p className="font-medium text-slate-900">{bidPackage.project?.owner_unit || 'Chưa xác định'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Dự toán gói thầu</p>
                <p className="font-medium text-slate-900 font-mono text-[1.05rem]">{formatVND(bidPackage.estimated_value)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Loại gói thầu</p>
                <p className="font-medium text-slate-900 uppercase">{bidPackage.package_type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                <p className="font-medium text-slate-900 uppercase">{bidPackage.status}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Tài liệu đấu thầu</CardTitle>
                <CardDescription>Các văn bản, hồ sơ liên quan đến giai đoạn này.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Upload className="w-3.5 h-3.5 mr-2" /> Tải lên
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">HoSoDuThau_Final.pdf</p>
                    <p className="text-xs text-slate-500">Tải lên bởi Admin • 2 giờ trước</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-500">Tải xuống</Button>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">BangKeKhoiLuong.xlsx</p>
                    <p className="text-xs text-slate-500">Tải lên bởi N. Văn A • Hôm qua</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-500">Tải xuống</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1 col) */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Tiến độ Gói thầu</CardTitle>
            </CardHeader>
            <CardContent>
              <StageProgress currentStage={currentStageName} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
