# 🏗️ KẾ HOẠCH XÂY DỰNG PHẦN MỀM QUẢN LÝ DỰ ÁN — TRUNGNAM E&C
> **Stack**: Antigravity + Supabase (PostgreSQL) · ~200 users · Phiên bản 1.0

---

## 1. TẦM NHÌN & PHẠM VI

### Mục tiêu
Xây dựng hệ thống quản lý dự án xây lắp từ đầu đến cuối (end-to-end), bao phủ toàn bộ vòng đời dự án từ **tìm kiếm cơ hội** đến **thanh lý hợp đồng**, liên thông dữ liệu giữa các phòng ban.

### Các phòng ban liên quan
| Phòng | Viết tắt | Vai trò chính |
|---|---|---|
| Kế hoạch Đấu thầu | KHĐT | Quản lý đấu thầu, hồ sơ dự thầu |
| Quản lý Dự án | QLDA / BDH | Triển khai thi công, giám sát tiến độ |
| Tài chính Kế toán | TCKT / KT | Dòng tiền, thanh toán, quyết toán |
| Hành chính Nhân sự | HCNS | Nhân lực, văn phòng |
| Ban Giám đốc | BGĐ | Phê duyệt, báo cáo tổng hợp |

### Vòng đời dự án (10 giai đoạn)
```
[1] Tìm kiếm cơ hội
       ↓
[2] Đánh giá khả thi
       ↓
[3] Quyết định Dự thầu  ←── KHĐT chủ trì
       ↓
[4] Dự thầu (lập & nộp HSDT)
       ↓
[5] Thương thảo / Ký HĐ A-B
       ↓
[6] Lựa chọn NTP / NCC  ←── QLDA tiếp nhận
       ↓
[7] Chuẩn bị & Triển khai Thi công
       ↓
[8] Quyết toán  ←── KT tham gia
       ↓
[9] Bảo hành
       ↓
[10] Thanh lý Hợp đồng
```

---

## 2. GIAI ĐOẠN TRIỂN KHAI

### Giai đoạn 1 — Core (KHĐT + QLDA) — Ưu tiên cao nhất
- Module Dự án & Gói thầu
- Module Đấu thầu (stages 1–5)
- Module Hợp đồng A-B
- Module Lựa chọn NTP/NCC & Hợp đồng B-C
- Module Tiến độ thi công (stages 6–7)
- Báo cáo tuần / tháng nội bộ

### Giai đoạn 2 — Finance (KT + TCKT)
- Module Kế hoạch tài chính
- Module Thanh toán / Giải ngân
- Module Quyết toán dự án
- Module Bảo hành & Thanh lý
- Dashboard dòng tiền theo tài khoản ngân hàng

### Giai đoạn 3 — Intelligence & Integration
- AI tóm tắt báo cáo
- Cảnh báo lệch tiến độ / ngân sách
- Tích hợp email / Zalo thông báo
- Export báo cáo Excel/PDF

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN (Antigravity)

```
trungnam-ec-app/
│
├── 📁 src/
│   │
│   ├── 📁 app/                        # Pages / Routes
│   │   ├── 📁 (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── 📁 (dashboard)/            # Màn hình chính sau đăng nhập
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Dashboard tổng quan
│   │   │   │
│   │   │   ├── 📁 projects/           # MODULE: DỰ ÁN
│   │   │   │   ├── page.tsx           # Danh sách dự án
│   │   │   │   ├── new/page.tsx       # Tạo dự án mới
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Chi tiết dự án
│   │   │   │       ├── overview/      # Tổng quan
│   │   │   │       ├── bid-packages/  # Gói thầu
│   │   │   │       ├── contracts/     # Hợp đồng
│   │   │   │       ├── progress/      # Tiến độ thi công
│   │   │   │       ├── finance/       # Tài chính dự án
│   │   │   │       ├── documents/     # Tài liệu
│   │   │   │       └── settlement/    # Quyết toán
│   │   │   │
│   │   │   ├── 📁 bidding/            # MODULE: ĐẤU THẦU (KHĐT)
│   │   │   │   ├── page.tsx           # Tổng quan đấu thầu
│   │   │   │   ├── opportunities/     # Cơ hội
│   │   │   │   ├── feasibility/       # Đánh giá khả thi
│   │   │   │   ├── decisions/         # Quyết định dự thầu
│   │   │   │   ├── submissions/       # Hồ sơ dự thầu
│   │   │   │   └── results/           # Kết quả đấu thầu
│   │   │   │
│   │   │   ├── 📁 contracts/          # MODULE: HỢP ĐỒNG
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ab-contracts/      # HĐ A-B (chủ đầu tư)
│   │   │   │   └── bc-contracts/      # HĐ B-C (NTP/NCC)
│   │   │   │
│   │   │   ├── 📁 contractors/        # MODULE: NTP/NCC
│   │   │   │   ├── page.tsx           # Danh mục nhà thầu phụ/NCC
│   │   │   │   ├── [id]/page.tsx      # Hồ sơ nhà thầu
│   │   │   │   └── evaluation/        # Đánh giá năng lực
│   │   │   │
│   │   │   ├── 📁 finance/            # MODULE: TÀI CHÍNH (KT)
│   │   │   │   ├── page.tsx           # Dashboard dòng tiền
│   │   │   │   ├── cash-flow/         # Dòng tiền
│   │   │   │   ├── payments/          # Thanh toán
│   │   │   │   ├── bank-accounts/     # Tài khoản ngân hàng
│   │   │   │   └── reports/           # Báo cáo tài chính
│   │   │   │
│   │   │   ├── 📁 reports/            # MODULE: BÁO CÁO
│   │   │   │   ├── weekly/            # Báo cáo tuần
│   │   │   │   ├── monthly/           # Báo cáo tháng
│   │   │   │   └── custom/            # Báo cáo tùy chỉnh
│   │   │   │
│   │   │   └── 📁 settings/           # CÀI ĐẶT HỆ THỐNG
│   │   │       ├── users/             # Quản lý người dùng
│   │   │       ├── departments/       # Phòng ban
│   │   │       ├── roles/             # Phân quyền
│   │   │       └── master-data/       # Danh mục chuẩn hóa
│   │
│   ├── 📁 components/                 # UI Components
│   │   ├── 📁 ui/                     # Base components (Button, Input, Modal...)
│   │   ├── 📁 layout/                 # Sidebar, Header, Breadcrumb
│   │   ├── 📁 project/                # Project-specific components
│   │   ├── 📁 bidding/                # Bidding components
│   │   ├── 📁 finance/                # Finance components
│   │   ├── 📁 charts/                 # Biểu đồ, dashboard widgets
│   │   └── 📁 shared/                 # Reusable across modules
│   │
│   ├── 📁 lib/                        # Utilities & config
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client
│   │   │   ├── server.ts              # Supabase server client
│   │   │   └── middleware.ts          # Auth middleware
│   │   ├── utils/
│   │   │   ├── formatters.ts          # Format tiền, ngày tháng VN
│   │   │   ├── validators.ts          # Validate forms
│   │   │   └── constants.ts           # Hằng số hệ thống
│   │   └── hooks/                     # Custom React hooks
│   │       ├── useProjects.ts
│   │       ├── useBidding.ts
│   │       └── useFinance.ts
│   │
│   └── 📁 types/                      # TypeScript interfaces
│       ├── project.types.ts
│       ├── bidding.types.ts
│       ├── contract.types.ts
│       ├── finance.types.ts
│       └── user.types.ts
│
├── 📁 supabase/                       # Supabase config
│   ├── 📁 migrations/                 # SQL migration files (đánh số thứ tự)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_seed_master_data.sql
│   │   └── 004_functions_triggers.sql
│   ├── 📁 functions/                  # Edge Functions
│   │   ├── send-notification/
│   │   ├── generate-report/
│   │   └── sync-data/
│   └── config.toml
│
├── 📁 docs/                           # Tài liệu kỹ thuật
│   ├── database-schema.md
│   ├── api-reference.md
│   ├── user-guide.md
│   └── deployment.md
│
└── 📄 README.md
```

---

## 4. SUPABASE DATABASE SCHEMA

### 4.1 Authentication & Authorization

```sql
-- Profiles (mở rộng từ auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES roles(id),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phòng ban
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,       -- 'KHDT', 'QLDA', 'TCKT', 'HCNS', 'BGD'
  name TEXT NOT NULL,              -- 'Kế hoạch Đấu thầu'
  parent_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true
);

-- Phân quyền
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,       -- 'admin', 'manager', 'staff', 'viewer'
  permissions JSONB DEFAULT '{}'   -- {"projects": "write", "finance": "read"}
);
```

### 4.2 Core Business Tables

```sql
-- DỰ ÁN (Projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT UNIQUE NOT NULL,      -- 'DA-2024-001'
  name TEXT NOT NULL,
  description TEXT,
  owner_unit TEXT,                        -- Chủ đầu tư
  location TEXT,
  province TEXT,
  total_value NUMERIC(20,2),             -- Giá trị hợp đồng A-B
  currency TEXT DEFAULT 'VND',
  status TEXT DEFAULT 'opportunity',      -- Enum: xem bên dưới
  stage INTEGER DEFAULT 1,               -- Giai đoạn hiện tại (1-10)
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  department_id UUID REFERENCES departments(id),  -- KHĐT hoặc QLDA
  project_manager_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STATUS ENUM cho dự án
-- 'opportunity'      → Cơ hội
-- 'feasibility'      → Đang đánh giá khả thi
-- 'bid_decision'     → Chờ quyết định dự thầu
-- 'bidding'          → Đang dự thầu
-- 'negotiating'      → Thương thảo hợp đồng
-- 'contracted'       → Đã ký HĐ A-B
-- 'selecting_sub'    → Lựa chọn NTP/NCC
-- 'construction'     → Đang thi công
-- 'settlement'       → Quyết toán
-- 'warranty'         → Bảo hành
-- 'completed'        → Thanh lý / Hoàn thành
-- 'cancelled'        → Hủy

-- GÓI THẦU (Bid Packages)
CREATE TABLE bid_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  package_code TEXT NOT NULL,             -- 'XL1', 'XL2', 'TV1'
  name TEXT NOT NULL,
  package_type TEXT,                      -- 'xay_lap', 'tu_van', 'hang_hoa'
  estimated_value NUMERIC(20,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HỢP ĐỒNG (Contracts)
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  bid_package_id UUID REFERENCES bid_packages(id),
  contract_code TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL,            -- 'AB' (chủ đầu tư), 'BC' (NTP/NCC)
  party_a_name TEXT,                      -- Chủ đầu tư / Trungnam EC
  party_b_name TEXT,                      -- Trungnam EC / NTP
  contractor_id UUID REFERENCES contractors(id),
  contract_value NUMERIC(20,2),
  signed_date DATE,
  start_date DATE,
  end_date DATE,
  advance_amount NUMERIC(20,2),          -- Tạm ứng
  advance_percentage NUMERIC(5,2),
  retention_percentage NUMERIC(5,2),     -- Bảo lãnh thực hiện %
  payment_terms TEXT,
  status TEXT DEFAULT 'draft',            -- 'draft', 'signed', 'active', 'settled', 'liquidated'
  documents JSONB DEFAULT '[]',          -- Danh sách file đính kèm
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NHÀ THẦU PHỤ / NHÀ CUNG CẤP (Contractors/Suppliers)
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contractor_type TEXT,                   -- 'ntp' (nhà thầu phụ), 'ncc' (nhà cung cấp)
  tax_code TEXT,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  bank_account TEXT,
  bank_name TEXT,
  rating INTEGER DEFAULT 3,              -- Đánh giá 1-5
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TÀI KHOẢN NGÂN HÀNG (Bank Accounts)
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acc_code TEXT UNIQUE NOT NULL,          -- 'TK011', 'TK022'...
  account_number TEXT NOT NULL,           -- STK
  account_name TEXT NOT NULL,
  bank_name TEXT,
  branch TEXT,
  project_group TEXT,                     -- 'EC NEW', 'Đà Nẵng', 'Cao tốc'
  is_active BOOLEAN DEFAULT true
);

-- GIAI ĐOẠN DỰ ÁN (Stage tracking)
CREATE TABLE project_stage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  stage_number INTEGER NOT NULL,          -- 1-10
  stage_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',          -- 'pending', 'in_progress', 'completed', 'skipped'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES profiles(id)
);
```

### 4.3 Finance Tables (Giai đoạn 2)

```sql
-- KẾ HOẠCH TÀI CHÍNH
CREATE TABLE financial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  plan_year INTEGER NOT NULL,
  plan_month INTEGER,
  planned_revenue NUMERIC(20,2),
  planned_cost NUMERIC(20,2),
  planned_profit NUMERIC(20,2),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DÒNG TIỀN (Cash Flow)
CREATE TABLE cash_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  contract_id UUID REFERENCES contracts(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  flow_type TEXT NOT NULL,                -- 'thu' (inflow), 'chi' (outflow)
  category TEXT,                          -- 'tam_ung', 'thanh_toan', 'quyet_toan', 'bao_lanh'
  amount NUMERIC(20,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  reference_no TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ĐỀ NGHỊ THANH TOÁN
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  contract_id UUID REFERENCES contracts(id),
  request_code TEXT UNIQUE,
  request_type TEXT,                      -- 'tam_ung', 'thanh_toan_khoi_luong', 'quyet_toan'
  amount NUMERIC(20,2) NOT NULL,
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft',            -- 'draft', 'submitted', 'approved', 'rejected', 'paid'
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT
);
```

### 4.4 Row Level Security (RLS)

```sql
-- Nguyên tắc phân quyền:
-- BGĐ        → xem toàn bộ, phê duyệt các bước quan trọng
-- KHĐT       → full access stage 1-5 (đấu thầu)
-- QLDA       → full access stage 6-8 (thi công, quyết toán)
-- TCKT/KT    → full access finance tables, read projects
-- HCNS       → read-only hầu hết, manage users/profiles
-- Staff      → chỉ thấy dự án mình tham gia

-- Ví dụ RLS cho projects:
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_see_own_projects" ON projects
  FOR SELECT USING (
    project_manager_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'bgd', 'manager')
  );
```

---

## 5. LUỒNG DỮ LIỆU GIỮA CÁC PHÒNG BAN

```
KHĐT                    QLDA                    KT/TCKT
  │                       │                       │
  ├─ Tạo Dự án           │                       │
  ├─ Lập HSDT            │                       │
  ├─ Ký HĐ A-B ─────────►│                       │
  │                       ├─ Tạo HSYC NTP/NCC    │
  │                       ├─ Ký HĐ B-C ──────────►│
  │                       ├─ Kế hoạch thi công   │
  │                       ├─ Báo cáo tiến độ     │
  │                       ├─ Nghiệm thu KL ───────►│
  │                       │                       ├─ Đề nghị TT A
  │                       │                       ├─ Thanh toán NTP
  │                       ├─ Quyết toán ──────────►│
  │                       │                       ├─ Quyết toán thuế
  │                       ├─ Bảo hành            │
  │                       ├─ Thanh lý ────────────►│
  │                       │                       └─ Đóng dự án
```

---

## 6. PHÂN QUYỀN HỆ THỐNG

| Role | Đấu thầu | Dự án | Hợp đồng | Tài chính | Admin |
|---|---|---|---|---|---|
| admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| bgd (Ban GĐ) | 👁 Read + Approve | 👁 Read + Approve | 👁 Read | ✅ Full | ❌ |
| khdt_manager | ✅ Full | ✅ Write | ✅ Write | 👁 Read | ❌ |
| qlda_manager | 👁 Read | ✅ Full | ✅ Write | 👁 Read | ❌ |
| kt_manager | ❌ | 👁 Read | 👁 Read | ✅ Full | ❌ |
| staff | ✅ Own only | ✅ Own only | 👁 Read | ❌ | ❌ |
| viewer | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ❌ |

---

## 7. API ENDPOINTS (Edge Functions / Server Actions)

### Projects
```
GET    /api/projects              → Danh sách dự án (filter by status, dept)
POST   /api/projects              → Tạo dự án mới
GET    /api/projects/:id          → Chi tiết dự án + stage hiện tại
PUT    /api/projects/:id          → Cập nhật dự án
POST   /api/projects/:id/advance  → Chuyển sang giai đoạn tiếp theo
```

### Bidding
```
GET    /api/bidding/opportunities → Danh sách cơ hội
POST   /api/bidding/feasibility   → Tạo đánh giá khả thi
POST   /api/bidding/decisions     → Quyết định dự thầu (kèm phê duyệt)
POST   /api/bidding/submissions   → Nộp hồ sơ dự thầu
```

### Finance
```
GET    /api/finance/cashflow      → Dòng tiền theo dự án / TK ngân hàng
POST   /api/finance/payments      → Tạo đề nghị thanh toán
PUT    /api/finance/payments/:id/approve → Phê duyệt thanh toán
GET    /api/finance/reports/weekly → Báo cáo tuần KHTC
```

---

## 8. NOTIFICATIONS & WORKFLOW

### Trigger tự động (Supabase Edge Functions)
| Sự kiện | Thông báo đến |
|---|---|
| Dự án chuyển sang giai đoạn mới | Manager phòng ban liên quan |
| HĐ B-C sắp hết hạn (30 ngày) | QLDA Manager |
| Đề nghị TT chờ duyệt | BGĐ / KT Manager |
| Tiến độ thi công chậm so KH | QLDA + BGĐ |
| Quyết toán hoàn thành | TCKT + BGĐ |

---

## 9. ROADMAP TRIỂN KHAI

### Sprint 1 (Tuần 1-2): Nền tảng
- [ ] Setup Supabase project + auth
- [ ] Migration: departments, roles, profiles
- [ ] Setup Row Level Security cơ bản
- [ ] Seed data: danh mục chuẩn hóa từ DM Chuẩn hóa sheet
- [ ] Login / Logout / Quản lý profile

### Sprint 2 (Tuần 3-4): Dự án & Đấu thầu
- [ ] CRUD dự án + gói thầu
- [ ] Luồng stages 1-4 (Cơ hội → Dự thầu)
- [ ] Upload tài liệu (Supabase Storage)
- [ ] Dashboard KHĐT

### Sprint 3 (Tuần 5-6): Hợp đồng & QLDA
- [ ] Module Hợp đồng A-B
- [ ] Module NTP/NCC + Hợp đồng B-C
- [ ] Module Tiến độ thi công
- [ ] Báo cáo tuần tự động

### Sprint 4 (Tuần 7-8): Tài chính cơ bản
- [ ] Tài khoản ngân hàng (từ DM Chuẩn hóa)
- [ ] Dòng tiền Thu/Chi theo dự án
- [ ] Đề nghị thanh toán + workflow duyệt
- [ ] Dashboard KT/TCKT

### Sprint 5 (Tuần 9-10): Báo cáo & Quyết toán
- [ ] Module Quyết toán + Bảo hành
- [ ] Báo cáo tổng hợp BGĐ
- [ ] Export Excel/PDF
- [ ] Thông báo tự động

### Sprint 6 (Tuần 11-12): Hoàn thiện & UAT
- [ ] User testing với KHĐT, QLDA, KT
- [ ] Fix bugs, tối ưu hiệu năng
- [ ] Training người dùng
- [ ] Go-live

---

## 10. MASTER DATA CẦN SEED (từ DM Chuẩn hóa sheet)

### Danh mục Tài khoản ngân hàng
| Code | STK | Tên TK | Nhóm |
|---|---|---|---|
| TK011 | 0190 5801 011 | TNEC A GIÁP NHẬN | EC NEW |
| TK022 | 0190 5801 022 | TK Tây Ninh EC NEW | EC NEW |
| TK024 | 0190 5801 024 | Tạm ứng đợt 2 An Giang | EC NEW |
| TK025 | 0190 5801 025 | TK các dự án nội bộ TNG | EC NEW |
| TK026 | 0190 5801 026 | TK chung EC NEW | EC NEW |
| TK027 | 0190 5801 027 | TK Tỉnh lộ 8 | EC NEW |
| TK004 | 0190 5801 004 | DA khu tái định cư Hòa Bắc gỡ 2 | Đà Nẵng |
| TK000 | 0190 5801 000 | TK Trung Nam EC chung | Đà Nẵng |
| TK005 | 0190 5801 005 | DA tuyến đường vành đai phía Tây | Đà Nẵng |
| TK016 | 0190 5801 016 | TK EC chung Đà Nẵng | Đà Nẵng |
| TK001 | 0190 5801 001 | Cao tốc KHBM | Cao tốc |
| TK007 | 0190 5801 007 | Cao tốc Hậu Giang | Cao tốc |
| TK008 | 0190 5801 008 | Cao tốc Sóc Trăng | Cao tốc |
| TK018 | 0190 5801 018 | TK Cao tốc | Cao tốc |
| TK019 | 0190 5801 019 | TK Cao tốc (2) | Cao tốc |

> ⚠️ **Lưu ý**: TK019 đang ghi "TK CAO TỐC" dính chữ — cần làm sạch tên trước khi import

### Giá trị cần loại trừ (không phải dự án)
- P.HCNS, P.KHĐT / PKHĐT, Phòng TCKT → Đưa vào bảng departments
- Tồn quỹ EC Đà Nẵng, Tồn quỹ KHÁC, Tổng tồn quỹ EC NEW → Là dòng tổng, không import vào transactions
- Grand Total / Loại / Dự trị → Bỏ qua khi import

---

## 11. CÁC ĐIỂM LOGIC QUAN TRỌNG

1. **Một Dự án có nhiều Gói thầu** — mỗi gói thầu có vòng đời riêng
2. **Một Gói thầu sinh ra một HĐ A-B** (với chủ đầu tư)
3. **Một HĐ A-B có thể phân thành nhiều HĐ B-C** (cho từng NTP/NCC)
4. **Dòng tiền phải gắn với cả dự án VÀ tài khoản ngân hàng** để khớp sổ KT
5. **Phân quyền theo giai đoạn**: KHĐT chỉ push được sang QLDA khi HĐ A-B đã ký
6. **Báo cáo tuần** cần tổng hợp từ nhiều bảng → dùng Supabase Views
7. **Audit log**: mọi thay đổi quan trọng (ký HĐ, phê duyệt TT) cần ghi lịch sử

---

## 12. CÂU HỎI CẦN XÁC NHẬN TRƯỚC KHI CODE

- [ ] Antigravity là framework nào? (Next.js? Vue? Flutter Web?) → ảnh hưởng cấu trúc folder
- [ ] Có dùng Supabase Storage cho file đính kèm không?
- [ ] Zalo/Email notification hay chỉ in-app?
- [ ] Có cần offline mode không? (cho BCH tại công trường)
- [ ] Quy trình phê duyệt: 1 bước hay nhiều bước? (VD: staff → manager → BGĐ)
- [ ] Có import dữ liệu từ file Excel cũ không?

---

*Tài liệu này sẽ được cập nhật sau khi xác nhận các điểm trên.*
*Phiên bản: 1.0 | Ngày: 23/06/2026 | Chuẩn bị bởi: Claude (Anthropic)*
