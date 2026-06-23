// Metadata 10 giai đoạn vòng đời gói thầu (dùng chung cho Kanban + bảng + lọc)
export const BID_STAGES = [
  { id: 1,  name: 'Tìm kiếm cơ hội',    color: '#3B82F6', bg: '#EFF6FF' },
  { id: 2,  name: 'Đánh giá khả thi',   color: '#06B6D4', bg: '#ECFEFF' },
  { id: 3,  name: 'Quyết định dự thầu', color: '#6366F1', bg: '#EEF2FF' },
  { id: 4,  name: 'Dự thầu',            color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 5,  name: 'Thương thảo/Ký HĐ',  color: '#D946EF', bg: '#FDF4FF' },
  { id: 6,  name: 'Lựa chọn NTP/NCC',   color: '#10B981', bg: '#ECFDF5' },
  { id: 7,  name: 'Triển khai thi công', color: '#22C55E', bg: '#F0FDF4' },
  { id: 8,  name: 'Quyết toán',         color: '#F59E0B', bg: '#FFFBEB' },
  { id: 9,  name: 'Bảo hành',           color: '#F97316', bg: '#FFF7ED' },
  { id: 10, name: 'Thanh lý hợp đồng',  color: '#64748B', bg: '#F8FAFC' },
] as const;

export function getStage(id: number) {
  return BID_STAGES.find((s) => s.id === id) ?? BID_STAGES[0];
}

// Nhóm giai đoạn theo nghiệp vụ
export const OPPORTUNITY_STAGES = [1, 2];        // Cơ hội đấu thầu
export const SUBMISSION_STAGES = [3, 4, 5];      // Hồ sơ dự thầu
