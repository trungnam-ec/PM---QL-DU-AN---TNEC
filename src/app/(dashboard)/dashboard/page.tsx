"use client";

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { STAGE_CONFIG } from '@/components/shared/StatusBadge';
import { useProjects } from '@/lib/hooks/useProjects';
import { TrendingUp, Layers, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const ACTIVITIES = [
  { id: 1, user: 'Trần Thị B', action: 'cập nhật tiến độ', project: 'DA-2024-002', time: '2 giờ trước', color: 'bg-blue-500' },
  { id: 2, user: 'Lê Văn C', action: 'tạo đề nghị thanh toán', project: 'DA-2024-005', time: '4 giờ trước', color: 'bg-emerald-500' },
  { id: 3, user: 'Hệ thống', action: 'cảnh báo trễ hạn HĐ', project: 'DA-2024-011', time: 'Hôm qua', color: 'bg-amber-500' },
  { id: 4, user: 'Giám đốc', action: 'phê duyệt dự án', project: 'DA-2024-020', time: 'Hôm qua', color: 'bg-violet-500' },
];

export default function DashboardPage() {
  const { data: projects = [], isLoading } = useProjects();

  const { totalProjects, constructionProjects, totalValue, activeProjectsList, pipelineData } =
    useMemo(() => {
      const totalProjects = projects.length;
      const constructionProjects = projects.filter((p) => p.stage === 'construction').length;
      const totalValue = projects.reduce((sum, p) => sum + (p.total_value || 0), 0);
      const activeProjectsList = projects.filter((p) => p.stage === 'construction').slice(0, 6);
      const stages = Object.keys(STAGE_CONFIG);
      const pipelineData = stages.map((stage) => ({
        stage,
        count: projects.filter((p) => p.stage === stage).length,
      }));
      return { totalProjects, constructionProjects, totalValue, activeProjectsList, pipelineData };
    }, [projects]);

  const KPI_DATA = [
    {
      label: 'Tổng dự án',
      value: totalProjects,
      subtext: 'Tất cả giai đoạn',
      icon: Layers,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accent: 'border-t-blue-500',
    },
    {
      label: 'Đang thi công',
      value: constructionProjects,
      subtext: 'Đang triển khai',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'border-t-emerald-500',
    },
    {
      label: 'Tổng GT Đầu tư',
      value: totalValue,
      isCurrency: true,
      subtext: 'Dự kiến & Đã ký',
      icon: DollarSign,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      accent: 'border-t-violet-500',
    },
    {
      label: 'Cần xử lý',
      value: '5',
      subtext: '2 việc cần duyệt',
      icon: AlertCircle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'border-t-amber-500',
      isWarning: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-surface-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Tổng quan hệ thống</h1>
        <p className="text-sm text-surface-500 mt-0.5">Nắm bắt toàn bộ tình hình dự án và tài chính.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, idx) => (
          <Card
            key={idx}
            className={`border-surface-200 shadow-sm border-t-2 ${kpi.accent} hover:shadow-md transition-shadow duration-200`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider truncate">
                    {kpi.label}
                  </p>
                  <div className="text-2xl font-bold text-surface-900 mt-2 font-mono leading-none">
                    {kpi.isCurrency ? (
                      <CurrencyDisplay amount={kpi.value as number} />
                    ) : (
                      kpi.value
                    )}
                  </div>
                  <p className={`text-xs mt-2 ${kpi.isWarning ? 'text-amber-600 font-medium' : 'text-surface-400'}`}>
                    {kpi.subtext}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0 ml-3`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROW 2: ACTIVE PROJECTS + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-800">Dự án đang thi công</h2>
            <Link href="/projects" className="text-xs text-brand-primary hover:underline font-medium">
              Xem tất cả →
            </Link>
          </div>
          <Card className="border-surface-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-50 hover:bg-surface-50">
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[130px]">Mã DA</TableHead>
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Tên dự án</TableHead>
                  <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Giai đoạn</TableHead>
                  <TableHead className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeProjectsList.length > 0 ? (
                  activeProjectsList.map((project) => (
                    <TableRow key={project.id} className="hover:bg-surface-50 border-surface-100 cursor-pointer group">
                      <TableCell className="font-mono text-xs text-surface-500 group-hover:text-brand-primary transition-colors">
                        <Link href={`/projects/${project.id}`}>{project.project_code}</Link>
                      </TableCell>
                      <TableCell className="font-medium text-surface-900 text-sm">
                        <Link href={`/projects/${project.id}`} className="hover:text-brand-primary transition-colors">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge stage={project.stage as any} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-surface-700">
                        <CurrencyDisplay amount={project.total_value || 0} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-surface-400 text-sm">
                      Chưa có dự án nào đang thi công
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-surface-800 mb-3">Hoạt động gần đây</h2>
          <Card className="border-surface-200 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-surface-100">
                {ACTIVITIES.map((activity) => (
                  <div key={activity.id} className="p-4 flex gap-3">
                    <div
                      className={`w-7 h-7 rounded-full ${activity.color} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <span className="text-[10px] font-bold text-white">{activity.user.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-surface-800 leading-snug">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-surface-500">{activity.action}</span>
                      </p>
                      <p className="text-xs font-mono text-brand-primary mt-0.5">{activity.project}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PIPELINE */}
      <div>
        <h2 className="text-sm font-semibold text-surface-800 mb-3">Pipeline Dự án</h2>
        <Card className="border-surface-200 shadow-sm p-5">
          <div className="flex w-full h-6 rounded-lg overflow-hidden bg-surface-100 gap-px">
            {pipelineData.map((item, idx) => {
              const config = STAGE_CONFIG[item.stage as keyof typeof STAGE_CONFIG];
              const percentage = Math.max((item.count / (totalProjects || 1)) * 100, 0);
              if (item.count === 0) return null;
              return (
                <div
                  key={idx}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                  className={`${config.dot.replace('bg-', 'bg-')} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                  title={`${config.label}: ${item.count}`}
                >
                  {percentage > 6 && (
                    <span className="text-[10px] text-white font-semibold">{item.count}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
            {pipelineData.map((item, idx) => {
              const config = STAGE_CONFIG[item.stage as keyof typeof STAGE_CONFIG];
              return (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className="text-surface-500">{config.label}</span>
                  <span className="font-mono font-semibold text-surface-800">{item.count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
