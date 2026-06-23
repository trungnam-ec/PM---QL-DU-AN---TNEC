"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BidPackage } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAllBidPackages, useUpdateBidPackageStage } from '@/lib/hooks/useBidPackages';
import Link from 'next/link';
import { FolderGit2, ArrowRight } from 'lucide-react';

const STAGES = [
  { id: 1, title: 'TÌM KIẾM CƠ HỘI', color: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-white' },
  { id: 2, title: 'ĐÁNH GIÁ KHẢ THI', color: 'bg-gradient-to-br from-cyan-500 to-cyan-600', text: 'text-white' },
  { id: 3, title: 'QUYẾT ĐỊNH DỰ THẦU', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', text: 'text-white' },
  { id: 4, title: 'DỰ THẦU', color: 'bg-gradient-to-br from-violet-500 to-violet-600', text: 'text-white' },
  { id: 5, title: 'THƯƠNG THẢO/KÝ HĐ', color: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600', text: 'text-white' },
  { id: 6, title: 'LỰA CHỌN NTP/NCC', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', text: 'text-white' },
  { id: 7, title: 'TRIỂN KHAI THI CÔNG', color: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-white' },
  { id: 8, title: 'QUYẾT TOÁN', color: 'bg-gradient-to-br from-amber-500 to-amber-600', text: 'text-white' },
  { id: 9, title: 'BẢO HÀNH', color: 'bg-gradient-to-br from-orange-500 to-orange-600', text: 'text-white' },
  { id: 10, title: 'THANH LÝ HỢP ĐỒNG', color: 'bg-gradient-to-br from-slate-600 to-slate-700', text: 'text-white' },
];

export function BiddingKanbanBoard() {
  const { data: dbPackages, isLoading } = useAllBidPackages();
  const updatePackageStage = useUpdateBidPackageStage();
  const [packages, setPackages] = useState<BidPackage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (dbPackages) setPackages(dbPackages);
  }, [dbPackages]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = parseInt(destination.droppableId);
    const newPackages = Array.from(packages);
    const idx = newPackages.findIndex((t) => t.id === draggableId);
    if (idx === -1) return;

    const movedPkg = { ...newPackages[idx], current_stage: newStage };
    newPackages.splice(idx, 1);
    
    setPackages([...newPackages, movedPkg]);
    updatePackageStage.mutate({ id: draggableId, stage: newStage });
  };

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  if (!isMounted || isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-6">
        {STAGES.slice(0, 5).map((col) => (
          <div key={col.id} className="w-[280px] shrink-0 bg-slate-100 rounded-2xl h-[400px] animate-pulse" />
        ))}
      </div>
    );
  }

  const renderRow = (startIndex: number, endIndex: number, isFirstRow: boolean) => (
    <div className="grid grid-cols-5 gap-5 relative">
      {STAGES.slice(startIndex, endIndex).map((col, index) => {
        const stagePackages = packages.filter((t) => t.current_stage === col.id);
        
        return (
          <div key={col.id} className="relative flex flex-col group">
            {/* Arrow between columns */}
            {index < 4 && (
              <div className="absolute -right-4 top-10 z-10 w-8 h-8 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}

            <div className="flex flex-col w-full h-full bg-slate-50/50 rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-md">
              {/* HCNS Style Header Block */}
              <div className={cn("px-4 py-4 relative overflow-hidden", col.color, col.text)}>
                <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                  <FolderGit2 className="w-24 h-24" />
                </div>
                <h3 className="text-[12px] font-bold tracking-wider opacity-90 mb-1">{col.title}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black leading-none tracking-tight">{stagePackages.length}</span>
                  <span className="text-[11px] opacity-80 mb-1 font-medium uppercase tracking-wide">Gói thầu</span>
                </div>
              </div>

              <Droppable droppableId={col.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 p-2.5 transition-all duration-300 min-h-[320px] max-h-[320px] overflow-y-auto custom-scrollbar',
                      snapshot.isDraggingOver ? 'bg-slate-100 ring-2 ring-inset ring-brand-primary/20' : ''
                    )}
                  >
                    <div className="flex flex-col gap-2.5 min-h-full">
                      {stagePackages.map((pkg, idx) => (
                        <Draggable key={pkg.id} draggableId={pkg.id} index={idx}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card className={cn(
                                'border-slate-200 bg-white rounded-xl overflow-hidden relative group/card transition-all duration-300 cursor-grab active:cursor-grabbing', 
                                snapshot.isDragging ? 'shadow-2xl border-brand-primary rotate-2 scale-[1.03] z-50 ring-4 ring-brand-primary/10' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300'
                              )}>
                                <CardHeader className="p-3 pb-2">
                                  <Link href={`/bidding/${pkg.id}`} className="block">
                                    <CardTitle className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover/card:text-brand-primary transition-colors" title={pkg.name}>
                                      {pkg.name}
                                    </CardTitle>
                                  </Link>
                                  <CardDescription className="text-[11px] font-mono mt-1 text-slate-500 bg-slate-100 w-fit px-2 py-0.5 rounded-md font-medium">
                                    {pkg.package_code}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <div className="flex flex-col gap-2 mt-2">
                                    {pkg.project && (
                                      <div className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 flex flex-col gap-0.5">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dự án</span>
                                        <span className="text-[11px] text-slate-700 font-semibold line-clamp-1" title={pkg.project.name}>{pkg.project.name}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="text-slate-500 font-medium">Dự toán:</span>
                                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        {pkg.estimated_value ? formatVND(pkg.estimated_value) : 'Đang cập nhật'}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {stagePackages.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center flex-1 opacity-50 min-h-[120px]">
                          <FolderGit2 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                          <p className="text-[11px] font-medium text-slate-400">Kéo thả gói thầu vào đây</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        );
      })}
      
      {/* Downward Arrow connecting the two rows */}
      {isFirstRow && (
        <div className="absolute right-[8%] -bottom-10 flex flex-col items-center justify-center opacity-30 z-0">
           <div className="w-1 h-8 bg-slate-300 rounded-full"></div>
           <svg className="w-6 h-6 text-slate-400 -mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full pb-8">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col gap-14">
          {renderRow(0, 5, true)}
          {renderRow(5, 10, false)}
        </div>
      </DragDropContext>
    </div>
  );
}
