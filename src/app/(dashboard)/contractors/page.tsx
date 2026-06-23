"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, Star, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/shared/Can';
import { useContractors, useCreateContractor } from '@/lib/hooks/useContractors';
import { cn } from '@/lib/utils';

const TYPE_CFG = {
  ntp: { label: 'Nhà thầu phụ', color: '#2563EB', bg: '#DBEAFE' },
  ncc: { label: 'Nhà cung cấp', color: '#7C3AED', bg: '#EDE9FE' },
};

const EMPTY = {
  code: '', name: '', type: 'ntp' as 'ntp' | 'ncc', tax_code: '', field: '',
  contact_person: '', phone: '', email: '', address: '', note: '',
};

export default function ContractorsPage() {
  const { data: contractors = [], isLoading } = useContractors();
  const createC = useCreateContractor();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const rows = useMemo(() => contractors.filter((c) => {
    const mt = typeFilter === 'all' || c.type === typeFilter;
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  }), [contractors, search, typeFilter]);

  const submit = async () => {
    await createC.mutateAsync({
      ...form, rating: 0, is_active: true,
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

      <div className="flex gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input placeholder="Tìm tên, mã đối tác..." className="pl-9 bg-white h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger className="w-44 bg-white h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="ntp">Nhà thầu phụ</SelectItem>
            <SelectItem value="ncc">Nhà cung cấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="border-surface-200 p-8 text-center text-surface-400 text-sm">Đang tải...</Card>
      ) : rows.length === 0 ? (
        <Card className="border-surface-200 shadow-sm py-16 text-center">
          <Users className="w-10 h-10 text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-400">Chưa có đối tác nào.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((c) => {
            const tc = TYPE_CFG[c.type];
            return (
              <Card key={c.id} className="border-surface-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: tc.color, background: tc.bg }}>
                    {tc.label}
                  </span>
                  <span className="font-mono text-[11px] text-surface-400">{c.code}</span>
                </div>
                <p className="text-sm font-semibold text-surface-900 line-clamp-1">{c.name}</p>
                {c.field && <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{c.field}</p>}
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn('w-3.5 h-3.5', i <= c.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200')} />
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-surface-100 space-y-1.5 text-xs text-surface-600">
                  {c.contact_person && <p className="font-medium text-surface-700">{c.contact_person}</p>}
                  {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-surface-400" />{c.phone}</p>}
                  {c.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-surface-400" />{c.email}</p>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
