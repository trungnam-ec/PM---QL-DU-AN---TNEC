import React from 'react';
import { ProjectStage, STAGE_CONFIG } from './StatusBadge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageProgressProps {
  currentStage: ProjectStage;
}

const STAGES_ORDER: ProjectStage[] = [
  'opportunity', 'feasibility', 'bid_decision', 'bidding', 'negotiating',
  'contracted', 'selecting_sub', 'construction', 'settlement', 'warranty', 'completed'
];

export function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = STAGES_ORDER.indexOf(currentStage);

  return (
    <div className="flex flex-col">
      {STAGES_ORDER.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const config = STAGE_CONFIG[stage];

        return (
          <div key={stage} className="flex items-start gap-4 relative">
            {/* Connecting Line */}
            {index < STAGES_ORDER.length - 1 && (
              <div 
                className={cn(
                  "absolute left-[11px] top-7 bottom-[-10px] w-0.5",
                  index < currentIndex ? config.bg.replace('bg-', 'bg-').replace('-50', '-500') : "bg-surface-200"
                )}
              />
            )}
            
            {/* Step Icon/Dot */}
            <div className="relative z-10 flex flex-col items-center mt-1">
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 text-white text-xs shrink-0",
                  isDone 
                    ? config.bg.replace('bg-', 'bg-').replace('-50', '-500') + " border-transparent" 
                    : isCurrent
                      ? "border-brand-primary bg-white ring-4 ring-brand-primary/10"
                      : "border-surface-300 bg-white"
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <div className="w-2 h-2 rounded-full bg-brand-primary" /> : null}
              </div>
            </div>

            {/* Step Label */}
            <div className="pb-6">
              <p className={cn("text-sm font-medium", isCurrent ? "text-brand-primary" : isDone ? "text-surface-900" : "text-surface-500")}>
                {config.label}
              </p>
              {isCurrent && <p className="text-xs text-surface-500 mt-1">Giai đoạn hiện tại</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
