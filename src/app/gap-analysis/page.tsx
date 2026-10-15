'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData, HocPhanItem } from '@/types/dashboard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { formatNumber, getRateBadgeClass } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { AlertTriangle, AlertOctagon, HelpCircle, BookX, Download, ArrowRight } from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { hp_data, ctdt_data, summary } = data;

export default function GapAnalysisPage() {
  // HP 0%
  const hp0List = useMemo(() => {
    return hp_data
      .filter((h) => h.has_data && h.rate_overall === 0)
      .sort((a, b) => b.total - a.total);
  }, []);

  // HP Low (<50% but >0)
  const hpLowList = useMemo(() => {
    return hp_data
      .filter((h) => h.has_data && h.rate_overall !== null && h.rate_overall > 0 && h.rate_overall < 50)
      .sort((a, b) => (a.rate_overall ?? 0) - (b.rate_overall ?? 0));
  }, []);

  // Chart 9: Top CTDT missing GT
  const gtGapCtdt = useMemo(() => {
    return ctdt_data
      .filter((c) => c.hp_with_gt_gap > 0)
      .sort((a, b) => b.hp_with_gt_gap - a.hp_with_gt_gap)
      .slice(0, 12);
  }, []);

  const chart9Data = {
    labels: gtGapCtdt.map((c) => c.ma),
    datasets: [
      {
        label: 'Số học phần thiếu Giáo trình',
        data: gtGapCtdt.map((c) => c.hp_with_gt_gap),
        backgroundColor: '#dc2626',
      },
    ],
  };

  // Chart 10: Top CTDT missing STK
  const stkGapCtdt = useMemo(() => {
    return ctdt_data
      .filter((c) => c.hp_with_stk_gap > 0)
      .sort((a, b) => b.hp_with_stk_gap - a.hp_with_stk_gap)
      .slice(0, 12);
  }, []);

  const chart10Data = {
    labels: stkGapCtdt.map((c) => c.ma),
    datasets: [
      {
        label: 'Số học phần thiếu Sách tham khảo',
        data: stkGapCtdt.map((c) => c.hp_with_stk_gap),
        backgroundColor: '#d97706',
      },
    ],
  };

  const handleExportHp0 = () => {
    const exportData = hp0List.map((h) => ({
      'Mã HP': h.ma,
      'Tên Học Phần': h.ten,
      'GT Yêu Cầu': h.gt_total,
      'STK Yêu Cầu': h.stk_total,
      'BB Yêu Cầu': h.bb_total,
      'Tổng Yêu Cầu (Thiếu 100%)': h.total,
      'Thuộc Các CTĐT': h.ctdt_list.join(', '),
    }));
    exportToExcel(exportData, 'HCMULaw_HocPhan_DapUng_0_PhanTram', 'HP_0%');
  };

  const handleExportHpLow = () => {
    const exportData = hpLowList.map((h) => ({
      'Mã HP': h.ma,
      'Tên Học Phần': h.ten,
      'Tỷ Lệ Đáp Ứng': `${h.rate_overall}%`,
      'Đáp Ứng / Yêu Cầu': `${h.matched} / ${h.total}`,
      'Giáo Trình': `${h.gt_match} / ${h.gt_total}`,
      'Sách Tham Khảo': `${h.stk_match} / ${h.stk_total}`,
      'Bài Báo / Số': `${h.bb_match} / ${h.bb_total}`,
      'Thuộc Các CTĐT': h.ctdt_list.join(', '),
    }));
    exportToExcel(exportData, 'HCMULaw_HocPhan_Duoi_50_PhanTram', 'HP_Duoi50%');
  };

  const ctdtWithGtGap = ctdt_data.filter((c) => c.hp_with_gt_gap > 0).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Phân Tích Khoảng Cách Thiếu Hụt (Gap Analysis)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Khoanh vùng các học phần có nguy cơ cao không đạt chuẩn kiểm định thư viện (chuẩn đánh giá CSGD ĐH).
          </p>
        </div>

        <Link
          href="/ke-hoach-mua-sam"
          className="inline-flex items-center gap-2 rounded-xl bg-red-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-red-900 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Lập Dự Toán Bổ Sung Sách</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="HP Đáp Ứng 0%"
          value={hp0List.length}
          subValue="Không có tài liệu nào trong thư viện"
          status="err"
          icon={<AlertOctagon className="h-5 w-5" />}
        />
        <KpiCard
          label="HP Dưới 50%"
          value={hp0List.length + hpLowList.length}
          subValue="Bao gồm cả nhóm 0% và 1–49%"
          status="warn"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KpiCard
          label="HP Chưa Có Đề Cương"
          value={summary.total_hp_no_data}
          subValue="55.4% học phần chưa thu thập TLTK"
          status="accent"
          icon={<HelpCircle className="h-5 w-5" />}
        />
        <KpiCard
          label="CTĐT Bị Thiếu Giáo Trình"
          value={`${ctdtWithGtGap} / ${ctdt_data.length}`}
          subValue="CTĐT có ít nhất 1 môn thiếu GT"
          status="err"
          icon={<BookX className="h-5 w-5" />}
        />
      </div>

      {/* Charts: Gap rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2">
            Top CTĐT có nhiều học phần thiếu Giáo trình nhất (GT Gap)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Các ngành cần rà soát mua bổ sung giáo trình bắt buộc</p>
          <div className="h-72">
            <Bar
              data={chart9Data}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
            Top CTĐT có nhiều học phần thiếu Sách tham khảo nhất (STK Gap)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Các ngành cần bổ sung sách chuyên khảo, tham khảo mở rộng</p>
          <div className="h-72">
            <Bar
              data={chart10Data}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Table 1: HP 0% */}
      <div className="overflow-hidden rounded-xl border border-rose-200 bg-white shadow-xs dark:border-rose-950 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-200 bg-rose-50/80 px-5 py-3.5 dark:border-rose-950 dark:bg-rose-950/40 gap-2">
          <div>
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              <span>Học phần có tỷ lệ đáp ứng 0% (Ưu tiên bổ sung khẩn cấp - {hp0List.length} HP)</span>
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              Các môn học này hoàn toàn chưa có đầu sách nào trong thư viện trùng khớp với đề cương chi tiết.
            </p>
          </div>

          <button
            onClick={handleExportHp0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Danh Sách 0%</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 bg-rose-100/60 font-semibold text-rose-900 dark:bg-slate-800 dark:text-slate-200 border-b border-rose-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Mã HP</th>
                <th className="px-4 py-3 min-w-[200px]">Tên Học Phần</th>
                <th className="px-3 py-3 text-right">GT Yêu Cầu</th>
                <th className="px-3 py-3 text-right">STK Yêu Cầu</th>
                <th className="px-3 py-3 text-right">BB Yêu Cầu</th>
                <th className="px-3 py-3 text-right font-bold text-rose-700">Tổng Cần Mua</th>
                <th className="px-4 py-3">Thuộc Các CTĐT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100 dark:divide-slate-800">
              {hp0List.map((h) => (
                <tr key={h.ma} className="hover:bg-rose-50/50 dark:hover:bg-rose-950/20">
                  <td className="px-4 py-2.5 font-mono font-semibold text-rose-700 dark:text-rose-400">
                    {h.ma}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{h.ten}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{h.gt_total}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{h.stk_total}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{h.bb_total}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                    {h.total}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {h.ctdt_list.map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[11px] font-mono text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: HP Low (<50%) */}
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-xs dark:border-amber-950 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 bg-amber-50/80 px-5 py-3.5 dark:border-amber-950 dark:bg-amber-950/40 gap-2">
          <div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Học phần có tỷ lệ đáp ứng dưới 50% ({hpLowList.length} HP)</span>
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Nhóm học phần có học liệu nhưng chưa đạt ngưỡng tiêu chuẩn kiểm định tối thiểu.
            </p>
          </div>

          <button
            onClick={handleExportHpLow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Danh Sách &lt;50%</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 bg-amber-100/60 font-semibold text-amber-900 dark:bg-slate-800 dark:text-slate-200 border-b border-amber-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Mã HP</th>
                <th className="px-4 py-3 min-w-[200px]">Tên Học Phần</th>
                <th className="px-3 py-3 text-right">Tỷ Lệ</th>
                <th className="px-3 py-3 text-right">Đáp Ứng / Yêu Cầu</th>
                <th className="px-3 py-3 text-right">Giáo Trình</th>
                <th className="px-3 py-3 text-right">Sách TK</th>
                <th className="px-3 py-3 text-right">Bài Báo/Số</th>
                <th className="px-4 py-3">Thuộc Các CTĐT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800">
              {hpLowList.map((h) => (
                <tr key={h.ma} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                  <td className="px-4 py-2.5 font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {h.ma}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{h.ten}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600">
                    {h.rate_overall}%
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {h.matched} / {h.total}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {h.gt_match} / {h.gt_total}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {h.stk_match} / {h.stk_total}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {h.bb_match} / {h.bb_total}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {h.ctdt_list.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-mono text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        >
                          {c}
                        </span>
                      ))}
                      {h.ctdt_list.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{h.ctdt_list.length - 4} CTĐT
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
