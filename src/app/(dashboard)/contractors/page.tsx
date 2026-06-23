"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/shared/Can';
import { useContractors, useCreateContractor } from '@/lib/hooks/useContractors';

const CATEGORY_CFG: Record<string, { color: string; bg: string }> = {
  'Công ty':            { color: '#2563EB', bg: '#DBEAFE' },
  'Cá nhân':            { color: '#0891B2', bg: '#CFFAFE' },
  'Cá nhân (nội bộ)':   { color: '#7C3AED', bg: '#EDE9FE' },
  'Cơ quan NN':         { color: '#DC2626', bg: '#FEE2E2' },
  'Ngân hàng':          { color: '#059669', bg: '#D1FAE5' },
  'Khác':               { color: '#64748B', bg: '#F1F5F9' },
};
const catCfg = (c: string | null) => CATEGORY_CFG[c || 'Khác'] || CATEGORY_CFG['Khác'];

const EMPTY = {
  code: '', name: '', type: 'ntp' as 'ntp' | 'ncc', tax_code: '', field: '',
  contact_person: '', phone: '', email: '', address: '', note: '',
};

export default function ContractorsPage() {
  const { data: contractors = [], isLoading } = useContractors();
  const createC = useCreateContractor();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const categories = useMemo(() => {
    const s = new Set<string>();
    contractors.forEach((c) => c.category && s.add(c.category));
    return Array.from(s);
  }, [contractors]);

  const rows = useMemo(() => contractors.filter((c) => {
    const mt = catFilter === 'all' || c.category === catFilter;
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  }).sort((a, b) => (b.transaction_count || 0) - (a.transaction_count || 0)),
  [contractors, search, catFilter]);

  const submit = async () => {
    await createC.mutateAsync({
      ...form, rating: 0, is_active: true, category: null, transaction_count: 0,
      tax_code: form.tax_code || null, field: form.field || null,
      contact_person: form.contact_person || null, phone: form.phone || null,
      email: form.email || null, address: form.address || null, note: form.note || null,
    });
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Nhà thầu phụ / Nhà cung cấp</h1>
          <p className="text-sm text-surface-500 mt-0.5">{rows.length} đối tác trong danh mục.</p>
        </div>
        <Can module="projects" action="edit">
          <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white h-9 text-sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Thêm đối tác
          </Button>
        </Can>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input placeholder="Tìm tên, mã đối tác..." className="pl-9 bg-white h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? 'all')}>
          <SelectTrigger className="w-52 bg-white h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại hình</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50 text-xs text-surface-500 uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-2.5 w-[110px]">Mã</th>
                <th className="text-left font-medium px-3 py-2.5 min-w-[280px]">Tên đối tác</th>
                <th className="text-left font-medium px-3 py-2.5 w-[170px]">Loại hình</th>
                <th className="text-right font-medium px-5 py-2.5 w-[110px]">Số GD</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="h-32 text-center text-surface-400 text-sm">Đang tải...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <Users className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Chưa có đối tác nào.</p>
                </td></tr>
              ) : rows.map((c) => {
                const cc = catCfg(c.category);
                return (
                  <tr key={c.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                    <td className="px-5 py-2.5 font-mono text-xs text-surface-500">{c.code}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-surface-800">{c.name}</td>
                    <td className="px-3 py-2.5">
                      {c.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: cc.color, background: cc.bg }}>
                          {c.category}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {c.transaction_count > 0
                        ? <span className="font-mono text-sm font-semibold text-surface-700">{c.transaction_count}</span>
                        : <span className="text-surface-300 text-sm">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Thêm đối tác</h2>
              <button onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Mã đối tác *</Label><Input value={form.code} onChange={set('code')} placeholder="NTP-001" className="h-9 mt-1" /></div>
                <div>
                  <Label className="text-xs">Loại *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? 'ntp') as 'ntp' | 'ncc' }))}>
                    <SelectTrigger className="h-9 mt-1 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ntp">Nhà thầu phụ</SelectItem>
                      <SelectItem value="ncc">Nhà cung cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Tên đối tác *</Label><Input value={form.name} onChange={set('name')} className="h-9 mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Mã số thuế</Label><Input value={form.tax_code} onChange={set('tax_code')} className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Lĩnh vực</Label><Input value={form.field} onChange={set('field')} className="h-9 mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Người liên hệ</Label><Input value={form.contact_person} onChange={set('contact_person')} className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Điện thoại</Label><Input value={form.phone} onChange={set('phone')} className="h-9 mt-1" /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={set('email')} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Địa chỉ</Label><Input value={form.address} onChange={set('address')} className="h-9 mt-1" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" className="h-9 text-sm" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className="bg-brand-primary text-white h-9 text-sm" disabled={!form.code || !form.name || createC.isPending} onClick={submit}>
                {createC.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
