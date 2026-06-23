import React from 'react';
import { cn } from '@/lib/utils';

export type ProjectStage = 
  | 'opportunity' | 'feasibility' | 'bid_decision' | 'bidding' | 'negotiating'
  | 'contracted' | 'selecting_sub' | 'construction' | 'settlement' | 'warranty'
  | 'completed' | 'cancelled';

export const STAGE_CONFIG: Record<ProjectStage, { bg: string; text: string; border: string; dot: string; label: string }> = {
  opportunity:    { bg: 'bg-slate-100',   text: 'text-slate-600',  border: 'border-l-slate-400',  dot: 'bg-slate-400', label: 'Cơ hội' },
  feasibility:    { bg: 'bg-blue-50',     text: 'text-blue-700',   border: 'border-l-blue-400',   dot: 'bg-blue-500', label: 'Đánh giá KT' },
  bid_decision:   { bg: 'bg-violet-50',   text: 'text-violet-700', border: 'border-l-violet-400', dot: 'bg-violet-500', label: 'Quyết định DT' },
  bidding:        { bg: 'bg-indigo-50',   text: 'text-indigo-700', border: 'border-l-indigo-500', dot: 'bg-indigo-500', label: 'Đang dự thầu' },
  negotiating:    { bg: 'bg-cyan-50',     text: 'text-cyan-700',   border: 'border-l-cyan-500',   dot: 'bg-cyan-500', label: 'Thương thảo HĐ' },
  contracted:     { bg: 'bg-teal-50',     text: 'text-teal-700',   border: 'border-l-teal-500',   dot: 'bg-teal-500', label: 'Đã ký HĐ A-B' },
  selecting_sub:  { bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-l-amber-500',  dot: 'bg-amber-500', label: 'Chọn NTP/NCC' },
  construction:   { bg: 'bg-green-50',    text: 'text-green-700',  border: 'border-l-green-500',  dot: 'bg-green-500', label: 'Đang thi công' },
  settlement:     { bg: 'bg-orange-50',   text: 'text-orange-700', border: 'border-l-orange-500', dot: 'bg-orange-500', label: 'Quyết toán' },
  warranty:       { bg: 'bg-yellow-50',   text: 'text-yellow-700', border: 'border-l-yellow-400', dot: 'bg-yellow-400', label: 'Bảo hành' },
  completed:      { bg: 'bg-emerald-50',  text: 'text-emerald-700',border: 'border-l-emerald-500',dot: 'bg-emerald-500', label: 'Hoàn thành' },
  cancelled:      { bg: 'bg-red-50',      text: 'text-red-700',    border: 'border-l-red-400',    dot: 'bg-red-500', label: 'Đã hủy' },
};

interface StatusBadgeProps {
  stage: ProjectStage;
  className?: string;
}

export function StatusBadge({ stage, className }: StatusBadgeProps) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG['opportunity'];
  
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium', config.bg, config.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)}></span>
      {config.label}
    </span>
  );
}
