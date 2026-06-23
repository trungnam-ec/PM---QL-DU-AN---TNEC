# MASTER PROMPT — Trungnam E&C Project Management App
> Copy toàn bộ prompt này vào AI coding tool (Cursor / v0 / Claude Code / Lovable)

---

## PHẦN 1 — CONTEXT & TECH STACK

```
You are building a professional B2B project management web application for Trungnam E&C,
a Vietnamese construction and infrastructure company (~200 internal users).

Tech stack:
- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode)
- Database: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Styling: Tailwind CSS v3
- UI Components: shadcn/ui
- Data fetching: TanStack Query v5
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Deploy: Vercel

Project structure:
/src
  /app          → Next.js App Router pages
  /components   → UI components
  /lib          → Supabase client, utilities, hooks
  /types        → TypeScript interfaces
/supabase
  /migrations   → SQL files
```

---

## PHẦN 2 — DESIGN SYSTEM (BẮT BUỘC TUÂN THỦ)

```
DESIGN PHILOSOPHY:
Hybrid between Apple HIG and Google Material 3, optimized for data-heavy B2B apps.
Reference: Linear.app, Vercel Dashboard, Notion — NOT consumer apps like Instagram or Shopify.

CORE RULES:
1. Information density: show MORE data per screen than typical consumer apps
2. Left border accent (border-left: 3px) on cards to indicate status — replaces heavy shadows
3. Whitespace is deliberate, not generous — business users scan, not browse
4. All currency formatted as Vietnamese Dong: ₫ X,XXX tỷ or ₫ X.XXX.XXX.XXX
5. All dates in Vietnamese format: DD/MM/YYYY
6. Dark mode support mandatory from day one
```

### Color Tokens (add to tailwind.config.ts)

```typescript
// tailwind.config.ts
const colors = {
  brand: {
    primary:   '#1A4B8C',  // Navy blue — main brand color
    accent:    '#E8852A',  // Orange — highlight, CTAs
    dark:      '#0F172A',  // Near-black — dark mode bg
  },
  status: {
    success:   '#22C55E',  // Đang thi công / Hoàn thành
    warning:   '#F59E0B',  // Cảnh báo tiến độ / Chờ duyệt
    danger:    '#EF4444',  // Trễ tiến độ / Từ chối
    info:      '#3B82F6',  // Thông tin / Đang xử lý
    neutral:   '#94A3B8',  // Không hoạt động / Draft
  },
  surface: {
    50:        '#F8FAFC',  // Page background
    100:       '#F1F5F9',  // Card background
    200:       '#E2E8F0',  // Border default
    300:       '#CBD5E1',  // Border hover
    600:       '#475569',  // Text secondary
    800:       '#1E293B',  // Text primary
    900:       '#0F172A',  // Text headings
  }
}
```

### Typography

```css
/* Headings — never exceed font-weight 600 */
h1: text-2xl font-semibold text-slate-900          /* Page titles */
h2: text-lg font-medium text-slate-800             /* Section titles */
h3: text-base font-medium text-slate-700           /* Card titles */

/* Body */
body: text-sm text-slate-700 leading-relaxed       /* Default content */
caption: text-xs text-slate-500                    /* Labels, metadata */

/* Monospace — for codes, amounts */
code/amount: font-mono text-sm                     /* Mã dự án, số tiền */
```

### Spacing & Radius

```
Border radius:
- Button, Badge, Input: rounded-md (6px)
- Card: rounded-xl (12px)
- Modal, Drawer: rounded-2xl (16px)
- Avatar: rounded-full

Spacing scale:
- Component internal: p-3 p-4 (12px / 16px)
- Card padding: p-5 (20px)
- Section gap: gap-4 gap-6
- Page padding: px-6 py-4

Border:
- Default card border: border border-slate-200
- Status accent: border-l-[3px] border-l-{color}   ← KEY PATTERN
- Hover: border-slate-300
- Focus: ring-2 ring-brand-primary/20
```

### Status Colors — Project Stages

```typescript
const STAGE_COLORS = {
  opportunity:    { bg: 'bg-slate-100',   text: 'text-slate-600',  border: 'border-l-slate-400',  label: 'Cơ hội' },
  feasibility:    { bg: 'bg-blue-50',     text: 'text-blue-700',   border: 'border-l-blue-400',   label: 'Đánh giá KT' },
  bid_decision:   { bg: 'bg-violet-50',   text: 'text-violet-700', border: 'border-l-violet-400', label: 'Quyết định DT' },
  bidding:        { bg: 'bg-indigo-50',   text: 'text-indigo-700', border: 'border-l-indigo-500', label: 'Đang dự thầu' },
  negotiating:    { bg: 'bg-cyan-50',     text: 'text-cyan-700',   border: 'border-l-cyan-500',   label: 'Thương thảo HĐ' },
  contracted:     { bg: 'bg-teal-50',     text: 'text-teal-700',   border: 'border-l-teal-500',   label: 'Đã ký HĐ A-B' },
  selecting_sub:  { bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-l-amber-500',  label: 'Chọn NTP/NCC' },
  construction:   { bg: 'bg-green-50',    text: 'text-green-700',  border: 'border-l-green-500',  label: 'Đang thi công' },
  settlement:     { bg: 'bg-orange-50',   text: 'text-orange-700', border: 'border-l-orange-500', label: 'Quyết toán' },
  warranty:       { bg: 'bg-yellow-50',   text: 'text-yellow-700', border: 'border-l-yellow-400', label: 'Bảo hành' },
  completed:      { bg: 'bg-emerald-50',  text: 'text-emerald-700',border: 'border-l-emerald-500',label: 'Hoàn thành' },
  cancelled:      { bg: 'bg-red-50',      text: 'text-red-700',    border: 'border-l-red-400',    label: 'Đã hủy' },
}
```

---

## PHẦN 3 — LAYOUT TỔNG THỂ

```
LAYOUT STRUCTURE (Desktop):
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed left)  │  MAIN CONTENT AREA   │
│  ─────────────────────────   │  ─────────────────── │
│  Logo Trungnam E&C           │  TOP BAR (56px)      │
│                              │  [Breadcrumb] [User] │
│  Navigation groups:          │  ─────────────────── │
│  • Tổng quan                 │                      │
│  • Dự án                     │  PAGE CONTENT        │
│  • Đấu thầu (KHĐT)          │  px-6 py-4           │
│  • Hợp đồng                  │                      │
│  • NTP / NCC                 │                      │
│  • Tài chính (KT)            │                      │
│  • Báo cáo                   │                      │
│  ───────────────             │                      │
│  [User avatar + name]        │                      │
│  [Settings]                  │                      │
└─────────────────────────────────────────────────────┘

MOBILE (< 768px):
- Sidebar collapses to bottom tab bar (5 main items)
- Top bar has hamburger for full nav drawer
- Cards stack to single column
- Tables become scrollable cards
```

### Sidebar Component Spec

```tsx
// components/layout/Sidebar.tsx
// - Width: w-60 (240px), fixed height, overflow-y-auto
// - Background: bg-slate-900 (dark sidebar, light content area)
// - Logo area: h-14 flex items-center px-4
// - Nav item: flex items-center gap-3 px-3 py-2 rounded-lg text-sm
//   - Default: text-slate-400 hover:bg-slate-800 hover:text-white
//   - Active: bg-brand-primary text-white font-medium
// - Nav groups have a group label: text-xs text-slate-500 uppercase tracking-wider px-3 mb-1
// - Bottom user section: border-t border-slate-800 p-3

const NAV_ITEMS = [
  { group: null,            icon: 'LayoutDashboard', label: 'Tổng quan',      href: '/dashboard' },
  { group: 'Dự án',        icon: 'FolderKanban',    label: 'Danh sách DA',   href: '/projects' },
  { group: 'Dự án',        icon: 'PackageSearch',   label: 'Gói thầu',       href: '/bid-packages' },
  { group: 'Đấu thầu',     icon: 'Search',          label: 'Cơ hội',         href: '/bidding/opportunities' },
  { group: 'Đấu thầu',     icon: 'FileCheck',       label: 'Hồ sơ DT',       href: '/bidding/submissions' },
  { group: 'Hợp đồng',     icon: 'FileSignature',   label: 'HĐ A-B',         href: '/contracts/ab' },
  { group: 'Hợp đồng',     icon: 'FileText',        label: 'HĐ B-C',         href: '/contracts/bc' },
  { group: 'Đối tác',      icon: 'Users',           label: 'NTP / NCC',      href: '/contractors' },
  { group: 'Tài chính',    icon: 'Banknote',        label: 'Dòng tiền',      href: '/finance/cashflow' },
  { group: 'Tài chính',    icon: 'CreditCard',      label: 'Thanh toán',     href: '/finance/payments' },
  { group: 'Tài chính',    icon: 'Building2',       label: 'Tài khoản NH',   href: '/finance/bank-accounts' },
  { group: 'Báo cáo',      icon: 'BarChart3',       label: 'Báo cáo tuần',   href: '/reports/weekly' },
  { group: 'Báo cáo',      icon: 'PieChart',        label: 'Báo cáo tháng',  href: '/reports/monthly' },
]
```

---

## PHẦN 4 — CÁC MÀN HÌNH CẦN BUILD (PHASE 1)

### Screen 1: Dashboard Tổng quan (/dashboard)

```
LAYOUT: 
- Row 1: 4 KPI cards (số liệu tổng)
- Row 2: Bảng dự án đang thi công (6 rows) + Sidebar mini (hoạt động gần đây)
- Row 3: Biểu đồ pipeline stages (horizontal bar) + Danh sách cần xử lý

KPI CARDS (4 cards in a row):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Tổng dự án   │ │ Đang thi công│ │ Giá trị HĐ  │ │ Cần xử lý   │
│ 23           │ │ 8            │ │ ₫ 2.847 tỷ  │ │ 5 việc      │
│ +3 tháng này │ │ 2 sắp HT    │ │ A-B ký kết  │ │ ⚠ cần duyệt │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

Card style:
- bg-white border border-slate-200 rounded-xl p-5
- Label: text-xs text-slate-500 uppercase tracking-wide mb-1
- Value: text-3xl font-semibold text-slate-900 font-mono
- Subtext: text-xs text-slate-500 mt-1
- Accent top border: border-t-[3px] border-t-brand-primary (first card only)

PIPELINE STAGES BAR:
Horizontal bar showing count per stage:
[Cơ hội:4] [ĐG KT:2] [Quyết định:1] [DT:3] [Thương thảo:2] [Đã ký:8] [Thi công:8] [QT:2] [BH:1]
Each segment colored by stage color, clickable → filters project list
```

### Screen 2: Danh sách Dự án (/projects)

```
LAYOUT:
- Header: "Dự án" h1 + [+ Tạo dự án mới] button (top right)
- Filter bar: [Tất cả stages ▼] [Phòng ban ▼] [Năm ▼] [🔍 Tìm kiếm...]
- Table (main content)
- Empty state if no results

TABLE COLUMNS:
| Mã DA     | Tên dự án          | Giai đoạn      | Gói thầu | Giá trị HĐ  | PM      | HT kế hoạch | Hành động |
|-----------|-------------------|----------------|----------|-------------|---------|-------------|-----------|
| DA-024-012| Cao tốc HG-CM     | 🟢 Thi công   | XL1/XL2  | ₫ 485 tỷ   | Nguyễn A| 12/2025     | [···]     |

TABLE STYLE:
- thead: bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide
- tbody tr: hover:bg-slate-50 border-b border-slate-100
- Stage badge: inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
  with colored dot (●) matching stage color
- Currency column: font-mono text-right
- Row click → navigate to /projects/[id]
- [···] button: DropdownMenu with Edit / Xem chi tiết / Chuyển giai đoạn / Hủy

EMPTY STATE:
- Centered illustration (use Lucide FolderOpen icon, large)
- "Chưa có dự án nào" text
- [+ Tạo dự án đầu tiên] button
```

### Screen 3: Chi tiết Dự án (/projects/[id])

```
LAYOUT:
- Sticky header: [← Quay lại] [Tên dự án] [Stage badge] [Action buttons]
- Tab navigation below header: Tổng quan | Gói thầu | Hợp đồng | Tiến độ | Tài chính | Tài liệu
- Tab content area

STICKY HEADER:
- bg-white border-b border-slate-200 px-6 py-3
- Left: back button + project name (h2) + stage badge
- Right: [Chuyển giai đoạn →] [Chỉnh sửa] [⋮]

TAB: TỔNG QUAN
┌─────────────────────────────┐ ┌──────────────────────────────┐
│ Thông tin dự án             │ │ Tiến độ giai đoạn            │
│ ─────────────────────────── │ │ ──────────────────────────── │
│ Chủ đầu tư: [value]         │ │ Stage 1 ✓ Stage 2 ✓ ...      │
│ Địa điểm: [value]           │ │ Vertical stepper component   │
│ Ngày ký HĐ: DD/MM/YYYY      │ │ ● = done, ◉ = current, ○=todo│
│ Giá trị HĐ: ₫ XXX tỷ       │ └──────────────────────────────┘
│ PM: [avatar + name]         │
└─────────────────────────────┘

TAB: GÓI THẦU
- Table: Mã gói | Tên gói | Loại | Giá trị | Trạng thái | HĐ B-C | Hành động
- [+ Thêm gói thầu] button

TAB: HỢP ĐỒNG
- Two sections: HĐ A-B (with owner) + HĐ B-C (with NTP/NCC)
- Each contract as a card with key fields + status

TAB: TIẾN ĐỘ  
- Progress table: Hạng mục | KH bắt đầu | KH kết thúc | TT bắt đầu | % hoàn thành | Ghi chú
- Overall progress bar at top

TAB: TÀI CHÍNH
- 3 KPI cards: Tổng giá trị HĐ | Đã thanh toán | Còn lại
- Table: Ngày | Loại | Mô tả | Số tiền Thu | Số tiền Chi | TK Ngân hàng
- Filter by date range

TAB: TÀI LIỆU
- Grid of file cards (PDF, Excel, Word icons)
- Upload button top right
- Categories: HSDT | Hợp đồng | Nghiệm thu | Quyết toán | Khác
```

### Screen 4: Form Tạo/Sửa Dự án

```
LAYOUT: Slide-in Sheet (drawer from right, 600px wide) OR full page
Use shadcn Sheet component

FORM SECTIONS (use Accordion or visible sections):

Section 1 — Thông tin cơ bản:
- Mã dự án*: Input (auto-suggest format DA-YYYY-XXX)
- Tên dự án*: Input
- Mô tả: Textarea
- Chủ đầu tư*: Input
- Địa điểm: Input  
- Tỉnh/Thành: Select (dropdown danh sách 63 tỉnh)

Section 2 — Phân loại:
- Loại dự án: Select [Xây lắp | Tư vấn | Hỗn hợp]
- Phòng ban phụ trách*: Select [KHĐT | QLDA]
- PM phụ trách: Combobox search user

Section 3 — Tài chính:
- Giá trị HĐ A-B dự kiến: NumberInput (format VND, suffix "VNĐ")
- Ngày dự kiến ký HĐ: DatePicker
- Ngày khởi công dự kiến: DatePicker
- Ngày hoàn thành dự kiến: DatePicker

VALIDATION (Zod schema):
const projectSchema = z.object({
  project_code: z.string().min(3).regex(/^DA-\d{4}-\d{3}$/),
  name: z.string().min(5).max(200),
  owner_unit: z.string().min(2),
  total_value: z.number().positive().optional(),
  ...
})

BUTTONS: [Hủy] [Lưu nháp] [Tạo dự án →]
```

### Screen 5: Danh sách Hợp đồng (/contracts/ab)

```
LAYOUT: Same pattern as projects list

TABLE COLUMNS (HĐ A-B):
| Số HĐ | Dự án | Bên A (CĐT) | Giá trị HĐ | Ngày ký | Tạm ứng | Tình trạng | Hành động |

TABLE COLUMNS (HĐ B-C):
| Số HĐ | Gói thầu | NTP/NCC | Giá trị | Ngày ký | % BL TH | Tình trạng | Hành động |

Contract status badges:
- draft: gray
- signed: blue  
- active: green
- settled: orange
- liquidated: slate
```

### Screen 6: Dashboard Tài chính (/finance/cashflow)

```
LAYOUT:
- Row 1: 3 KPI cards: Tổng Thu (tháng này) | Tổng Chi (tháng này) | Số dư tổng hợp
- Row 2: Filter bar [Dự án ▼] [TK Ngân hàng ▼] [Tháng ▼] [Loại ▼]
- Row 3: Table dòng tiền

BANK ACCOUNT SUMMARY (mini cards, scrollable horizontal):
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ TK011 — EC NEW │ │ TK001 — KHBM   │ │ TK004 — ĐN     │
│ ₫ 12.4 tỷ     │ │ ₫ 8.7 tỷ      │ │ ₫ 3.2 tỷ      │
│ 0190 5801 011  │ │ 0190 5801 001  │ │ 0190 5801 004  │
└────────────────┘ └────────────────┘ └────────────────┘

CASH FLOW TABLE:
| Ngày | Dự án | Loại | Mô tả | Thu (₫) | Chi (₫) | TK Ngân hàng | 
- Thu column: text-green-700 font-mono
- Chi column: text-red-600 font-mono
- Row with border-l-3 green = thu, red = chi
```

---

## PHẦN 5 — COMPONENTS TÁI SỬ DỤNG

```tsx
// 1. StatusBadge — dùng cho tất cả trạng thái
<StatusBadge stage="construction" />
// → <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
//     <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
//     Đang thi công
//   </span>

// 2. ProjectCard — dạng card (dùng trong mobile / grid view)
<ProjectCard project={project} />
// Border-left 3px colored by stage + key metrics inside

// 3. CurrencyDisplay — format VND nhất quán  
<CurrencyDisplay amount={485000000000} size="lg" />
// → "₫ 485 tỷ" (lg) | "₫ 485,000,000,000" (full) | "485T" (compact)

// 4. StageProgress — vertical stepper
<StageProgress currentStage={7} />
// Shows all 10 stages, ✓ done, ● current, ○ todo

// 5. SectionHeader — page và section titles
<SectionHeader 
  title="Danh sách dự án" 
  subtitle="23 dự án · 8 đang thi công"
  action={<Button>+ Tạo dự án</Button>}
/>

// 6. DataTable — wrapper around TanStack Table
<DataTable 
  columns={projectColumns} 
  data={projects}
  searchKey="name"
  filterOptions={stageFilters}
/>

// 7. EmptyState
<EmptyState
  icon={FolderOpen}
  title="Chưa có dự án nào"
  description="Bắt đầu bằng cách tạo dự án đầu tiên"
  action={{ label: "+ Tạo dự án", href: "/projects/new" }}
/>

// 8. ConfirmDialog — cho delete / stage advance
<ConfirmDialog
  title="Chuyển sang giai đoạn Thi công?"
  description="Hành động này yêu cầu HĐ A-B đã được ký. Tiếp tục?"
  onConfirm={handleAdvanceStage}
/>
```

---

## PHẦN 6 — SUPABASE INTEGRATION PATTERN

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/hooks/useProjects.ts — TanStack Query pattern
export function useProjects(filters?: ProjectFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          department:departments(name),
          project_manager:profiles(full_name, avatar_url),
          bid_packages(count),
          contracts(count)
        `)
        .order('created_at', { ascending: false })
      
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`)
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

// Server component pattern (app/projects/page.tsx)
// Use server-side Supabase for initial data, client for mutations
```

---

## PHẦN 7 — AUTHENTICATION & MIDDLEWARE

```typescript
// middleware.ts — protect all routes
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect unauthenticated to /login
  // Redirect authenticated /login → /dashboard
  // Check role-based access per route
}

// Login page: app/(auth)/login/page.tsx
// - Clean centered form, 400px max-width
// - Logo top center
// - Email + Password inputs
// - "Đăng nhập" button (brand-primary bg)
// - Forgot password link
// - No "Register" link (admin creates accounts)
```

---

## PHẦN 8 — IMPORTANT CONSTRAINTS

```
1. CURRENCY: Always use Vietnamese formatting
   - Large amounts: "₫ 485 tỷ" or "₫ 2.847 tỷ" (NOT "485,000,000,000")
   - Tables: full number with dots "485.000.000.000" right-aligned
   - Helper: const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

2. DATES: DD/MM/YYYY throughout (vi-VN locale)
   - Helper: const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN')

3. LOADING STATES: Every data table must have:
   - Skeleton loading (not spinner) — use shadcn Skeleton
   - Error state with retry button
   - Empty state with action

4. RESPONSIVE: 
   - Table on mobile → Card list (transform, not horizontal scroll)
   - Sidebar on mobile → Sheet drawer triggered by hamburger
   - Minimum touch target: 44px height

5. DARK MODE:
   - Use Tailwind dark: prefix throughout
   - Sidebar stays dark in both modes (bg-slate-900)
   - Cards: dark:bg-slate-800 dark:border-slate-700

6. PERMISSIONS (render conditionally):
   - "Create" buttons only shown if user has write permission
   - "Finance" tab only shown to KT/TCKT/BGD roles
   - "Approve" buttons only shown to managers

7. NAMING CONVENTIONS:
   - Vietnamese labels everywhere in UI
   - English variable/function names in code
   - Comments in English
```

---

## PHẦN 9 — FILE KHỞI TẠO ĐẦU TIÊN (theo thứ tự)

```
Thứ tự build Phase 1:

1. npx create-next-app@latest trungnam-ec --typescript --tailwind --app
2. npx shadcn@latest init  
3. Install: @supabase/ssr @tanstack/react-query react-hook-form zod lucide-react
4. Setup: tailwind.config.ts (add custom colors above)
5. Build: /lib/supabase/client.ts + server.ts + middleware.ts
6. Build: Layout component (Sidebar + TopBar)
7. Build: /app/(auth)/login → auth flow
8. Build: /app/(dashboard)/layout.tsx
9. Build: /app/(dashboard)/dashboard → KPI cards + table
10. Build: /app/(dashboard)/projects → list + detail + form
11. Supabase migration: 001_initial_schema.sql
12. Seed: master data (bank accounts, departments, roles)
```

---

## PHẦN 10 — SEED DATA MẪU

```sql
-- Departments
INSERT INTO departments (code, name) VALUES
('BGD',  'Ban Giám đốc'),
('KHDT', 'Kế hoạch Đấu thầu'),
('QLDA', 'Quản lý Dự án'),
('TCKT', 'Tài chính Kế toán'),
('HCNS', 'Hành chính Nhân sự');

-- Bank accounts (từ DM Chuẩn hóa)
INSERT INTO bank_accounts (acc_code, account_number, account_name, bank_name, branch, project_group) VALUES
('TK011', '0190 5801 011', 'TNEC A GIÁP NHẬN',             'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK022', '0190 5801 022', 'TK Tây Ninh EC NEW',            'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK024', '0190 5801 024', 'Tạm ứng đợt 2 An Giang',        'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK025', '0190 5801 025', 'TK các dự án nội bộ TNG',       'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK026', '0190 5801 026', 'TK chung EC NEW',               'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK027', '0190 5801 027', 'TK Tỉnh lộ 8',                  'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK004', '0190 5801 004', 'DA khu tái định cư Hòa Bắc gỡ 2','TP BANK','CN Đà Nẵng', 'Đà Nẵng'),
('TK000', '0190 5801 000', 'TK Trung Nam EC chung',         'TP BANK', 'CN Đà Nẵng', 'Đà Nẵng'),
('TK005', '0190 5801 005', 'DA tuyến đường vành đai phía Tây','TP BANK','CN Đà Nẵng','Đà Nẵng'),
('TK016', '0190 5801 016', 'TK EC chung Đà Nẵng',           'TP BANK', 'CN Đà Nẵng', 'Đà Nẵng'),
('TK001', '0190 5801 001', 'Cao tốc KHBM',                  'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK007', '0190 5801 007', 'Cao tốc Hậu Giang',             'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK008', '0190 5801 008', 'Cao tốc Sóc Trăng',             'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK018', '0190 5801 018', 'TK Cao tốc',                    'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK019', '0190 5801 019', 'TK Cao tốc (2)',                 'TP BANK', 'CN Cửu Long', 'Cao tốc');
-- NOTE: TK019 name cần làm sạch trước khi dùng chính thức
```

---

*Master Prompt v1.0 — Trungnam E&C Project Management App*
*Ngày tạo: 23/06/2026 | Stack: Next.js 14 + TypeScript + Supabase + Vercel*
*Phase 1: KHĐT + QLDA | Phase 2: Tài chính KT*
