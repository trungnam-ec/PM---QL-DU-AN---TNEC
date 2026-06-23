import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BidPackage } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, STAGE_CONFIG, ProjectStage } from '@/components/shared/StatusBadge';
import { FileText, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';

export function BidPackagesTab({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [packages, setPackages] = useState<BidPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('bid_packages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (data) setPackages(data as any[]);
      setIsLoading(false);
    }
    fetchPackages();
  }, [projectId]);

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // Helper to map numeric stage to ProjectStage key
  const getStageKey = (stageNum: number): ProjectStage => {
    const STAGE_MAP: Record<number, ProjectStage> = {
      1: 'opportunity', 2: 'feasibility', 3: 'bid_decision', 4: 'bidding',
      5: 'negotiating', 6: 'contracted', 7: 'selecting_sub', 8: 'construction',
      9: 'settlement', 10: 'warranty', 11: 'completed'
    };
    return STAGE_MAP[stageNum] || 'opportunity';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Danh sách Gói thầu</h2>
          <p className="text-sm text-slate-500">Quản lý các gói thầu thuộc dự án này</p>
        </div>
        <Button className="bg-brand-primary text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm gói thầu
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900">Chưa có gói thầu nào</p>
          <p className="text-sm text-slate-500 mt-1">Bắt đầu bằng cách tạo gói thầu đầu tiên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const stageKey = getStageKey(pkg.current_stage);
            const isQLDA = pkg.current_stage >= 6; // QLDA takeover

            return (
              <Card key={pkg.id} className="relative overflow-hidden shadow-sm">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${STAGE_CONFIG[stageKey].dot}`} />
                <CardHeader className="pl-6 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base line-clamp-1">{pkg.name}</CardTitle>
                      <p className="text-xs font-mono text-slate-500 mt-1">{pkg.package_code}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pl-6 pt-2 pb-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Dự toán:</span>
                      <span className="font-medium text-slate-900">{formatVND(pkg.estimated_value)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Loại:</span>
                      <span className="uppercase text-slate-900 font-medium">{pkg.package_type}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                      <StatusBadge stage={stageKey} />
                      {isQLDA ? (
                        <Link href={`/projects/${projectId}/execution`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Chi tiết
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[10px] uppercase font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Đang bên KHĐT
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
