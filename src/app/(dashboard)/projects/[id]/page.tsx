"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, MoreVertical, GitBranch } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/projects/tabs/OverviewTab';
import { KanbanTab } from '@/components/projects/tabs/KanbanTab';
import { ContractTab } from '@/components/projects/tabs/ContractTab';
import { BidPackagesTab } from '@/components/projects/tabs/BidPackagesTab';
import { ExecutionTab } from '@/components/projects/tabs/ExecutionTab';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 bg-white border border-surface-200 rounded-xl animate-pulse" />
        <div className="h-40 bg-surface-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-surface-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-lg font-semibold text-surface-900 mb-1">Không tìm thấy dự án</h2>
        <p className="text-sm text-surface-500 mb-4">Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button size="sm" onClick={() => router.push('/projects')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-screen-xl -mx-6 -mt-6 px-6 pt-0">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-surface-50 pt-5 pb-4 border-b border-surface-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg shrink-0"
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-xs text-surface-400 shrink-0">{project.project_code}</span>
              <span className="text-surface-300">/</span>
              <h1 className="text-base font-semibold text-surface-900 truncate">{project.name}</h1>
              <StatusBadge stage={project.stage as any} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-surface-200 text-surface-600 hover:bg-surface-50"
            >
              <GitBranch className="h-3.5 w-3.5 mr-1.5 text-surface-400" />
              Chuyển Giai đoạn
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-surface-200 text-surface-600 hover:bg-surface-50"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5 text-surface-400" />
              Sửa
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-9 p-1 bg-surface-100 rounded-lg w-full sm:w-auto inline-flex gap-0.5">
          {[
            { value: 'overview',   label: 'Tổng quan' },
            { value: 'kanban',     label: 'Kanban' },
            { value: 'contracts',  label: 'Hợp đồng' },
            { value: 'bidding',    label: 'Gói thầu' },
            { value: 'progress',   label: 'Tiến độ' },
            { value: 'finance',    label: 'Tài chính' },
            { value: 'documents',  label: 'Tài liệu' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5">
          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <OverviewTab project={project} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 focus-visible:outline-none">
            <KanbanTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="contracts" className="mt-0 focus-visible:outline-none">
            <ContractTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="bidding" className="mt-0 focus-visible:outline-none">
            <BidPackagesTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="progress" className="mt-0 focus-visible:outline-none">
            <ExecutionTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="finance" className="mt-0 focus-visible:outline-none">
            <ComingSoon label="Tài chính Dự án" />
          </TabsContent>

          <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
            <ComingSoon label="Quản lý Tài liệu" />
          </TabsContent>
        </div>
      </Tabs>

      <ProjectFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} mode="edit" />
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-surface-200 bg-white">
      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center mb-3">
        <span className="text-lg">🚧</span>
      </div>
      <p className="text-sm font-medium text-surface-700">{label}</p>
      <p className="text-xs text-surface-400 mt-1">Tính năng đang được phát triển</p>
    </div>
  );
}
