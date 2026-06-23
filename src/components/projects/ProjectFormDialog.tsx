"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CalendarIcon, Info, MapPin, Briefcase, FileSignature } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateProject } from '@/lib/hooks/useProjects';
import { useDepartments } from '@/lib/hooks/useDepartments';

const projectSchema = z.object({
  project_code: z.string().min(3).regex(/^DA-\d{4}-\d{3}$/, "Định dạng DA-YYYY-XXX"),
  name: z.string().min(5, "Tên dự án quá ngắn").max(200),
  description: z.string().optional(),
  owner_unit: z.string().min(2, "Vui lòng nhập chủ đầu tư"),
  location: z.string().optional(),
  province: z.string().optional(),
  type: z.string().optional(),
  department_id: z.string().optional(),
  total_value: z.string().optional(),
  signed_date: z.date().optional(),
  start_date: z.date().optional(),
  expected_end_date: z.date().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
}

export function ProjectFormDialog({ open, onOpenChange, mode = 'create' }: ProjectFormDialogProps) {
  const { data: departments } = useDepartments();
  const createProject = useCreateProject();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_code: 'DA-2024-',
    }
  });

  const onSubmit = (data: ProjectFormValues) => {
    let totalValueParsed = null;
    if (data.total_value) {
      totalValueParsed = Number(data.total_value.replace(/[^0-9]/g, ''));
    }

    const newProject = {
      ...data,
      total_value: totalValueParsed,
      signed_date: data.signed_date ? format(data.signed_date, 'yyyy-MM-dd') : null,
      start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
      expected_end_date: data.expected_end_date ? format(data.expected_end_date, 'yyyy-MM-dd') : null,
      stage: 'opportunity',
    };

    createProject.mutate(newProject, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
      onError: (err) => {
        alert("Lỗi tạo dự án: " + err.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-slate-50">
        <div className="bg-white border-b border-slate-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {mode === 'create' ? 'Tạo Dự án Mới' : 'Cập nhật Dự án'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Nhập các thông tin chi tiết để thiết lập dự án trên hệ thống.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-6 py-6">
          <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">1. Thông tin cơ bản</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Mã dự án <span className="text-red-500">*</span></label>
                  <Input {...register('project_code')} placeholder="DA-YYYY-XXX" className="font-mono bg-slate-50/50" />
                  {errors.project_code && <p className="text-[11px] text-red-500 font-medium">{errors.project_code.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Tên dự án <span className="text-red-500">*</span></label>
                  <Input {...register('name')} placeholder="Nhập tên dự án..." className="bg-slate-50/50" />
                  {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Mô tả tóm tắt</label>
                <Textarea {...register('description')} placeholder="Ghi chú về mục tiêu, quy mô..." className="resize-none bg-slate-50/50" rows={2} />
              </div>
            </div>

            {/* 2. ĐỊA ĐIỂM & ĐỐI TÁC */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MapPin className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">2. Đối tác & Vị trí</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Chủ đầu tư <span className="text-red-500">*</span></label>
                <Input {...register('owner_unit')} placeholder="Tên đơn vị chủ đầu tư..." className="bg-slate-50/50" />
                {errors.owner_unit && <p className="text-[11px] text-red-500 font-medium">{errors.owner_unit.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Địa điểm thi công</label>
                  <Input {...register('location')} placeholder="Địa chỉ chi tiết..." className="bg-slate-50/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Tỉnh/Thành phố</label>
                  <Controller 
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-slate-50/50">
                          <SelectValue placeholder="Chọn tỉnh thành" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
                          <SelectItem value="hn">Hà Nội</SelectItem>
                          <SelectItem value="dn">Đà Nẵng</SelectItem>
                          <SelectItem value="cm">Cà Mau</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 3. PHÂN LOẠI & PHỤ TRÁCH */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">3. Quản lý nội bộ</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Loại hình</label>
                  <Controller 
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-slate-50/50">
                          <SelectValue placeholder="Chọn phân loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xl">Xây lắp</SelectItem>
                          <SelectItem value="tv">Tư vấn</SelectItem>
                          <SelectItem value="hh">Hỗn hợp</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700">Phòng ban quản lý chính</label>
                  <Controller 
                    name="department_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-slate-50/50">
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 4. TÀI CHÍNH & KẾ HOẠCH */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileSignature className="w-4 h-4" /></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">4. Kế hoạch & Giá trị</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Giá trị hợp đồng A-B dự kiến</label>
                <div className="relative">
                  <Input {...register('total_value')} type="text" placeholder="0" className="pl-12 font-mono bg-slate-50/50 font-medium text-brand-primary" />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-[13px]">VNĐ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-700">Dự kiến Ký HĐ</label>
                  <Controller 
                    name="signed_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger className={cn("flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium hover:bg-slate-100 transition-colors", !field.value && "text-slate-400")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-700">Khởi công</label>
                  <Controller 
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger className={cn("flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium hover:bg-slate-100 transition-colors", !field.value && "text-slate-400")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[13px] font-semibold text-slate-700">Hoàn thành</label>
                  <Controller 
                    name="expected_end_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger className={cn("flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium hover:bg-slate-100 transition-colors", !field.value && "text-slate-400")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="bg-white border-t border-slate-100 px-6 py-4">
          <DialogFooter className="flex sm:justify-between items-center w-full">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-800 font-medium">Hủy bỏ</Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-sm">
                Lưu nháp
              </Button>
              <Button form="project-form" type="submit" disabled={createProject.isPending} className="bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm font-medium px-6">
                {createProject.isPending ? 'Đang tạo...' : 'Tạo dự án →'}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
