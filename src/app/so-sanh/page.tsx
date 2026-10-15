'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData } from '@/types/dashboard';
import { RateBar } from '@/components/dashboard/RateBar';
import { formatNumber, getRateBadgeClass, getRateColor } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { Scale, GraduationCap, Award, BookCheck, Download } from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { summary } = data;
const ls = summary.level_stats;
const lvls = Object.keys(ls);

export default function SoSanhPage() {
  // Chart 11: Overall rate comparison
  const chart11Data = {
    labels: lvls,
    datasets: [
      {
        label: 'Tỷ lệ đáp ứng chung (%)',
        data: lvls.map((l) => ls[l].rate),
        backgroundColor: ['#2563eb', '#7c3aed', '#0891b2'],
      },
    ],
  };

  // Chart 12: By resource type
  const chart12Data = {
    labels: lvls,
    datasets: [
      {
        label: 'Giáo trình (%)',
        data: lvls.map((l) => ls[l].gt_rate),
        backgroundColor: '#f97316',
      },
      {
        label: 'Sách tham khảo (%)',
        data: lvls.map((l) => ls[l].stk_rate),
        backgroundColor: '#8b5cf6',
      },
      {
        label: 'Bài báo / Edata (%)',
        data: lvls.map((l) => ls[l].bb_rate),
        backgroundColor: '#06b6d4',
      },
    ],
  };

  const handleExport = () => {
    const exportRows = lvls.map((lv) => {
      const s = ls[lv];
      return {
        'Cấp Đào Tạo': lv,
        'Số Lượng CTĐT': s.count,
        'Tổng Tài Liệu Yêu Cầu': s.total,
        'Đáp Ứng Thực Tế': s.matched,
        'Tỷ Lệ Giáo Trình': `${s.gt_rate}% (${s.gt_match}/${s.gt_total})`,
        'Tỷ Lệ Sách Tham Khảo': `${s.stk_rate}% (${s.stk_match}/${s.stk_total})`,
        'Tỷ Lệ Bài Báo / Edata': `${s.bb_rate}% (${s.bb_match}/${s.bb_total})`,
        'Tỷ Lệ Đáp Ứng Chung (%)': `${s.rate}%`,
      };
    });
    exportToExcel(exportRows, 'HCMULaw_SoSanh_Cap_Dao_Tao', 'SoSanh');
  };

  const getLevelIcon = (lv: string) => {
    if (lv === 'Đại học') return <GraduationCap className="h-5 w-5 text-blue-600" />;
    if (lv === 'Thạc sĩ') return <Award className="h-5 w-5 text-purple-600" />;
    return <BookCheck className="h-5 w-5 text-cyan-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            So Sánh Đối Sánh Theo Cấp Đào Tạo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Phân tích tỷ trọng và đặc thù đáp ứng tài nguyên giữa bậc Đại học (Cử nhân), Thạc sĩ và Tiến sĩ.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Báo Cáo Cấp ĐT</span>
        </button>
      </div>

      {/* 3 Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lvls.map((lv) => {
          const s = ls[lv];
          return (
            <div
              key={lv}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">{getLevelIcon(lv)}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{lv}</h3>
                      <p className="text-xs text-slate-500">{s.count} Chương trình đào tạo</p>
                    </div>
                  </div>
                  <span className={`text-xl font-bold font-mono ${getRateColor(s.rate)}`}>
                    {s.rate}%
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Tổng tài liệu yêu cầu:</span>
                    <span className="font-semibold font-mono">{formatNumber(s.total)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Đã đáp ứng:</span>
                    <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatNumber(s.matched)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Giáo trình (GT):</span>
                    <span className="font-mono font-medium">
                      {formatNumber(s.gt_match)}/{formatNumber(s.gt_total)} ({s.gt_rate}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Sách tham khảo (STK):</span>
                    <span className="font-mono font-medium">
                      {formatNumber(s.stk_match)}/{formatNumber(s.stk_total)} ({s.stk_rate}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Bài báo / Edata:</span>
                    <span className="font-mono font-medium">
                      {formatNumber(s.bb_match)}/{formatNumber(s.bb_total)} ({s.bb_rate}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <RateBar rate={s.rate} height={8} showLabel={false} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            So sánh Tỷ lệ đáp ứng chung (%) giữa 3 bậc đào tạo
          </h3>
          <div className="h-64">
            <Bar
              data={chart11Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Cơ cấu đáp ứng GT / STK / Bài báo theo bậc đào tạo
          </h3>
          <div className="h-64">
            <Bar
              data={chart12Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 font-semibold text-slate-800 dark:text-slate-200 text-sm">
          Bảng đối sánh chi tiết theo bậc đào tạo
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3">Bậc Đào Tạo</th>
                <th className="px-4 py-3 text-right">Số CTĐT</th>
                <th className="px-4 py-3 text-right">Tổng Yêu Cầu</th>
                <th className="px-4 py-3 text-right">Thực Tế Đáp Ứng</th>
                <th className="px-4 py-3 text-right">Giáo Trình (GT)</th>
                <th className="px-4 py-3 text-right">Sách Tham Khảo (STK)</th>
                <th className="px-4 py-3 text-right">Bài Báo / Số (BB)</th>
                <th className="px-5 py-3 text-right">Tỷ Lệ Chung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lvls.map((lv) => {
                const s = ls[lv];
                return (
                  <tr key={lv} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{lv}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold">{s.count}</td>
                    <td className="px-4 py-3.5 text-right font-mono">{formatNumber(s.total)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-semibold">
                      {formatNumber(s.matched)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {formatNumber(s.gt_match)}/{formatNumber(s.gt_total)} ({s.gt_rate}%)
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {formatNumber(s.stk_match)}/{formatNumber(s.stk_total)} ({s.stk_rate}%)
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {formatNumber(s.bb_match)}/{formatNumber(s.bb_total)} ({s.bb_rate}%)
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getRateBadgeClass(s.rate)}`}>
                        {s.rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
