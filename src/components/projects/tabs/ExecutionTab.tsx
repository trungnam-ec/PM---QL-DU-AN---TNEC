import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BidPackage } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge, STAGE_CONFIG, ProjectStage } from '@/components/shared/StatusBadge';
import { StageProgress } from '@/components/shared/StageProgress';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, CheckCircle2, ChevronRight, HardHat, FileSignature, Wallet } from 'lucide-react';

export function ExecutionTab({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [packages, setPackages] = useState<BidPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<BidPackage | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('bid_packages')
        .select('*')
        .eq('project_id', projectId)
        .gte('current_stage', 6) // QLDA manages from stage 6 onwards
        .order('current_stage', { ascending: true });
      
      if (data) {
        setPackages(data as any[]);
        if (data.length > 0) setSelectedPackage(data[0] as any);
      }
    }
    fetchPackages();
  }, [projectId]);

  const getStageKey = (stageNum: number): ProjectStage => {
    const STAGE_MAP: Record<number, ProjectStage> = {
      1: 'opportunity', 2: 'feasibility', 3: 'bid_decision', 4: 'bidding',
      5: 'negotiating', 6: 'contracted', 7: 'selecting_sub', 8: 'construction',
      9: 'settlement', 10: 'warranty', 11: 'completed'
    };
    return STAGE_MAP[stageNum] || 'completed';
  };

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-surface-200 bg-white">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
          <HardHat className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-900">Chưa có gói thầu nào trong giai đoạn thi công</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Các gói thầu sẽ xuất hiện ở đây sau khi hoàn tất ký Hợp đồng A-B và bàn giao từ phòng KHĐT.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar: List of active packages under QLDA */}
      <div className="w-full md:w-1/3 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-1">Gói thầu đang triển khai</h3>
        {packages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          const stageKey = getStageKey(pkg.current_stage);
          return (
            <Card 
              key={pkg.id} 
              className={`cursor-pointer transition-all ${isSelected ? 'border-brand-primary ring-1 ring-brand-primary/20 shadow-sm' : 'hover:border-slate-300'}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${STAGE_CONFIG[stageKey].dot}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{pkg.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{pkg.package_code}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-brand-primary' : 'text-slate-300'}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Execution Area */}
      {selectedPackage && (
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedPackage.name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1 font-mono">{selectedPackage.package_code}</p>
                </div>
                <StatusBadge stage={getStageKey(selectedPackage.current_stage)} />
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-primary" /> Tiến trình Gói thầu
                  </h4>
                  <StageProgress currentStage={getStageKey(selectedPackage.current_stage)} />
                  
                  {selectedPackage.current_stage < 11 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <Button className="w-full bg-brand-primary text-white shadow-sm">
                        Chuyển Sang {STAGE_CONFIG[getStageKey(selectedPackage.current_stage + 1)]?.label}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Công tác trọng tâm</h4>
                  
                  {/* Mock content based on stage */}
                  {selectedPackage.current_stage === 6 && (
                     <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                       <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                         <FileSignature className="w-4 h-4" /> Ký HĐ B-C (NTP/NCC)
                       </p>
                       <p className="text-xs text-amber-700">Yêu cầu hoàn thành lựa chọn và ký hợp đồng với nhà thầu phụ trước khi tiến hành thi công.</p>
                       <Button size="sm" variant="outline" className="mt-3 bg-white text-amber-700 border-amber-200 hover:bg-amber-100">Quản lý Hợp đồng B-C</Button>
                     </div>
                  )}

                  {selectedPackage.current_stage === 7 && (
                     <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                       <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                         <HardHat className="w-4 h-4" /> Báo cáo Tiến độ Thi công
                       </p>
                       <p className="text-xs text-green-700">Cập nhật khối lượng hoàn thành, hình ảnh công trường và báo cáo an toàn LĐ định kỳ.</p>
                       <Button size="sm" variant="outline" className="mt-3 bg-white text-green-700 border-green-200 hover:bg-green-100">Cập nhật Tiến độ</Button>
                     </div>
                  )}

                  {selectedPackage.current_stage === 8 && (
                     <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                       <p className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                         <Wallet className="w-4 h-4" /> Hồ sơ Quyết toán
                       </p>
                       <p className="text-xs text-orange-700">Tập hợp hồ sơ hoàn công, nghiệm thu bàn giao và chốt số liệu với CĐT & NTP.</p>
                       <Button size="sm" variant="outline" className="mt-3 bg-white text-orange-700 border-orange-200 hover:bg-orange-100">Chi tiết Quyết toán</Button>
                     </div>
                  )}
                  
                  <div className="mt-4">
                     <h5 className="text-xs font-semibold uppercase text-slate-500 mb-2">Thông báo gần đây</h5>
                     <div className="flex items-start gap-2 text-sm text-slate-600">
                       <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                       <p>Đã nhận bàn giao Gói thầu từ KHĐT vào lúc 09:30 sáng nay.</p>
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
