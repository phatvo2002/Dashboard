'use client';

import React from 'react';
import { cn, getRateColor, getRateProgressColor } from '@/lib/utils';
import { RateBar } from './RateBar';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  rate?: number | null;
  status?: 'accent' | 'ok' | 'warn' | 'err';
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, subValue, rate, status, icon }: KpiCardProps) {
  const getValColor = () => {
    if (status === 'accent') return 'text-blue-600 dark:text-blue-400';
    if (status === 'ok') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'warn') return 'text-amber-600 dark:text-amber-400';
    if (status === 'err') return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-900 dark:text-white';
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>{label}</span>
          {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
        </div>
        <div className={cn('mt-2 text-2xl font-bold tracking-tight', getValColor())}>
          {value}
        </div>
        {subValue && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
            {subValue}
          </div>
        )}
      </div>

      {rate !== undefined && rate !== null && (
        <div className="mt-3">
          <RateBar rate={rate} showLabel={false} height={5} />
        </div>
      )}
    </div>
  );
}
