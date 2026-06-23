import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/database';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { STAGE_CONFIG } from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building2, Calendar, CheckCircle2, Circle, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  project: Project;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export function OverviewTab({ project }: OverviewTabProps) {
  const stages = Object.keys(STAGE_CONFIG);
  const currentStageIndex = stages.indexOf(project.stage || 'opportunity');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* LEFT — Info */}
      <div className="lg:col-span-2 space-y-4">
        {/* Basic info */}
        <Card className="border-surface-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="Chủ đầu tư" value={project.owner_unit || '—'} icon={<Building2 className="w-3.5 h-3.5 text-surface-400" />} />
              <InfoRow
                label="Địa điểm"
                value={project.location ? `${project.location}${project.province ? `, ${project.province}` : ''}` : '—'}
                icon={<MapPin className="w-3.5 h-3.5 text-surface-400" />}
              />
              <InfoRow
                label="Giá trị HĐ A-B"
                value={project.total_value ? <CurrencyDisplay amount={project.total_value} /> : '—'}
                mono
              />
              <InfoRow label="Phòng ban" value={project.department?.name || '—'} />
              <InfoRow label="Ngày khởi công" value={formatDate(project.start_date)} icon={<Calendar className="w-3.5 h-3.5 text-surface-400" />} />
              <InfoRow label="Hoàn thành DK" value={formatDate(project.expected_end_date)} icon={<Calendar className="w-3.5 h-3.5 text-surface-400" />} />
              {project.description && (
                <div className="col-span-2">
                  <p className="text-xs text-surface-400 mb-1">Mô tả</p>
                  <p className="text-sm text-surface-700 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PM */}
        <Card className="border-surface-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Nhân sự phụ trách</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-lg">
                <AvatarImage src={project.project_manager?.avatar_url || ''} />
                <AvatarFallback className="bg-brand-primary text-white text-sm rounded-lg">
                  {project.project_manager?.full_name ? project.project_manager.full_name.charAt(0).toUpperCase() : 'PM'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-surface-900">
                  {project.project_manager?.full_name || 'Chưa phân công'}
                </p>
                <p className="text-xs text-surface-400">Giám đốc Dự án (PM)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT — Stage */}
      <div>
        <Card className="border-surface-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Tiến độ giai đoạn</h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-surface-200" />

              <div className="space-y-3 pl-0">
                {stages.map((stageKey, idx) => {
                  const config = STAGE_CONFIG[stageKey as keyof typeof STAGE_CONFIG];
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const isTodo = idx > currentStageIndex;

                  return (
                    <div key={stageKey} className="relative flex items-center gap-3">
                      {/* Dot */}
                      <div className="relative z-10 w-[15px] flex items-center justify-center shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />
                        ) : isCurrent ? (
                          <div className={cn('w-3 h-3 rounded-full ring-2 ring-offset-1', config.dot, config.dot.replace('bg-', 'ring-'))} />
                        ) : (
                          <Circle className="w-3 h-3 text-surface-300" />
                        )}
                      </div>

                      <p
                        className={cn(
                          'text-[13px] leading-snug',
                          isCurrent ? 'font-semibold text-surface-900' : isCompleted ? 'text-surface-600' : 'text-surface-400'
                        )}
                      >
                        {config.label}
                      </p>

                      {isCurrent && (
                        <span className={cn('ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full', config.bg, config.text)}>
                          Hiện tại
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-surface-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={cn('text-sm font-medium text-surface-900', mono && 'font-mono')}>{value}</p>
    </div>
  );
}
