"use client";

import React, { useState } from 'react';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { FolderOpen, MoreHorizontal, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/lib/hooks/useProjects';

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');

  const { data: projects, isLoading, error } = useProjects({
    search: search.trim() !== '' ? search : undefined,
    status,
    departmentId,
  });

  const handleStatus = (v: string | null) => setStatus(v ?? 'all');
  const handleDept = (v: string | null) => setDepartmentId(v ?? 'all');

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Danh sách Dự án</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {projects ? `${projects.length} dự án` : 'Tất cả dự án trong hệ thống'}
          </p>
        </div>
        <Can module="projects" action="edit">
          <Button
            className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo dự án mới
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input
            placeholder="Tìm kiếm dự án..."
            className="pl-9 bg-white border-surface-200 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          <Select value={status} onValueChange={handleStatus}>
            <SelectTrigger className="w-[170px] bg-white border-surface-200 h-9 text-sm shrink-0">
              <SelectValue placeholder="Giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              <SelectItem value="opportunity">Cơ hội</SelectItem>
              <SelectItem value="feasibility">Đánh giá KT</SelectItem>
              <SelectItem value="bidding">Đang dự thầu</SelectItem>
              <SelectItem value="negotiating">Thương thảo HĐ</SelectItem>
              <SelectItem value="contracted">Đã ký HĐ A-B</SelectItem>
              <SelectItem value="construction">Đang thi công</SelectItem>
              <SelectItem value="settlement">Quyết toán</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentId} onValueChange={handleDept}>
            <SelectTrigger className="w-[140px] bg-white border-surface-200 h-9 text-sm shrink-0">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Phòng ban</SelectItem>
              <SelectItem value="QLDA">QLDA</SelectItem>
              <SelectItem value="KHDT">KHĐT</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="2024">
            <SelectTrigger className="w-[110px] bg-white border-surface-200 h-9 text-sm shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="border-surface-200 shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-surface-100 last:border-0">
              <div className="h-4 w-28 bg-surface-100 rounded animate-pulse" />
              <div className="h-4 flex-1 bg-surface-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-surface-100 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-surface-100 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 shadow-sm p-8 text-center text-red-600 text-sm">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
        </Card>
      ) : projects && projects.length > 0 ? (
        <Card className="border-surface-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50 hover:bg-surface-50">
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[140px]">Mã DA</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider">Tên dự án</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[150px]">Giai đoạn</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[90px]">P.ban</TableHead>
                <TableHead className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider w-[160px]">Giá trị HĐ</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[130px]">PM</TableHead>
                <TableHead className="text-xs font-medium text-surface-500 uppercase tracking-wider w-[110px]">HT kế hoạch</TableHead>
                <TableHead className="w-[44px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-surface-50 border-surface-100 group">
                  <TableCell className="font-mono text-xs text-surface-400 group-hover:text-brand-primary transition-colors">
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
                  <TableCell className="text-xs text-surface-500">
                    {project.department?.name || '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-surface-700">
                    <CurrencyDisplay amount={project.total_value || 0} />
                  </TableCell>
                  <TableCell className="text-sm text-surface-600">
                    {project.project_manager?.full_name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-surface-500 font-mono text-xs">
                    {formatDate(project.expected_end_date)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-7 w-7 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-md"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] text-sm">
                        <DropdownMenuItem onSelect={() => window.location.href = `/projects/${project.id}`}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <Can module="projects" action="edit">
                          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem>Chuyển giai đoạn</DropdownMenuItem>
                        </Can>
                        <Can module="projects" action="manage">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            Hủy dự án
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="Chưa có dự án nào"
          description={
            search || status !== 'all'
              ? 'Không tìm thấy dự án phù hợp với bộ lọc.'
              : 'Bắt đầu bằng cách tạo dự án đầu tiên.'
          }
          action={{ label: 'Tạo dự án mới', onClick: () => setIsFormOpen(true) }}
        />
      )}

      <ProjectFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
