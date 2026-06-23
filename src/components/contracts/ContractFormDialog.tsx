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
import { useCreateContract } from '@/lib/hooks/useContracts';
import { useProjects } from '@/lib/hooks/useProjects';

const contractSchema = z.object({
  contract_number: z.string().min(3, 'Nhập số hợp đồng'),
  project_id: z.string().min(1, 'Chọn dự án'),
  partner_name: z.string().min(2, 'Nhập tên đối tác'),
  total_value: z.string().min(1, 'Nhập giá trị hợp đồng'),
  signed_date: z.date().optional(),
  status: z.enum(['draft', 'signed', 'active', 'settled', 'liquidated']),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'ab' | 'bc';
  defaultProjectId?: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'signed', label: 'Đã ký' },
  { value: 'active', label: 'Đang thực hiện' },
  { value: 'settled', label: 'Đã quyết toán' },
  { value: 'liquidated', label: 'Đã thanh lý' },
];

export function ContractFormDialog({ open, onOpenChange, type, defaultProjectId }: ContractFormDialogProps) {
  const { data: projects = [] } = useProjects();
  const createContract = useCreateContract();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'draft',
      project_id: defaultProjectId || '',
    },
  });

  const onSubmit = (data: ContractFormValues) => {
    const totalValueParsed = Number(data.total_value.replace(/[^0-9]/g, ''));
    createContract.mutate(
      {
        ...data,
        type,
        total_value: totalValueParsed,
        signed_date: data.signed_date ? format(data.signed_date, 'yyyy-MM-dd') : undefined,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (err) => alert('Lỗi tạo hợp đồng: ' + err.message),
      }
    );
  };

  const typeLabel = type === 'ab' ? 'A-B (Với Chủ đầu tư)' : 'B-C (Với Nhà thầu phụ)';
  const partnerLabel = type === 'ab' ? 'Tên Chủ đầu tư (Bên A)' : 'Tên Nhà thầu phụ / NCC (Bên B)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Tạo Hợp đồng {typeLabel}</DialogTitle>
          <DialogDescription className="text-sm text-surface-500">
            Nhập đầy đủ thông tin hợp đồng để lưu vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">
              Số hợp đồng <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('contract_number')}
              placeholder={type === 'ab' ? 'VD: HĐ-AB-2024-001' : 'VD: HĐ-BC-2024-001'}
              className="font-mono"
            />
            {errors.contract_number && <p className="text-xs text-red-500">{errors.contract_number.message}</p>}
          </div>

          {!defaultProjectId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">
                Dự án <span className="text-red-500">*</span>
              </label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v ?? '')} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dự án..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-mono text-xs text-surface-500 mr-2">{p.project_code}</span>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project_id && <p className="text-xs text-red-500">{errors.project_id.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">
              {partnerLabel} <span className="text-red-500">*</span>
            </label>
            <Input {...register('partner_name')} placeholder="Nhập tên đơn vị..." />
            {errors.partner_name && <p className="text-xs text-red-500">{errors.partner_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">
                Giá trị HĐ (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-mono text-sm">₫</span>
                <Input {...register('total_value')} type="text" placeholder="0" className="pl-7 font-mono" />
              </div>
              {errors.total_value && <p className="text-xs text-red-500">{errors.total_value.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-700">Ngày ký</label>
              <Controller
                name="signed_date"
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
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-700">Tình trạng</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v) => field.onChange(v ?? 'draft')} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button
              type="submit"
              disabled={createContract.isPending}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white"
            >
              {createContract.isPending ? 'Đang lưu...' : 'Tạo hợp đồng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
