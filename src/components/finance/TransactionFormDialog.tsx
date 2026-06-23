"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCreateTransaction } from '@/lib/hooks/useFinance';
import { useProjects } from '@/lib/hooks/useProjects';

const txSchema = z.object({
  type: z.enum(['in', 'out']),
  project_id: z.string().optional(),
  amount: z.string().min(1, 'Nhập số tiền'),
  transaction_date: z.date(),
  note: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

type TxFormValues = z.infer<typeof txSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'in' | 'out';
  defaultProjectId?: string;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  defaultType = 'in',
  defaultProjectId,
}: TransactionFormDialogProps) {
  const { data: projects = [] } = useProjects();
  const createTx = useCreateTransaction();

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: defaultType,
      status: 'completed',
      project_id: defaultProjectId || '',
      transaction_date: new Date(),
    },
  });

  const txType = watch('type');

  const onSubmit = (data: TxFormValues) => {
    const amount = Number(data.amount.replace(/[^0-9]/g, ''));
    createTx.mutate(
      {
        type: data.type,
        amount,
        transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
        note: data.note,
        status: data.status,
        project_id: data.project_id || undefined,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (err) => alert('Lỗi tạo giao dịch: ' + err.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Ghi nhận giao dịch {txType === 'in' ? 'Thu' : 'Chi'}
          </DialogTitle>
          <DialogDescription className="text-sm text-surface-500">
            Nhập thông tin giao dịch tài chính vào sổ phụ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Loại */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">Phân loại</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {(['in', 'out'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                        field.value === t && t === 'in' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' :
                        field.value === t && t === 'out' ? 'bg-rose-50 border-rose-400 text-rose-700' :
                        'border-surface-200 text-surface-500 hover:border-surface-300'
                      )}
                    >
                      {t === 'in' ? '+ Thu' : '− Chi'}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Số tiền */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">
              Số tiền (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-mono text-sm">₫</span>
              <Input {...register('amount')} type="text" placeholder="0" className="pl-7 font-mono text-base" />
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Ngày */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">
              Ngày giao dịch <span className="text-red-500">*</span>
            </label>
            <Controller
              name="transaction_date"
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
                    {field.value ? format(field.value, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Dự án */}
          {!defaultProjectId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">Dự án liên quan</label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v ?? '')} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dự án (tùy chọn)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không liên kết dự án</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-mono text-xs text-surface-500 mr-1">{p.project_code}</span>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Nội dung */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">Nội dung / Ghi chú</label>
            <Textarea {...register('note')} placeholder="Mô tả nội dung giao dịch..." rows={2} className="resize-none text-sm" />
          </div>

          {/* Trạng thái */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">Trạng thái</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v) => field.onChange(v ?? 'completed')} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="pending">Đang chờ xử lý</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button
              type="submit"
              disabled={createTx.isPending}
              className={cn('text-white', txType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}
            >
              {createTx.isPending ? 'Đang lưu...' : `Ghi nhận ${txType === 'in' ? 'Thu' : 'Chi'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
