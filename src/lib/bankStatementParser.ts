import type { ParsedBankRow } from '@/types/database';

// Từ khóa nhận diện cột (không dấu, lowercase)
const COL_KEYWORDS: Record<string, string[]> = {
  date_pay:  ['ngay thanh toan'],
  date_tx:   ['ngay giao dich'],
  content:   ['noi dung', 'dien giai'],
  debit:     ['ghi no', 'debit'],
  credit:    ['ghi co', 'credit'],
  code:      ['ma giao dich', 'transaction code'],
  partner:   ['khach hang', 'chu tk doi ung'],
  voucher:   ['chung tu'],
  project:   ['du an'],
  amount:    ['so tien'],
  type:      ['loai'],
};

function noAccent(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

function toISODate(v: any): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  // dd/mm/yyyy hoặc dd/mm/yyyy hh:mm:ss
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

function toNumber(v: any): number {
  if (typeof v === 'number') return Math.round(v);
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n);
}

/** Tìm dòng header = dòng khớp nhiều từ khóa nhất trong 10 dòng đầu */
function findHeaderRow(rows: any[][]): number {
  let best = -1, bestScore = 0;
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const cells = rows[i].map((c) => noAccent(String(c ?? '')));
    let score = 0;
    for (const kws of Object.values(COL_KEYWORDS)) {
      if (cells.some((c) => kws.some((k) => c.includes(k)))) score++;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return bestScore >= 3 ? best : -1;
}

/** Map tên field → chỉ số cột */
function mapColumns(headerCells: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  headerCells.forEach((cell, idx) => {
    const h = noAccent(String(cell ?? ''));
    if (!h) return;
    for (const [field, kws] of Object.entries(COL_KEYWORDS)) {
      if (map[field] === undefined && kws.some((k) => h.includes(k))) {
        map[field] = idx;
      }
    }
  });
  return map;
}

export type ParseResult = {
  rows: ParsedBankRow[];
  headerRow: number;
  columnsFound: string[];
  skipped: number;
  error?: string;
};

/** Bóc tách toàn bộ sao kê từ mảng 2D (SheetJS sheet_to_json header:1) */
export function parseBankStatement(raw: any[][]): ParseResult {
  const headerRow = findHeaderRow(raw);
  if (headerRow < 0) {
    return { rows: [], headerRow: -1, columnsFound: [], skipped: 0,
      error: 'Không nhận diện được dòng tiêu đề. Kiểm tra file có các cột: Ngày giao dịch, Diễn giải, Ghi nợ/Ghi có, Mã giao dịch...' };
  }
  const col = mapColumns(raw[headerRow]);
  const out: ParsedBankRow[] = [];
  let skipped = 0;

  for (let i = headerRow + 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r || r.every((c) => c == null || c === '')) continue;

    const get = (f: string) => (col[f] !== undefined ? r[col[f]] : undefined);

    const voucher = get('voucher') ? String(get('voucher')).trim().toUpperCase() : null;
    const debit = toNumber(get('debit'));
    const credit = toNumber(get('credit'));
    const explicitAmount = toNumber(get('amount'));
    const typeText = get('type') ? noAccent(String(get('type'))) : '';

    // Xác định Thu/Chi: ưu tiên chứng từ BC1/BN1, rồi cột Loại, rồi Ghi nợ/Ghi có
    let type: 'in' | 'out';
    if (voucher?.startsWith('BC')) type = 'in';
    else if (voucher?.startsWith('BN')) type = 'out';
    else if (typeText.includes('thu')) type = 'in';
    else if (typeText.includes('chi')) type = 'out';
    else if (credit > 0) type = 'in';
    else type = 'out';

    const amount = explicitAmount || (type === 'in' ? credit : debit) || Math.max(debit, credit);
    const date = toISODate(get('date_pay') ?? get('date_tx'));

    if (amount <= 0 || !date) { skipped++; continue; }

    out.push({
      transaction_code: get('code') ? String(get('code')).trim() : null,
      transaction_date: date,
      type,
      amount,
      partner_name: get('partner') ? String(get('partner')).trim() : null,
      note: get('content') ? String(get('content')).trim() : null,
      voucher,
      project_name: get('project') ? String(get('project')).trim() : null,
      project_id: null,
    });
  }

  return { rows: out, headerRow, columnsFound: Object.keys(col), skipped };
}

/** Gán project_id cho các dòng dựa trên danh sách dự án (khớp theo tên) */
export function matchProjects(
  rows: ParsedBankRow[],
  projects: { id: string; name: string }[]
): ParsedBankRow[] {
  const norm = projects.map((p) => ({ id: p.id, key: noAccent(p.name) }));
  return rows.map((r) => {
    if (!r.project_name) return r;
    const pk = noAccent(r.project_name);
    const hit = norm.find((p) => p.key === pk || p.key.includes(pk) || pk.includes(p.key));
    return hit ? { ...r, project_id: hit.id } : r;
  });
}
