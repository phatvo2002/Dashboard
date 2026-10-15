'use client';

import React, { useState, useMemo } from 'react';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData } from '@/types/dashboard';
import { formatNumber } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import {
  ShoppingCart,
  Calculator,
  Download,
  AlertCircle,
  Coins,
  BookPlus,
  Sliders,
  CheckCircle
} from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { hp_data, summary } = data;

export default function KeHoachMuaSamPage() {
  // Budget parameters
  const [gtPrice, setGtPrice] = useState<number>(120000); // VNĐ per GT
  const [stkPrice, setStkPrice] = useState<number>(250000); // VNĐ per STK
  const [gtCopies, setGtCopies] = useState<number>(5); // copies per GT
  const [stkCopies, setStkCopies] = useState<number>(3); // copies per STK
  const [targetScope, setTargetScope] = useState<'hp0' | 'allGaps'>('hp0');

  // Gaps calculation
  const hp0List = useMemo(() => {
    return hp_data.filter((h) => h.has_data && h.rate_overall === 0);
  }, []);

  const hpLowList = useMemo(() => {
    return hp_data.filter((h) => h.has_data && h.rate_overall !== null && h.rate_overall > 0 && h.rate_overall < 50);
  }, []);

  const activeHpList = targetScope === 'hp0' ? hp0List : [...hp0List, ...hpLowList];

  // Missing titles
  const totalMissingGtTitles = activeHpList.reduce((acc, h) => acc + (h.gt_total - h.gt_match), 0);
  const totalMissingStkTitles = activeHpList.reduce((acc, h) => acc + (h.stk_total - h.stk_match), 0);

  // Total copies needed
  const totalGtCopiesNeeded = totalMissingGtTitles * gtCopies;
  const totalStkCopiesNeeded = totalMissingStkTitles * stkCopies;

  // Estimated budget (VNĐ)
  const estimatedGtBudget = totalGtCopiesNeeded * gtPrice;
  const estimatedStkBudget = totalStkCopiesNeeded * stkPrice;
  const totalEstimatedBudget = estimatedGtBudget + estimatedStkBudget;

  const handleExportPlan = () => {
    const rows = activeHpList.map((h) => {
      const missingGt = h.gt_total - h.gt_match;
      const missingStk = h.stk_total - h.stk_match;
      const costGt = missingGt * gtCopies * gtPrice;
      const costStk = missingStk * stkCopies * stkPrice;

      return {
        'Mã Học Phần': h.ma,
        'Tên Học Phần': h.ten,
        'Tỷ Lệ Hiện Tại (%)': h.rate_overall !== null ? `${h.rate_overall}%` : '0%',
        'GT Còn Thiếu (Đầu sách)': missingGt,
        'STK Còn Thiếu (Đầu sách)': missingStk,
        'Số Bản GT Cần Mua': missingGt * gtCopies,
        'Số Bản STK Cần Mua': missingStk * stkCopies,
        'Kinh Phí Giáo Trình (VNĐ)': costGt,
        'Kinh Phí Sách TK (VNĐ)': costStk,
        'Tổng Dự Toán HP (VNĐ)': costGt + costStk,
        'CTĐT Liên Quan': h.ctdt_list.join(', '),
      };
    });

    exportToExcel(
      rows,
      `HCMULaw_DuToan_MuaSam_HocLieu_${targetScope === 'hp0' ? 'UuTien_0%' : 'ToanBo_Gaps'}`,
      'DuToanMuaSam'
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <span>Module Quản Trị & Dự Báo Ngân Sách</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kế Hoạch & Dự Toán Mua Sắm Bổ Sung Học Liệu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Mô phỏng ngân sách cần thiết để đưa tỷ lệ đáp ứng tài nguyên học liệu của HCMULaw đạt chuẩn kiểm định.
          </p>
        </div>

        <button
          onClick={handleExportPlan}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-emerald-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Bảng Dự Toán Excel</span>
        </button>
      </div>

      {/* Control Panel (Simulation inputs) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
          <Sliders className="h-4 w-4 text-blue-600" />
          <span>Tham số Mô phỏng Dự toán Mua sắm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs sm:text-sm">
          {/* Target Scope */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Phạm vi ưu tiên</label>
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-medium"
            >
              <option value="hp0">Giai đoạn 1: 37 HP đạt 0% (Khẩn cấp)</option>
              <option value="allGaps">Giai đoạn 2: Toàn bộ HP &lt; 50% (203 HP)</option>
            </select>
          </div>

          {/* GT Price */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Giá trung bình 1 cuốn GT</label>
            <input
              type="number"
              step="10000"
              value={gtPrice}
              onChange={(e) => setGtPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* STK Price */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Giá trung bình 1 cuốn STK</label>
            <input
              type="number"
              step="10000"
              value={stkPrice}
              onChange={(e) => setStkPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* GT Copies */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Số bản in / 1 đầu GT</label>
            <input
              type="number"
              min="1"
              value={gtCopies}
              onChange={(e) => setGtCopies(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* STK Copies */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Số bản in / 1 đầu STK</label>
            <input
              type="number"
              min="1"
              value={stkCopies}
              onChange={(e) => setStkCopies(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Học Phần Cần Bổ Sung
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {activeHpList.length} <span className="text-xs font-normal text-slate-400">môn học</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalMissingGtTitles} đầu GT • {totalMissingStkTitles} đầu STK
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tổng Số Cuốn Sách Cần Đặt
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {formatNumber(totalGtCopiesNeeded + totalStkCopiesNeeded)}{' '}
            <span className="text-xs font-normal text-slate-400">bản in</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatNumber(totalGtCopiesNeeded)} cuốn GT • {formatNumber(totalStkCopiesNeeded)} cuốn STK
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dự Toán Giáo Trình
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatNumber(estimatedGtBudget)} <span className="text-xs font-normal text-slate-400">VNĐ</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Đơn giá {formatNumber(gtPrice)} đ x {gtCopies} bản
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            TỔNG DỰ TOÁN NGÂN SÁCH
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
            {formatNumber(totalEstimatedBudget)} <span className="text-xs font-normal">VNĐ</span>
          </div>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1">
            Khoảng {(totalEstimatedBudget / 1000000000).toFixed(2)} tỷ đồng
          </div>
        </div>
      </div>

      {/* Target Courses Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center justify-between">
          <span>Danh mục học phần trong danh sách dự toán mua sắm ({activeHpList.length} HP)</span>
          <span className="text-xs text-slate-500">Sắp xếp theo thứ tự ưu tiên</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Mã HP</th>
                <th className="px-4 py-3 min-w-[220px]">Tên Học Phần</th>
                <th className="px-3 py-3 text-center">Tỷ Lệ Hiện Tại</th>
                <th className="px-3 py-3 text-right">Thiếu GT</th>
                <th className="px-3 py-3 text-right">Thiếu STK</th>
                <th className="px-3 py-3 text-right font-semibold text-blue-600">Bản Cần Mua</th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-600">Dự Toán (VNĐ)</th>
                <th className="px-4 py-3">CTĐT Thụ Hưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeHpList.map((h) => {
                const missingGt = h.gt_total - h.gt_match;
                const missingStk = h.stk_total - h.stk_match;
                const totalCopies = missingGt * gtCopies + missingStk * stkCopies;
                const hpCost = missingGt * gtCopies * gtPrice + missingStk * stkCopies * stkPrice;

                return (
                  <tr key={h.ma} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                      {h.ma}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                      {h.ten}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {h.rate_overall !== null ? `${h.rate_overall}%` : '0%'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-rose-600">
                      {missingGt > 0 ? missingGt : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-amber-600">
                      {missingStk > 0 ? missingStk : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(totalCopies)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {formatNumber(hpCost)} đ
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {h.ctdt_list.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                        {h.ctdt_list.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{h.ctdt_list.length - 3}
                          </span>
                        )}
                      </div>
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
