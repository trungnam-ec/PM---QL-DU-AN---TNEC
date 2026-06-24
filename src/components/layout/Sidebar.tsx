"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  PackageSearch,
  Search,
  FileCheck,
  FileSignature,
  FileText,
  Users,
  Banknote,
  CreditCard,
  Building2,
  BarChart3,
  PieChart,
  ShieldCheck,
  Coins,
  Scale,
  Lock,
  Landmark,
  Upload,
  CalendarRange,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './UserNav';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { ModuleKey } from '@/lib/permissions';

const NAV_ITEMS: {
  group: string | null;
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  module: ModuleKey;
}[] = [
  { group: null,         icon: LayoutDashboard, label: 'Tổng quan',     href: '/dashboard', module: 'dashboard' },

  { group: 'PHÒNG KHĐT', icon: LayoutDashboard, label: 'Pipeline KHĐT', href: '/bidding', module: 'bidding' },
  { group: 'PHÒNG KHĐT', icon: PackageSearch,   label: 'DS Gói thầu',   href: '/bid-packages', module: 'bidding' },
  { group: 'PHÒNG KHĐT', icon: Search,          label: 'Cơ hội Đấu thầu', href: '/bidding/opportunities', module: 'bidding' },
  { group: 'PHÒNG KHĐT', icon: FileCheck,       label: 'Hồ sơ Dự thầu', href: '/bidding/submissions', module: 'bidding' },
  { group: 'PHÒNG KHĐT', icon: FileSignature,   label: 'Hợp đồng A-B',  href: '/contracts/ab', module: 'contracts' },

  { group: 'PHÒNG QLDA', icon: FolderKanban,    label: 'Danh sách Dự án', href: '/projects', module: 'projects' },
  { group: 'PHÒNG QLDA', icon: FileText,        label: 'Hợp đồng B-C',  href: '/contracts/bc', module: 'contracts' },
  { group: 'PHÒNG QLDA', icon: Users,           label: 'NTP / NCC',     href: '/contractors', module: 'projects' },

  { group: 'PHÒNG TCKT', icon: Coins,           label: 'Số dư quỹ',     href: '/finance/fund', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Scale,           label: 'Cân nguồn',     href: '/finance/balance-report', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: CalendarRange,   label: 'Kế hoạch dòng tiền', href: '/finance/plan', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Banknote,        label: 'Dòng tiền',     href: '/finance/cashflow', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Layers,          label: 'Thu chi theo DA', href: '/finance/by-project', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Upload,          label: 'Import sao kê', href: '/finance/import', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Lock,            label: 'Phong tỏa / Giải tỏa', href: '/finance/escrow', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: FileCheck2,      label: 'Đề nghị chi',   href: '/finance/requests', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: CreditCard,      label: 'Thanh toán',    href: '/finance/payments', module: 'finance' },
  { group: 'PHÒNG TCKT', icon: Landmark,        label: 'Tài khoản NH',  href: '/finance/bank-accounts', module: 'finance' },

  { group: 'BÁO CÁO',    icon: BarChart3,       label: 'Báo cáo tuần',  href: '/reports/weekly', module: 'reports' },
  { group: 'BÁO CÁO',    icon: PieChart,        label: 'Báo cáo tháng', href: '/reports/monthly', module: 'reports' },

  { group: 'QUẢN TRỊ',   icon: ShieldCheck,     label: 'Phân quyền',    href: '/settings/users', module: 'users' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { canView } = usePermissions();

  const visibleItems = NAV_ITEMS.filter((item) => canView(item.module));

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 hidden md:flex flex-col bg-white border-r border-slate-200/70 z-50">
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6 shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-[14px] shadow-sm shadow-blue-500/30">
            TN
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-slate-800 tracking-tight leading-tight">
              Trungnam E&C
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Hệ thống QLDA
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
        {visibleItems.map((item, index) => {
          const showGroup =
            item.group &&
            (index === 0 || visibleItems[index - 1].group !== item.group);
          const active = isActive(item.href);

          return (
            <React.Fragment key={item.href}>
              {showGroup && (
                <div className="text-[11px] font-extrabold uppercase px-3 mt-5 mb-2.5 text-slate-400 tracking-widest">
                  {item.group}
                </div>
              )}

              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-full text-[13.5px] mb-1.5 transition-all duration-200',
                  active 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 font-bold' 
                    : 'text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-400"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.label}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 shrink-0 border-t border-slate-100 bg-slate-50/50">
        <UserNav />
      </div>
    </aside>
  );
}
