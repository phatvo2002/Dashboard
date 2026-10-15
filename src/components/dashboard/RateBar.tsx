'use client';

import React from 'react';
import { cn, getRateProgressColor } from '@/lib/utils';

interface RateBarProps {
  rate: number | null | undefined;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export function RateBar({ rate, height = 6, showLabel = false, className }: RateBarProps) {
  if (rate === null || rate === undefined) return null;
  const clampedRate = Math.min(Math.max(rate, 0), 100);
  const colorClass = getRateProgressColor(rate);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1 font-medium text-slate-600 dark:text-slate-300">
          <span>Tỷ lệ đáp ứng</span>
          <span>{rate}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        style={{ height: `${height}px` }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${clampedRate}%` }}
        />
      </div>
    </div>
  );
}
