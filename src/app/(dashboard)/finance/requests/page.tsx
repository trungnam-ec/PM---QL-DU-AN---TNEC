"use client";

import React, { useMemo, useState } from 'react';
import { Plus, X, Check, Ban, FileCheck2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useCurrentProfile } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { usePaymentRequests, useCreatePaymentRequest, useDecidePaymentRequest } from '@/lib/hooks/usePaymentRequests';
import { requiredLevels, canApproveLevel, STATUS_CFG, LEVEL_LABEL } from '@/lib/paymentWorkflow';
import { PaymentRequest } from '@/types/database';
import { cn } from '@/lib/utils';

const EMPTY = { project_name: '', partner_name: '', category: '', content: '', amount: '' };

export default function PaymentRequestsPage() {
  const { data: profile } = useCurrentProfile();
  const { data: projects = [] } = useProjects();
  const { data: requests = [], isLoading } = usePaymentRequests();
  const createReq = useCreatePaymentRequest();
  const decide = useDecidePaymentRequest();

  const role = profile?.role ?? 'staff';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState<'all' | 'inbox'>('all');

  const num = (s: string) => Number(String(s).replace(/[^\d-]/g, '')) || 0;
  const amountPreview = num(form.amount);

  const rows = useMemo(() => {
    if (tab === 'inbox') {
      return requests.filter((r) => r.status === 'pending' && canApproveLevel(role, r.current_level));
    }
    return requests;
  }, [requests, tab, role]);

  const inboxCount = useMemo(
    () => requests.filter((r) => r.status === 'pending' && canApproveLevel(role, r.current_level)).length,
    [requests, role]
  );

  const submit = async () => {
    if (!form.content || amountPreview <= 0) return;
    await createReq.mutateAsync({
      project_name: form.project_name || null,
      project_id: projects.find((p) => p.name === form.project_name)?.id ?? null,
      partner_name: form.partner_name || null,
      category: form.category || null,
      content: form.content,
      amount: amountPreview,
      requested_by: profile?.id ?? null,
      requester_name: profile?.full_name ?? profile?.email ?? null,
    });
    setForm(EMPTY); setOpen(false);
  };

  const act = async (request: PaymentRequest, action: 'approve' | 'reject') => {
    const note = action === 'reject' ? (window.prompt('Lý do từ chối (tuỳ chọn):') ?? '') : '';
    await decide.mutateAsync({
      request, action, note,
      approver_id: profile?.id ?? null,
      approver_name: profile?.full_name ?? profile?.email ?? null,
    });
  };

  const pendingTotal = requests.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const approvedTotal = requests.filter((r) => r.status === 'approved').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Đề nghị chi</h1>
          <p className="text-sm text-surface-500 mt-0.5">Tạo đề nghị thanh toán & duyệt nhiều cấp theo hạn mức.</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Tạo đề nghị
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-amber-600"><Clock className="w-4 h-4" /><span className="text-xs font-medium">Chờ duyệt</span></div><p className="text-lg font-bold text-surface-900 mt-1.5"><CurrencyDisplay amount={pendingTotal} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><div className="flex items-center gap-1.5 text-emerald-600"><FileCheck2 className="w-4 h-4" /><span className="text-xs font-medium">Đã duyệt</span></div><p className="text-lg font-bold text-surface-900 mt-1.5"><CurrencyDisplay amount={approvedTotal} /></p></Card>
        <Card className="border-surface-200 shadow-sm p-4"><span className="text-xs text-surface-500">Tổng đề nghị</span><p className="text-lg font-bold text-surface-900 mt-1.5">{requests.length}</p></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        <button onClick={() => setTab('all')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === 'all' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-surface-500 hover:text-surface-700')}>
          Tất cả đề nghị
        </button>
        <button onClick={() => setTab('inbox')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5', tab === 'inbox' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-surface-500 hover:text-surface-700')}>
          Chờ tôi duyệt
          {inboxCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{inboxCount}</span>}
        </button>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5 w-[130px]">Mã ĐN</th>
                <th className="text-left font-medium px-3 py-2.5 min-w-[240px]">Nội dung</th>
                <th className="text-left font-medium px-3 py-2.5 w-[130px]">Người đề nghị</th>
                <th className="text-right font-medium px-3 py-2.5 w-[140px]">Số tiền</th>
                <th className="text-center font-medium px-3 py-2.5 w-[110px]">Tiến độ</th>
                <th className="text-center font-medium px-3 py-2.5 w-[110px]">Trạng thái</th>
                <th className="text-center font-medium px-3 py-2.5 w-[150px]">Duyệt</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <FileCheck2 className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">{tab === 'inbox' ? 'Không có đề nghị nào chờ bạn duyệt.' : 'Chưa có đề nghị chi nào.'}</p>
                </td></tr>
              ) : rows.map((r) => {
                const sc = STATUS_CFG[r.status];
                const canAct = r.status === 'pending' && canApproveLevel(role, r.current_level);
                return (
                  <tr key={r.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-surface-500">{r.code}</td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-surface-800 line-clamp-1">{r.content}</p>
                      <p className="text-[11px] text-surface-400">{r.project_name || '—'}{r.partner_name ? ` · ${r.partner_name}` : ''}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-surface-600">{r.requester_name || '—'}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-surface-900"><CurrencyDisplay amount={r.amount} /></td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs font-mono text-surface-500" title={LEVEL_LABEL[r.current_level]}>
                        Cấp {Math.min(r.current_level, r.max_level)}/{r.max_level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {canAct ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => act(r, 'approve')} disabled={decide.isPending} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100">
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button onClick={() => act(r, 'reject')} disabled={decide.isPending} className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-medium hover:bg-rose-100">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : <span className="text-surface-300 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog tạo đề nghị */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Tạo đề nghị chi</h2>
              <button onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Dự án</Label>
                <Select value={form.project_name} onValueChange={(v) => setForm((f) => ({ ...f, project_name: v ?? '' }))}>
                  <SelectTrigger className="h-9 mt-1 w-full text-sm"><SelectValue placeholder="Chọn dự án (tuỳ chọn)" /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Đối tác thụ hưởng</Label><Input value={form.partner_name} onChange={(e) => setForm((f) => ({ ...f, partner_name: e.target.value }))} className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Khoản mục</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="h-9 mt-1" placeholder="Vật tư, nhân công..." /></div>
              </div>
              <div><Label className="text-xs">Nội dung *</Label><Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
              <div>
                <Label className="text-xs">Số tiền *</Label>
                <Input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="h-9 mt-1 font-mono" placeholder="0" />
                {amountPreview > 0 && (
                  <p className="text-[11px] text-surface-500 mt-1">
                    <CurrencyDisplay amount={amountPreview} /> → cần duyệt <b>{requiredLevels(amountPreview)} cấp</b>
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" className="h-9 text-sm" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className="bg-brand-primary text-white h-9 text-sm" disabled={!form.content || amountPreview <= 0 || createReq.isPending} onClick={submit}>
                {createReq.isPending ? 'Đang gửi...' : 'Gửi đề nghị'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
