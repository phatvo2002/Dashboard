'use client';

import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData } from '@/types/dashboard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { formatNumber } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import {
  GraduationCap,
  BookOpen,
  Library,
  TrendingUp,
  BookMarked,
  FileText,
  BookmarkCheck,
  Download,
  AlertCircle
} from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { summary, ctdt_data } = data;

export default function OverviewPage() {
  // Chart 0: Data Status
  const chart0Data = {
    labels: [
      `Có dữ liệu TLTK (${summary.total_hp_with_data})`,
      `Chưa có dữ liệu TLTK (${summary.total_hp_no_data})`,
    ],
    datasets: [
      {
        data: [summary.total_hp_with_data, summary.total_hp_no_data],
        backgroundColor: ['#1d4ed8', '#cbd5e1'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 1: Rate distribution
  const hp100 = summary.hp_above_80 - (summary.hp_above_80 > 20 ? 15 : 0); // approximate segment
  const chart1Data = {
    labels: [
      `0% (${summary.hp_0_pct})`,
      `1–49% (${summary.hp_below_50 - summary.hp_0_pct})`,
      `50–79% (${summary.hp_50_80})`,
      `80–99% (${summary.hp_above_80 - 18})`,
      `100% (18)`,
    ],
    datasets: [
      {
        data: [
          summary.hp_0_pct,
          summary.hp_below_50 - summary.hp_0_pct,
          summary.hp_50_80,
          summary.hp_above_80 - 18,
          18,
        ],
        backgroundColor: ['#dc2626', '#f97316', '#eab308', '#16a34a', '#2563eb'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 2: Resource Types (GT, STK, BB)
  const chart2Data = {
    labels: ['Giáo trình', 'Sách tham khảo', 'Bài báo / Edata'],
    datasets: [
      {
        label: 'Yêu cầu',
        data: [summary.gt_total, summary.stk_total, summary.bb_total],
        backgroundColor: '#94a3b8',
      },
      {
        label: 'Đáp ứng',
        data: [summary.gt_match, summary.stk_match, summary.bb_match],
        backgroundColor: '#2563eb',
      },
    ],
  };

  // Chart 3: By Level
  const lvls = Object.keys(summary.level_stats);
  const chart3Data = {
    labels: lvls,
    datasets: [
      {
        label: 'Tỷ lệ chung (%)',
        data: lvls.map((l) => summary.level_stats[l].rate),
        backgroundColor: ['#2563eb', '#7c3aed', '#0891b2'],
      },
      {
        label: 'Giáo trình (%)',
        data: lvls.map((l) => summary.level_stats[l].gt_rate),
        backgroundColor: ['#60a5fa', '#a78bfa', '#67e8f9'],
      },
      {
        label: 'Sách tham khảo (%)',
        data: lvls.map((l) => summary.level_stats[l].stk_rate),
        backgroundColor: ['#93c5fd', '#c4b5fd', '#a5f3fc'],
      },
    ],
  };

  // Top 10 lowest & highest CTDT
  const sorted = [...ctdt_data].sort((a, b) => a.rate_overall - b.rate_overall);
  const bot10 = sorted.slice(0, 10);
  const top10 = sorted.slice(-10).reverse();

  const chart4Data = {
    labels: bot10.map((c) => c.ma),
    datasets: [
      {
        label: 'Tỷ lệ %',
        data: bot10.map((c) => c.rate_overall),
        backgroundColor: bot10.map((c) =>
          c.rate_overall >= 80 ? '#16a34a' : c.rate_overall >= 50 ? '#d97706' : '#dc2626'
        ),
      },
    ],
  };

  const chart5Data = {
    labels: top10.map((c) => c.ma),
    datasets: [
      {
        label: 'Tỷ lệ %',
        data: top10.map((c) => c.rate_overall),
        backgroundColor: top10.map((c) =>
          c.rate_overall >= 80 ? '#16a34a' : c.rate_overall >= 50 ? '#d97706' : '#dc2626'
        ),
      },
    ],
  };

  const handleExportSummary = () => {
    const exportData = ctdt_data.map((c) => ({
      'Mã CTĐT': c.ma,
      'Tên CTĐT': c.ten,
      'Cấp Đào Tạo': c.level,
      'Số Học Phần': c.hp_count,
      'HP Có Dữ Liệu': c.hp_with_data,
      'HP Thiếu Giáo Trình': c.hp_with_gt_gap,
      'HP Thiếu Sách TK': c.hp_with_stk_gap,
      'Tỷ Lệ Giáo Trình (%)': c.rate_gt ?? 0,
      'Tỷ Lệ Sách TK (%)': c.rate_stk ?? 0,
      'Tỷ Lệ Bài Báo/Edata (%)': c.rate_bb ?? 0,
      'Tỷ Lệ Đáp Ứng Chung (%)': c.rate_overall,
    }));
    exportToExcel(exportData, 'HCMULaw_BaoCao_DoiSanh_52_CTDT', '52_CTDT');
  };

  const gtRate = summary.gt_total ? Math.round((summary.gt_match / summary.gt_total) * 1000) / 10 : 0;
  const stkRate = summary.stk_total ? Math.round((summary.stk_match / summary.stk_total) * 1000) / 10 : 0;
  const bbRate = summary.bb_total ? Math.round((summary.bb_match / summary.bb_total) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-red-900 via-red-950 to-blue-950 p-6 text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-800/80 px-3 py-1 text-xs font-semibold text-amber-300 mb-2">
            <span>Kiểm định Chất lượng CSGD & CTĐT 2026–2030</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Tổng Quan Đối Sánh Học Liệu Thư Viện HCMULaw
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Báo cáo tổng hợp tình trạng đáp ứng giáo trình, tài liệu tham khảo và học liệu số theo đề cương chi tiết học phần.
          </p>
        </div>

        <button
          onClick={handleExportSummary}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-md transition-all hover:bg-amber-300 active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      {/* Row 1 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chương Trình Đào Tạo"
          value={summary.total_ctdt}
          subValue="32 Đại học • 10 Thạc sĩ • 10 Tiến sĩ"
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <KpiCard
          label="Tổng Số Học Phần"
          value={formatNumber(summary.total_hp_master)}
          subValue={`${summary.total_hp_with_data} có đề cương • ${summary.total_hp_no_data} chưa có`}
          status="accent"
          icon={<BookMarked className="h-5 w-5" />}
        />
        <KpiCard
          label="Tài Nguyên Thư Viện"
          value={formatNumber(summary.libol_records + summary.edata_records)}
          subValue={`${formatNumber(summary.libol_records)} Libol (in) • ${formatNumber(summary.edata_records)} Edata`}
          icon={<Library className="h-5 w-5" />}
        />
        <KpiCard
          label="Tỷ Lệ Đáp Ứng Chung"
          value={`${summary.rate_all}%`}
          subValue={`${formatNumber(summary.match_all)} / ${formatNumber(summary.total_all)} tài liệu`}
          rate={summary.rate_all}
          status={summary.rate_all >= 80 ? 'ok' : summary.rate_all >= 50 ? 'warn' : 'err'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Row 2 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Giáo Trình Bắt Buộc"
          value={`${gtRate}%`}
          subValue={`${formatNumber(summary.gt_match)} / ${formatNumber(summary.gt_total)} tài liệu`}
          rate={gtRate}
          status={gtRate >= 80 ? 'ok' : gtRate >= 50 ? 'warn' : 'err'}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <KpiCard
          label="Sách Tham Khảo"
          value={`${stkRate}%`}
          subValue={`${formatNumber(summary.stk_match)} / ${formatNumber(summary.stk_total)} tài liệu`}
          rate={stkRate}
          status={stkRate >= 80 ? 'ok' : stkRate >= 50 ? 'warn' : 'err'}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Bài Báo / Tài Liệu Số"
          value={`${bbRate}%`}
          subValue={`${formatNumber(summary.bb_match)} / ${formatNumber(summary.bb_total)} tài liệu`}
          rate={bbRate}
          status={bbRate >= 80 ? 'ok' : bbRate >= 50 ? 'warn' : 'err'}
          icon={<BookmarkCheck className="h-5 w-5" />}
        />
        <KpiCard
          label="MARC21 Đã Ánh Xạ"
          value={formatNumber(summary.marc_mapped)}
          subValue="bản ghi liên kết trực tiếp với HP"
          status="accent"
          icon={<Library className="h-5 w-5" />}
        />
      </div>

      {/* Alert banner for gaps */}
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <div className="text-xs sm:text-sm">
          <strong>Cảnh báo phục vụ kiểm định:</strong> Phát hiện <strong>{summary.hp_0_pct} học phần có tỷ lệ đáp ứng 0%</strong> và <strong>{summary.hp_below_50} học phần dưới 50%</strong>. Cần lên danh mục bổ sung khẩn cấp trước khi hoàn thiện báo cáo tự đánh giá.
        </div>
      </div>

      {/* Charts Row 1: Donut charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Phân bổ 833 Học phần theo Trạng thái Đề cương
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={chart0Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Phân bổ 372 Học phần (có dữ liệu) theo Mức đáp ứng
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={chart1Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2: Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Tỷ lệ đáp ứng theo Loại tài nguyên (Yêu cầu vs Đáp ứng)
          </h3>
          <div className="h-64">
            <Bar
              data={chart2Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            So sánh Tỷ lệ đáp ứng theo Cấp đào tạo (ĐH, ThS, TS)
          </h3>
          <div className="h-64">
            <Bar
              data={chart3Data}
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

      {/* Charts Row 3: Top 10 Lowest / Highest CTDT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              Top 10 CTĐT có Tỷ lệ đáp ứng thấp nhất
            </h3>
            <span className="text-xs text-slate-400">Cần ưu tiên bổ sung</span>
          </div>
          <div className="h-72">
            <Bar
              data={chart4Data}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Top 10 CTĐT có Tỷ lệ đáp ứng cao nhất
            </h3>
            <span className="text-xs text-slate-400">Đạt chuẩn học liệu</span>
          </div>
          <div className="h-72">
            <Bar
              data={chart5Data}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
