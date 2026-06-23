// ============================================================
// CẤU HÌNH PHÂN QUYỀN TRUNG TÂM
// Muốn cấp/sửa quyền: chỉ cần chỉnh bảng PERMISSION_MATRIX bên dưới.
// ============================================================

export type UserRole = 'admin' | 'director' | 'manager' | 'staff';

export type Position =
  | 'director'      // Giám đốc
  | 'dept_head'     // Trưởng phòng
  | 'deputy_head'   // Phó phòng
  | 'team_lead'     // Tổ trưởng
  | 'specialist'    // Chuyên viên
  | 'staff';        // Nhân viên

// Mức truy cập cho từng module
//   full = toàn quyền (xem + sửa + xoá + phê duyệt)
//   edit = xem + thêm/sửa
//   view = chỉ xem
//   none = không truy cập
export type AccessLevel = 'full' | 'edit' | 'view' | 'none';

// Danh sách module trong hệ thống
export const MODULES = [
  { key: 'dashboard', label: 'Tổng quan' },
  { key: 'projects',  label: 'Dự án' },
  { key: 'bidding',   label: 'Đấu thầu (KHĐT)' },
  { key: 'contracts', label: 'Hợp đồng' },
  { key: 'finance',   label: 'Tài chính' },
  { key: 'reports',   label: 'Báo cáo' },
  { key: 'users',     label: 'Quản trị người dùng' },
] as const;

export type ModuleKey = (typeof MODULES)[number]['key'];

// Nhãn hiển thị + màu cho từng vai trò
export const ROLE_CONFIG: Record<UserRole, { label: string; desc: string; color: string; bg: string; rank: number }> = {
  admin:    { label: 'Quản trị HT', desc: 'Toàn quyền hệ thống',          color: '#9333EA', bg: '#F3E8FF', rank: 4 },
  director: { label: 'Giám đốc',    desc: 'Toàn quyền (ngang Quản trị)',  color: '#DC2626', bg: '#FEE2E2', rank: 4 },
  manager:  { label: 'Quản lý',     desc: 'Trưởng/phó phòng, tổ trưởng',  color: '#2563EB', bg: '#DBEAFE', rank: 2 },
  staff:    { label: 'Nhân viên',   desc: 'Nhân viên, chuyên viên',       color: '#64748B', bg: '#F1F5F9', rank: 1 },
};

// Nhãn chức danh
export const POSITION_CONFIG: Record<Position, { label: string; suggestRole: UserRole }> = {
  director:    { label: 'Giám đốc',     suggestRole: 'director' },
  dept_head:   { label: 'Trưởng phòng', suggestRole: 'manager' },
  deputy_head: { label: 'Phó phòng',    suggestRole: 'manager' },
  team_lead:   { label: 'Tổ trưởng',    suggestRole: 'manager' },
  specialist:  { label: 'Chuyên viên',  suggestRole: 'staff' },
  staff:       { label: 'Nhân viên',    suggestRole: 'staff' },
};

// ============================================================
// MA TRẬN PHÂN QUYỀN  —  Vai trò × Module
// Chỉnh ở đây để thay đổi quyền của từng vai trò.
// ============================================================
export const PERMISSION_MATRIX: Record<UserRole, Record<ModuleKey, AccessLevel>> = {
  //            dashboard  projects  bidding  contracts  finance  reports  users
  admin:    { dashboard: 'full', projects: 'full', bidding: 'full', contracts: 'full', finance: 'full', reports: 'full', users: 'full' },
  director: { dashboard: 'full', projects: 'full', bidding: 'full', contracts: 'full', finance: 'full', reports: 'full', users: 'full' },
  manager:  { dashboard: 'view', projects: 'edit', bidding: 'edit', contracts: 'edit', finance: 'view', reports: 'full', users: 'none' },
  staff:    { dashboard: 'view', projects: 'view', bidding: 'view', contracts: 'view', finance: 'none', reports: 'view', users: 'none' },
};

// ============================================================
// HÀM TIỆN ÍCH
// ============================================================

/** Lấy mức truy cập của 1 vai trò với 1 module */
export function getAccess(role: UserRole, module: ModuleKey): AccessLevel {
  return PERMISSION_MATRIX[role]?.[module] ?? 'none';
}

/** Vai trò có được XEM module không? */
export function canView(role: UserRole, module: ModuleKey): boolean {
  return getAccess(role, module) !== 'none';
}

/** Vai trò có được CHỈNH SỬA module không? (edit hoặc full) */
export function canEdit(role: UserRole, module: ModuleKey): boolean {
  const a = getAccess(role, module);
  return a === 'edit' || a === 'full';
}

/** Vai trò có toàn quyền (xoá, phê duyệt) module không? */
export function canManage(role: UserRole, module: ModuleKey): boolean {
  return getAccess(role, module) === 'full';
}

/** Là vai trò quản trị (admin hoặc giám đốc)? */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'director';
}

// Nhãn + màu cho mức truy cập (dùng hiển thị ma trận)
export const ACCESS_CONFIG: Record<AccessLevel, { label: string; color: string; bg: string }> = {
  full: { label: 'Toàn quyền', color: '#15803D', bg: '#DCFCE7' },
  edit: { label: 'Chỉnh sửa',  color: '#1D4ED8', bg: '#DBEAFE' },
  view: { label: 'Chỉ xem',    color: '#64748B', bg: '#F1F5F9' },
  none: { label: 'Khoá',       color: '#9CA3AF', bg: '#F9FAFB' },
};
