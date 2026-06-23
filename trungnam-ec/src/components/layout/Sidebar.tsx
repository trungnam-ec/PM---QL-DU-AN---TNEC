"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Folders,
  Package,
  Radar,
  FileCheck,
  FileSignature,
  FileText,
  Users,
  Banknote,
  CreditCard,
  Building2,
  BarChart3,
  PieChart,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { group: null,         icon: LayoutDashboard, label: 'Tổng quan',     href: '/dashboard' },
  { group: 'Dự án',     icon: Folders,         label: 'Danh sách DA',  href: '/projects' },
  { group: 'Dự án',     icon: Package,         label: 'Gói thầu',      href: '/bid-packages' },
  { group: 'Đấu thầu',  icon: Radar,           label: 'Cơ hội',        href: '/bidding/opportunities' },
  { group: 'Đấu thầu',  icon: FileCheck,       label: 'Hồ sơ DT',      href: '/bidding/submissions' },
  { group: 'Hợp đồng',  icon: FileSignature,   label: 'HĐ A-B',        href: '/contracts/ab' },
  { group: 'Hợp đồng',  icon: FileText,        label: 'HĐ B-C',        href: '/contracts/bc' },
  { group: 'Đối tác',   icon: Users,           label: 'NTP / NCC',     href: '/contractors' },
  { group: 'Tài chính', icon: Banknote,        label: 'Dòng tiền',     href: '/finance/cashflow' },
  { group: 'Tài chính', icon: CreditCard,      label: 'Thanh toán',    href: '/finance/payments' },
  { group: 'Tài chính', icon: Building2,       label: 'Tài khoản NH',  href: '/finance/bank-accounts' },
  { group: 'Báo cáo',   icon: BarChart3,       label: 'Báo cáo tuần',  href: '/reports/weekly' },
  { group: 'Báo cáo',   icon: PieChart,        label: 'Báo cáo tháng', href: '/reports/monthly' },
];

function UserFooter() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div
      style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)' }}
      className="p-3 flex items-center gap-2.5"
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
        style={{ background: '#1E5BC6' }}
      >
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium truncate leading-tight" style={{ color: '#E5E7EB' }}>
          {fullName}
        </p>
        <p className="text-[10.5px] truncate leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {user?.email || '—'}
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Đăng xuất"
        className="p-1 rounded-md transition-colors"
        style={{ color: 'rgba(255,255,255,0.25)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="w-[220px] h-screen fixed left-0 top-0 hidden md:flex flex-col overflow-hidden"
      style={{ background: '#18202E' }}
    >
      {/* ── Header / Logo ── */}
      <div
        className="h-14 flex items-center px-4 shrink-0"
        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-semibold text-[12px]"
            style={{ background: '#1E5BC6' }}
          >
            T
          </div>
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: '#E5E7EB' }}>
            Trungnam E&C
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map((item, index) => {
          const showGroup =
            item.group &&
            (index === 0 || NAV_ITEMS[index - 1].group !== item.group);
          const active = isActive(item.href);

          return (
            <React.Fragment key={item.href}>
              {showGroup && (
                <div
                  className="text-[9.5px] font-semibold uppercase px-2 mt-3 mb-1"
                  style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em' }}
                >
                  {item.group}
                </div>
              )}

              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-2 py-[5.5px] rounded-md text-[12.5px] mb-px transition-all duration-100',
                  active
                    ? 'font-medium'
                    : 'font-normal'
                )}
                style={
                  active
                    ? {
                        background: 'rgba(30,91,198,0.25)',
                        color: '#93B4EF',
                      }
                    : {
                        color: 'rgba(255,255,255,0.45)',
                      }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                  }
                }}
              >
                <item.icon
                  className="w-[15px] h-[15px] shrink-0"
                  style={{ opacity: active ? 1 : 0.7 }}
                />
                {item.label}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Footer / User ── */}
      <UserFooter />
    </aside>
  );
}
