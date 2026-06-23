"use client";

import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useProjects } from '@/lib/hooks/useProjects';
import { useImportBankTransactions } from '@/lib/hooks/useBankImport';
import { parseBankStatement, matchProjects, type ParseResult } from '@/lib/bankStatementParser';
import { cn } from '@/lib/utils';

export default function BankImportPage() {
  const { data: projects = [] } = useProjects();
  const importTx = useImportBankTransactions();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [done, setDone] = useState<{ inserted: number; total: number } | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFile = async (file: File) => {
    setParsing(true); setDone(null); setResult(null); setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      // Quét mọi sheet, chọn sheet bóc tách được nhiều giao dịch nhất
      let best: ParseResult | null = null;
      for (const name of wb.SheetNames) {
        const raw = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, raw: true, defval: null });
        const p = parseBankStatement(raw as any[][]);
        if (!p.error && (!best || p.rows.length > best.rows.length)) best = p;
      }
      const parsed = best ?? { rows: [], headerRow: -1, columnsFound: [], skipped: 0,
        error: 'Không tìm thấy sheet sao kê hợp lệ trong file.' };
      parsed.rows = matchProjects(parsed.rows, projects);
      setResult(parsed);
    } catch (e: any) {
      setResult({ rows: [], headerRow: -1, columnsFound: [], skipped: 0, error: 'Lỗi đọc file: ' + e.message });
    } finally {
      setParsing(false);
    }
  };

  const stats = useMemo(() => {
    if (!result) return null;
    const r = result.rows;
    return {
      thu: r.filter((x) => x.type === 'in').reduce((s, x) => s + x.amount, 0),
      chi: r.filter((x) => x.type === 'out').reduce((s, x) => s + x.amount, 0),
      matched: r.filter((x) => x.project_id).length,
      unmatched: r.filter((x) => x.project_name && !x.project_id).length,
    };
  }, [result]);

  const doImport = async () => {
    if (!result?.rows.length) return;
    const res = await importTx.mutateAsync(result.rows);
    setDone(res);
  };

  const reset = () => { setResult(null); setFileName(''); setDone(null); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">Import sao kê ngân hàng</h1>
        <p className="text-sm text-surface-500 mt-0.5">Tải file sao kê (.xlsx) → tự bóc tách → ghi vào Sổ dòng tiền. Chống trùng theo mã GD.</p>
      </div>

      {/* Upload zone */}
      {!result && (
        <Card
          className="border-2 border-dashed border-surface-300 bg-surface-50/50 py-14 text-center cursor-pointer hover:border-brand-primary/50 hover:bg-blue-50/30 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-700">{parsing ? 'Đang đọc file...' : 'Kéo thả file sao kê hoặc bấm để chọn'}</p>
          <p className="text-xs text-surface-400 mt-1">Hỗ trợ .xlsx, .xls — tự nhận diện cột Ngày, Diễn giải, Ghi nợ/có, Mã GD, Dự án</p>
        </Card>
      )}

      {/* Error */}
      {result?.error && (
        <Card className="border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800">{result.error}</p>
            <Button variant="outline" className="h-8 text-xs mt-2" onClick={reset}>Chọn file khác</Button>
          </div>
        </Card>
      )}

      {/* Preview */}
      {result && !result.error && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-surface-600">
              <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
              <span className="font-medium">{fileName}</span>
              <span className="text-surface-400">· {result.rows.length} giao dịch · nhận diện {result.columnsFound.length} cột{result.skipped ? ` · bỏ ${result.skipped} dòng trống` : ''}</span>
            </div>
            <button onClick={reset} className="text-surface-400 hover:text-surface-700 text-sm flex items-center gap-1"><X className="w-4 h-4" />Hủy</button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-emerald-600">Tổng Thu</p><p className="text-lg font-bold text-surface-900 mt-1"><CurrencyDisplay amount={stats.thu} /></p></Card>
              <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-rose-600">Tổng Chi</p><p className="text-lg font-bold text-surface-900 mt-1"><CurrencyDisplay amount={stats.chi} /></p></Card>
              <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-surface-500">Gán được dự án</p><p className="text-lg font-bold text-emerald-600 mt-1">{stats.matched}</p></Card>
              <Card className="border-surface-200 shadow-sm p-4"><p className="text-xs text-surface-500">Chưa khớp dự án</p><p className="text-lg font-bold text-amber-600 mt-1">{stats.unmatched}</p></Card>
            </div>
          )}

          {done ? (
            <Card className="border-emerald-200 bg-emerald-50 p-5 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Đã ghi sổ {done.inserted}/{done.total} giao dịch.</p>
                {done.inserted < done.total && <p className="text-xs text-emerald-700 mt-0.5">{done.total - done.inserted} dòng đã tồn tại (trùng mã GD) nên được bỏ qua.</p>}
              </div>
              <Button variant="outline" className="h-9 text-sm" onClick={reset}>Import file khác</Button>
            </Card>
          ) : (
            <Card className="border-surface-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100 bg-surface-50/50 flex items-center justify-between">
                <span className="text-sm font-medium text-surface-700">Xem trước trước khi ghi</span>
                <Button className="bg-brand-primary text-white h-9 text-sm" disabled={importTx.isPending || result.rows.length === 0} onClick={doImport}>
                  {importTx.isPending ? 'Đang ghi...' : <>Ghi {result.rows.length} GD vào sổ <ArrowRight className="w-4 h-4 ml-1.5" /></>}
                </Button>
              </div>
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-surface-50">
                    <tr className="border-b border-surface-100 text-xs text-surface-500 uppercase tracking-wider">
                      <th className="text-left font-medium px-4 py-2 w-[95px]">Ngày</th>
                      <th className="text-center font-medium px-2 py-2 w-[60px]">Loại</th>
                      <th className="text-left font-medium px-2 py-2 min-w-[260px]">Nội dung</th>
                      <th className="text-left font-medium px-2 py-2 w-[150px]">Dự án</th>
                      <th className="text-right font-medium px-4 py-2 w-[140px]">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 200).map((r, i) => (
                      <tr key={i} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                        <td className="px-4 py-2 text-xs font-mono text-surface-500">{r.transaction_date}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold', r.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                            {r.type === 'in' ? 'THU' : 'CHI'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs text-surface-700 line-clamp-1 max-w-[360px]" title={r.note || ''}>{r.note || '—'}</td>
                        <td className="px-2 py-2 text-xs">
                          {r.project_name ? (
                            <span className={cn(r.project_id ? 'text-surface-700' : 'text-amber-600')} title={r.project_id ? 'Đã khớp dự án' : 'Chưa khớp — sẽ lưu dạng text'}>
                              {r.project_name}{!r.project_id && ' ⚠'}
                            </span>
                          ) : <span className="text-surface-300">—</span>}
                        </td>
                        <td className={cn('px-4 py-2 text-right font-mono text-xs font-semibold', r.type === 'in' ? 'text-emerald-700' : 'text-rose-600')}>
                          {r.type === 'in' ? '+' : '-'}<CurrencyDisplay amount={r.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 200 && <p className="text-center text-xs text-surface-400 py-2">… và {result.rows.length - 200} dòng nữa (sẽ ghi đầy đủ)</p>}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
