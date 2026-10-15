import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('vi-VN');
}

export function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `${n}%`;
}

export function getRateColor(r: number | null | undefined): string {
  if (r === null || r === undefined) return 'text-slate-400 dark:text-slate-500';
  if (r >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (r >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function getRateBadgeClass(r: number | null | undefined): string {
  if (r === null || r === undefined) return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  if (r >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  if (r >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
}

export function getRateProgressColor(r: number | null | undefined): string {
  if (r === null || r === undefined) return 'bg-slate-300 dark:bg-slate-700';
  if (r >= 80) return 'bg-emerald-500';
  if (r >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}
