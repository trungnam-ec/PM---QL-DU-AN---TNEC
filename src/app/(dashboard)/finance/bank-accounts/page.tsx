"use client";

import React, { useState } from 'react';
import { Plus, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Can } from '@/components/shared/Can';
import { useBankAccounts, useCreateBankAccount } from '@/lib/hooks/useBankAccounts';

const EMPTY = {
  acc_code: '', account_number: '', account_name: '',
  bank_name: '', branch: '', project_group: '',
};

export default function BankAccountsPage() {
  const { data: accounts = [], isLoading } = useBankAccounts();
  const createAcc = useCreateBankAccount();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    await createAcc.mutateAsync({
      ...form,
      branch: form.branch || null,
      project_group: form.project_group || null,
    });
    setForm(EMPTY);
    setOpen(false);
  };

  const valid = form.acc_code && form.account_number && form.account_name && form.bank_name;

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Tài khoản ngân hàng</h1>
          <p className="text-sm text-surface-500 mt-0.5">Danh mục tài khoản phục vụ thu chi dự án.</p>
        </div>
        <Can module="finance" action="edit">
          <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Thêm tài khoản
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <Card className="border-surface-200 p-8 text-center text-surface-400 text-sm">Đang tải...</Card>
      ) : accounts.length === 0 ? (
        <Card className="border-surface-200 shadow-sm py-16 text-center">
          <Building2 className="w-10 h-10 text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-400">Chưa có tài khoản ngân hàng nào.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="border-surface-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-mono text-[11px] text-surface-400 bg-surface-100 px-2 py-0.5 rounded">{acc.acc_code}</span>
              </div>
              <p className="text-sm font-semibold text-surface-900">{acc.bank_name}</p>
              {acc.branch && <p className="text-xs text-surface-500 mt-0.5">CN {acc.branch}</p>}
              <div className="mt-3 pt-3 border-t border-surface-100 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Số TK</span>
                  <span className="font-mono font-medium text-surface-700">{acc.account_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Chủ TK</span>
                  <span className="font-medium text-surface-700 text-right line-clamp-1">{acc.account_name}</span>
                </div>
                {acc.project_group && (
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-400">Nhóm DA</span>
                    <span className="text-surface-700">{acc.project_group}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog thêm */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Thêm tài khoản ngân hàng</h2>
              <button onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Mã TK *</Label><Input value={form.acc_code} onChange={set('acc_code')} placeholder="TK-001" className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Số tài khoản *</Label><Input value={form.account_number} onChange={set('account_number')} className="h-9 mt-1" /></div>
              </div>
              <div><Label className="text-xs">Tên chủ tài khoản *</Label><Input value={form.account_name} onChange={set('account_name')} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Ngân hàng *</Label><Input value={form.bank_name} onChange={set('bank_name')} placeholder="Vietcombank" className="h-9 mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Chi nhánh</Label><Input value={form.branch} onChange={set('branch')} className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Nhóm dự án</Label><Input value={form.project_group} onChange={set('project_group')} className="h-9 mt-1" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" className="h-9 text-sm" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className="bg-brand-primary text-white h-9 text-sm" disabled={!valid || createAcc.isPending} onClick={submit}>
                {createAcc.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
