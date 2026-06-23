"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCreateTask } from '@/lib/hooks/useTasks';

const taskSchema = z.object({
  title: z.string().min(2, 'Nhập tên công việc'),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
  due_date: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: 'todo' | 'in_progress' | 'in_review' | 'done';
}

export function TaskFormDialog({ open, onOpenChange, projectId, defaultStatus = 'todo' }: TaskFormDialogProps) {
  const createTask = useCreateTask();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: defaultStatus },
  });

  const onSubmit = (data: TaskFormValues) => {
    createTask.mutate(
      {
        project_id: projectId,
        title: data.title,
        status: data.status,
        due_date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : undefined,
        position_order: 0,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (err) => alert('Lỗi tạo công việc: ' + err.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Thêm công việc mới</DialogTitle>
          <DialogDescription className="text-sm text-surface-500">
            Tạo công việc và thêm vào bảng Kanban của dự án.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <Input {...register('title')} placeholder="Nhập tên công việc..." autoFocus />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">Cột</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v ?? 'todo')} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Cần làm</SelectItem>
                      <SelectItem value="in_progress">Đang xử lý</SelectItem>
                      <SelectItem value="in_review">Chờ duyệt</SelectItem>
                      <SelectItem value="done">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">Hạn chót</label>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        'flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal',
                        !field.value && 'text-surface-400'
                      )}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-surface-400" />
                      {field.value ? format(field.value, 'dd/MM') : 'Chọn'}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button
              type="submit"
              disabled={createTask.isPending}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white"
            >
              {createTask.isPending ? 'Đang lưu...' : 'Thêm công việc'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
