'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData, CtdtItem } from '@/types/dashboard';
import { formatNumber, formatPercent, getRateBadgeClass } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { Search, Download, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { ctdt_data } = data;

export default function CtdtPage() {
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof CtdtItem>('rate_overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter & Sort
  const filteredCtdt = useMemo(() => {
    return ctdt_data
      .filter((item) => {
        if (levelFilter && item.level !== levelFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchCode = item.ma.toLowerCase().includes(q);
          const matchName = item.ten.toLowerCase().includes(q);
          if (!matchCode && !matchName) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB, 'vi') : valB.localeCompare(valA, 'vi');
        }
        return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [levelFilter, searchQuery, sortField, sortDir]);

  const handleSort = (field: keyof CtdtItem) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Chart data for all CTDT
  const sortedForChart = useMemo(() => {
    return [...ctdt_data].sort((a, b) => a.rate_overall - b.rate_overall);
  }, []);

  const chartData = {
    labels: sortedForChart.map((c) => c.ma),
    datasets: [
      {
        label: 'Tỷ lệ đáp ứng %',
        data: sortedForChart.map((c) => c.rate_overall),
        backgroundColor: sortedForChart.map((c) =>
          c.rate_overall >= 80 ? '#16a34a' : c.rate_overall >= 50 ? '#d97706' : '#dc2626'
        ),
      },
    ],
  };

  const handleExport = () => {
    const exportRows = filteredCtdt.map((c) => ({
      'Mã CTĐT': c.ma,
      'Tên chương trình': c.ten,
      'Bậc đào tạo': c.level,
      'Tổng học phần': c.hp_count,
      'HP có đề cương': c.hp_with_data,
      'HP thiếu Giáo trình': c.hp_with_gt_gap,
      'HP thiếu Sách TK': c.hp_with_stk_gap,
      'Tỷ lệ Giáo trình (%)': c.rate_gt ?? 0,
      'Tỷ lệ Sách TK (%)': c.rate_stk ?? 0,
      'Tỷ lệ Bài báo (%)': c.rate_bb ?? 0,
      'Tỷ lệ Chung (%)': c.rate_overall,
    }));
    exportToExcel(exportRows, 'HCMULaw_DanhSach_52_CTDT', 'CTĐT');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            52 Chương Trình Đào Tạo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Giám sát mức độ đáp ứng tài nguyên học liệu của các ngành Đại học, Thạc sĩ và Tiến sĩ.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Excel ({filteredCtdt.length})</span>
        </button>
      </div>

      {/* Chart: 52 CTDT rate overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Biểu đồ tỷ lệ đáp ứng tài liệu chung của 52 CTĐT
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Xếp theo thứ tự từ tỷ lệ thấp nhất đến cao nhất (Đỏ: &lt;50%, Vàng: 50–79%, Xanh: ≥80%)
        </p>
        <div className="h-64 sm:h-72">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100 },
                x: { ticks: { font: { size: 9 }, maxRotation: 90 } },
              },
            }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên CTĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Tất cả Bậc đào tạo</option>
            <option value="Đại học">Đại học</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Hiển thị <strong>{filteredCtdt.length}</strong> / {ctdt_data.length} CTĐT
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th
                  onClick={() => handleSort('ma')}
                  className="px-4 py-3 cursor-pointer select-none hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ten')}
                  className="px-4 py-3 cursor-pointer select-none hover:text-blue-600 min-w-[240px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Tên Chương Trình Đào Tạo</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-3 py-3">Bậc</th>
                <th
                  onClick={() => handleSort('hp_count')}
                  className="px-3 py-3 text-right cursor-pointer select-none hover:text-blue-600"
                >
                  Số HP
                </th>
                <th className="px-3 py-3 text-right">HP có DL</th>
                <th
                  onClick={() => handleSort('hp_with_gt_gap')}
                  className="px-3 py-3 text-right text-rose-600 cursor-pointer select-none hover:text-rose-700"
                >
                  Thiếu GT
                </th>
                <th
                  onClick={() => handleSort('hp_with_stk_gap')}
                  className="px-3 py-3 text-right text-amber-600 cursor-pointer select-none hover:text-amber-700"
                >
                  Thiếu STK
                </th>
                <th className="px-3 py-3 text-right">GT %</th>
                <th className="px-3 py-3 text-right">STK %</th>
                <th className="px-3 py-3 text-right">BB %</th>
                <th
                  onClick={() => handleSort('rate_overall')}
                  className="px-4 py-3 text-right cursor-pointer select-none hover:text-blue-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Chung %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCtdt.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy chương trình đào tạo phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCtdt.map((item) => (
                  <tr
                    key={item.ma}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                      {item.ma}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {item.ten}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono">{item.hp_count}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {item.hp_with_data}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {item.hp_with_gt_gap > 0 ? item.hp_with_gt_gap : '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {item.hp_with_stk_gap > 0 ? item.hp_with_stk_gap : '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">{formatPercent(item.rate_gt)}</td>
                    <td className="px-3 py-3 text-right font-mono">{formatPercent(item.rate_stk)}</td>
                    <td className="px-3 py-3 text-right font-mono">{formatPercent(item.rate_bb)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRateBadgeClass(
                          item.rate_overall
                        )}`}
                      >
                        {item.rate_overall}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <Link
                        href={`/hoc-phan?ctdt=${item.ma}`}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900"
                      >
                        <span>Xem HP</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
