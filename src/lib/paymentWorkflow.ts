// Quy tắc workflow duyệt đề nghị chi (no-code: chỉnh ngưỡng tại đây)

/** Số cấp duyệt theo hạn mức tiền */
export function requiredLevels(amount: number): number {
  if (amount <= 50_000_000) return 1;        // ≤ 50 triệu: 1 cấp
  if (amount <= 500_000_000) return 2;       // ≤ 500 triệu: 2 cấp
  return 3;                                   // > 500 triệu: 3 cấp
}

/** Mô tả người duyệt từng cấp */
export const LEVEL_LABEL: Record<number, string> = {
  1: 'Quản lý (Trưởng/phó phòng)',
  2: 'Giám đốc',
  3: 'Tổng giám đốc / Admin',
};

/** Vai trò có quyền duyệt 1 cấp cụ thể */
export function canApproveLevel(role: string, level: number): boolean {
  if (role === 'admin' || role === 'director') return true;   // duyệt mọi cấp
  if (role === 'manager') return level === 1;                  // quản lý chỉ cấp 1
  return false;
}

export const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Chờ duyệt',  color: '#B45309', bg: '#FEF3C7' },
  approved: { label: 'Đã duyệt',   color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: 'Từ chối',    color: '#B91C1C', bg: '#FEE2E2' },
  paid:     { label: 'Đã chi',     color: '#1D4ED8', bg: '#DBEAFE' },
};
