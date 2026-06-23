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
    <div className="space-y-6 max-w-screen-xl animate-in fade-in duration-300">
      {/* Header with accent strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Nhà thầu phụ / Nhà cung cấp
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đang quản lý {rows.length} đối tác trong danh mục nhà thầu & nhà cung cấp của Trungnam E&C.
          </p>
        </div>
        <Can module="projects" action="edit">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 h-10 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md" 
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm đối tác
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm tên, mã đối tác..." 
            className="pl-10 bg-white border-slate-200 rounded-xl h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? 'all')}>
          <SelectTrigger className="w-56 bg-white border-slate-200 rounded-xl h-10 text-sm focus:ring-1 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Tất cả loại hình</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Partners List Table */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/70 text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                <th className="px-6 py-3.5 w-[130px]">Mã đối tác</th>
                <th className="px-4 py-3.5 min-w-[280px]">Tên đối tác</th>
                <th className="px-4 py-3.5 w-[200px]">Loại hình</th>
                <th className="px-6 py-3.5 text-right w-[140px]">Số giao dịch</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-sm text-slate-400 font-medium">Đang tải danh sách đối tác...</span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có đối tác nào</p>
                    <p className="text-xs text-slate-400 mt-1">Không tìm thấy đối tác nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              ) : rows.map((c) => {
                const cc = catCfg(c.category);
                return (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors duration-150 group">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-400 group-hover:text-blue-600 font-bold transition-colors">{c.code}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{c.name}</td>
                    <td className="px-4 py-3.5">
                      {c.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border" style={{ color: cc.color, background: cc.bg, borderColor: `${cc.color}20` }}>
                          {c.category}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {c.transaction_count > 0 ? (
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {c.transaction_count}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Dialog */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-lg bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Thêm đối tác mới</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Mã đối tác *</Label>
                  <Input value={form.code} onChange={set('code')} placeholder="NTP-001 hoặc NCC-001" className="h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Loại đối tác *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? 'ntp') as 'ntp' | 'ncc' }))}>
                    <SelectTrigger className="h-10 mt-1 w-full rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ntp">Nhà thầu phụ</SelectItem>
                      <SelectItem value="ncc">Nhà cung cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Tên đối tác *</Label>
                <Input value={form.name} onChange={set('name')} placeholder="Tên đầy đủ của công ty / cá nhân" className="h-10 rounded-xl border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Mã số thuế</Label>
                  <Input value={form.tax_code} onChange={set('tax_code')} placeholder="010xxxxxx" className="h-10 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Lĩnh vực hoạt động</Label>
                  <Input value={form.field} onChange={set('field')} placeholder="Xây dựng, cung cấp vật liệu..." className="h-10 rounded-xl border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Người liên hệ</Label>
                  <Input value={form.contact_person} onChange={set('contact_person')} placeholder="Họ và tên" className="h-10 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Số điện thoại</Label>
                  <Input value={form.phone} onChange={set('phone')} placeholder="090xxxxxxx" className="h-10 rounded-xl border-slate-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Email</Label>
                <Input value={form.email} onChange={set('email')} placeholder="partner@example.com" className="h-10 rounded-xl border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Địa chỉ trụ sở</Label>
                <Input value={form.address} onChange={set('address')} placeholder="Số nhà, đường, quận, thành phố..." className="h-10 rounded-xl border-slate-200" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <Button variant="outline" className="h-10 text-sm rounded-xl px-4 border-slate-200 text-slate-600" onClick={() => setOpen(false)}>Hủy</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 text-sm rounded-xl px-5 transition-all duration-200 shadow-sm" 
                disabled={!form.code || !form.name || createC.isPending} 
                onClick={submit}
              >
                {createC.isPending ? 'Đang lưu...' : 'Lưu đối tác'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
