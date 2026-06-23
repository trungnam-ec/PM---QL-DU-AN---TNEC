import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/shared/Can';
import { BiddingKanbanBoard } from '@/components/bidding/BiddingKanbanBoard';

export default function BiddingPipelinePage() {
  return (
    <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Pipeline Đấu thầu (KHĐT)</h1>
          <p className="text-sm text-slate-500 mt-1">Kéo thả Gói thầu qua các giai đoạn để quản lý vòng đời từ cơ hội đến thanh lý HĐ.</p>
        </div>
        <Can module="bidding" action="edit">
          <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Gói thầu Mới
          </Button>
        </Can>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <BiddingKanbanBoard />
      </div>
    </div>
  );
}
