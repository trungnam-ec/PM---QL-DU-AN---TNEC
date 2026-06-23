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
    <div className="space-y-6 max-w-screen-xl animate-in fade-in duration-300">
      {/* Header with accent strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Danh sách Dự án
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects ? `Đang quản lý ${projects.length} dự án` : 'Tất cả các dự án trong hệ thống Trungnam E&C'}
          </p>
        </div>
        <Can module="projects" action="edit">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 h-10 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo dự án mới
          </Button>
        </Can>
      </div>

      {/* Filters with modern borderless-like appearance */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm dự án (mã, tên)..."
            className="pl-10 bg-white border-slate-200 rounded-xl h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select value={status} onValueChange={handleStatus}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200 rounded-xl h-10 text-sm focus:ring-1 focus:ring-blue-500">
              <SelectValue placeholder="Giai đoạn" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
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
            <SelectTrigger className="w-[140px] bg-white border-slate-200 rounded-xl h-10 text-sm focus:ring-1 focus:ring-blue-500">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Phòng ban</SelectItem>
              <SelectItem value="QLDA">QLDA</SelectItem>
              <SelectItem value="KHDT">KHĐT</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="2024">
            <SelectTrigger className="w-[110px] bg-white border-slate-200 rounded-xl h-10 text-sm focus:ring-1 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <Card className="border-slate-150 rounded-2xl shadow-sm overflow-hidden p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0">
              <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </Card>
      ) : error ? (
        <div className="bg-red-50 border border-red-150 rounded-2xl p-10 text-center text-red-700 text-sm font-medium">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng tải lại trang.
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-150">
                <TableHead className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[140px]">Mã DA</TableHead>
                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên dự án</TableHead>
                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[160px]">Giai đoạn</TableHead>
                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[100px]">P.ban</TableHead>
                <TableHead className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[180px]">Giá trị HĐ</TableHead>
                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">Chỉ huy trưởng (PM)</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[125px]">Kết thúc KH</TableHead>
                <TableHead className="w-[44px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-0 group transition-colors duration-150">
                  <TableCell className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-blue-600 font-bold transition-colors">
                    <Link href={`/projects/${project.id}`}>{project.project_code}</Link>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm font-semibold text-slate-900">
                    <Link href={`/projects/${project.id}`} className="hover:text-blue-600 transition-colors">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusBadge stage={project.stage as any} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                      {project.department?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right font-mono text-sm font-bold text-slate-700">
                    <CurrencyDisplay amount={project.total_value || 0} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-slate-600 font-medium">
                    {project.project_manager?.full_name || '—'}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-mono text-xs text-slate-500 font-medium">
                    {formatDate(project.expected_end_date)}
                  </TableCell>
                  <TableCell className="px-2 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-8 w-8 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-slate-100">
                        <DropdownMenuItem onSelect={() => window.location.href = `/projects/${project.id}`} className="rounded-lg">
                          Xem chi tiết
                        </DropdownMenuItem>
                        <Can module="projects" action="edit">
                          <DropdownMenuItem className="rounded-lg">Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg">Chuyển giai đoạn</DropdownMenuItem>
                        </Can>
                        <Can module="projects" action="manage">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
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
        </div>
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
