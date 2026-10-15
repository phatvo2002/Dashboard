'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookMarked,
  Library,
  AlertTriangle,
  Scale,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Tổng quan',
    href: '/',
    icon: LayoutDashboard,
    badge: 'Chính'
  },
  {
    title: 'CTĐT (52)',
    href: '/ctdt',
    icon: GraduationCap,
    badge: '52'
  },
  {
    title: 'Học phần (833)',
    href: '/hoc-phan',
    icon: BookMarked,
    badge: '833'
  },
  {
    title: 'Kho Tài nguyên',
    href: '/tai-nguyen',
    icon: Library,
    badge: '136k'
  },
  {
    title: 'Phân tích Gap',
    href: '/gap-analysis',
    icon: AlertTriangle,
    badge: 'Cảnh báo',
    badgeVariant: 'danger'
  },
  {
    title: 'So sánh Cấp ĐT',
    href: '/so-sanh',
    icon: Scale,
  },
  {
    title: 'Dự toán Mua sắm',
    href: '/ke-hoach-mua-sam',
    icon: ShoppingCart,
    badge: 'Mới',
    badgeVariant: 'new'
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Phân Hệ Kiểm Định
      </div>
      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-red-800 text-white shadow-sm dark:bg-red-900'
                  : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400'
                  )}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    isActive
                      ? 'bg-red-950/60 text-amber-200'
                      : item.badgeVariant === 'danger'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : item.badgeVariant === 'new'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 hidden md:block rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
          Kỳ Đánh Giá 2026–2030
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Dữ liệu đối sánh giữa đề cương chi tiết học phần và hệ thống mục lục thư viện điện tử Libol/Edata.
        </p>
      </div>
    </aside>
  );
}
