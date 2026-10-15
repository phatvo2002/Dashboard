'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData, HocPhanItem } from '@/types/dashboard';
import { formatNumber, formatPercent, getRateBadgeClass, getRateColor } from '@/lib/utils';
import { RateBar } from '@/components/dashboard/RateBar';
import { exportToExcel } from '@/lib/export-excel';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { hp_data, ctdt_data } = data;

const PAGE_SIZE = 50;

function HocPhanContent() {
  const searchParams = useSearchParams();
  const initialCtdt = searchParams.get('ctdt') || '';

  const [ctdtFilter, setCtdtFilter] = useState<string>(initialCtdt);
  const [statusFilter, setStatusFilter] = useState<string>(''); // 'data', 'nodata'
  const [rateFilter, setRateFilter] = useState<string>(''); // '0', 'lt50', '50-79', 'gte80', '100'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedHp, setExpandedHp] = useState<string | null>(null);

  useEffect(() => {
    if (initialCtdt) {
      setCtdtFilter(initialCtdt);
      setCurrentPage(1);
    }
  }, [initialCtdt]);

  // Filtered HP
  const filteredHp = useMemo(() => {
    return hp_data.filter((h) => {
      // CTDT filter
      if (ctdtFilter && !h.ctdt_list.includes(ctdtFilter)) {
        return false;
      }
      // Status filter
      if (statusFilter === 'data' && !h.has_data) return false;
      if (statusFilter === 'nodata' && h.has_data) return false;

      // Rate filter
      if (rateFilter) {
        if (!h.has_data || h.rate_overall === null) return false;
        if (rateFilter === '0' && h.rate_overall !== 0) return false;
        if (rateFilter === 'lt50' && (h.rate_overall >= 50 || h.rate_overall === 0)) return false;
        if (rateFilter === '50-79' && (h.rate_overall < 50 || h.rate_overall >= 80)) return false;
        if (rateFilter === 'gte80' && h.rate_overall < 80) return false;
        if (rateFilter === '100' && h.rate_overall !== 100) return false;
      }

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchCode = h.ma.toLowerCase().includes(q);
        const matchName = h.ten.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }

      return true;
    });
  }, [ctdtFilter, statusFilter, rateFilter, searchQuery]);

  const totalPages = Math.ceil(filteredHp.length / PAGE_SIZE) || 1;
  const paginatedHp = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHp.slice(start, start + PAGE_SIZE);
  }, [filteredHp, currentPage]);

  const handleExport = () => {
    const exportRows = filteredHp.map((h) => ({
      'Mã Học Phần': h.ma,
      'Tên Học Phần': h.ten,
      'Trạng Thái Dữ Liệu': h.has_data ? 'Có Đề Cương' : 'Chưa Có Đề Cương',
      'Số CTĐT Sử Dụng': h.ctdt_count,
      'GT Đáp Ứng / Yêu Cầu': h.has_data ? `${h.gt_match} / ${h.gt_total}` : '—',
      'STK Đáp Ứng / Yêu Cầu': h.has_data ? `${h.stk_match} / ${h.stk_total}` : '—',
      'BB Đáp Ứng / Yêu Cầu': h.has_data ? `${h.bb_match} / ${h.bb_total}` : '—',
      'Tỷ Lệ Chung (%)': h.rate_overall !== null ? `${h.rate_overall}%` : 'N/A',
      'Danh Sách CTĐT': h.ctdt_list.join(', '),
    }));
    exportToExcel(exportRows, 'HCMULaw_DanhSach_HocPhan', 'HocPhan');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            833 Học Phần (Master Courses)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tra cứu chi tiết tình trạng giáo trình, sách tham khảo và học liệu số theo từng môn học.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Excel ({filteredHp.length} HP)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên học phần..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* CTDT dropdown */}
        <select
          value={ctdtFilter}
          onChange={(e) => {
            setCtdtFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white truncate"
        >
          <option value="">Tất cả 52 CTĐT</option>
          {ctdt_data.map((c) => (
            <option key={c.ma} value={c.ma}>
              {c.ma} – {c.ten.slice(0, 45)}...
            </option>
          ))}
        </select>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="data">Có dữ liệu đề cương (372)</option>
          <option value="nodata">Chưa có dữ liệu đề cương (461)</option>
        </select>

        {/* Rate level */}
        <select
          value={rateFilter}
          onChange={(e) => {
            setRateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">Tất cả mức đáp ứng</option>
          <option value="0">0% (Thiếu toàn bộ)</option>
          <option value="lt50">&lt; 50% (Mức cảnh báo)</option>
          <option value="50-79">50% – 79% (Trung bình)</option>
          <option value="gte80">≥ 80% (Đạt yêu cầu)</option>
          <option value="100">100% (Đầy đủ 100%)</option>
        </select>
      </div>

      {/* Active filter badge & count */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Kết quả: <strong>{filteredHp.length}</strong> học phần
          </span>
          {ctdtFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              CTĐT: {ctdtFilter}
              <button
                onClick={() => setCtdtFilter('')}
                className="hover:text-blue-950 dark:hover:text-white cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
        <div>
          Trang <strong>{currentPage}</strong> / {totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Mã HP</th>
                <th className="px-4 py-3 min-w-[260px]">Tên Học Phần</th>
                <th className="px-3 py-3 text-center">Trạng Thái</th>
                <th className="px-3 py-3 text-right">Số CTĐT</th>
                <th className="px-3 py-3 text-right">Giáo Trình</th>
                <th className="px-3 py-3 text-right">Sách Tham Khảo</th>
                <th className="px-3 py-3 text-right">Bài Báo / Số</th>
                <th className="px-4 py-3 text-right">Tỷ Lệ Đáp Ứng</th>
                <th className="px-3 py-3 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedHp.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy học phần nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedHp.map((h) => {
                  const isExpanded = expandedHp === h.ma;

                  return (
                    <React.Fragment key={h.ma}>
                      <tr
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          !h.has_data ? 'opacity-60 bg-slate-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                          {h.ma}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {h.ten}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {h.has_data ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              <CheckCircle2 className="h-3 w-3 text-blue-600" />
                              <span>Có đề cương</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <XCircle className="h-3 w-3 text-slate-400" />
                              <span>Chưa có</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {h.ctdt_count}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {h.has_data ? `${h.gt_match}/${h.gt_total}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {h.has_data ? `${h.stk_match}/${h.stk_total}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {h.has_data ? `${h.bb_match}/${h.bb_total}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {h.has_data && h.rate_overall !== null ? (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRateBadgeClass(
                                h.rate_overall
                              )}`}
                            >
                              {h.rate_overall}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {h.has_data ? (
                            <button
                              onClick={() => setExpandedHp(isExpanded ? null : h.ma)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Đóng' : 'Xem'}</span>
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Chi tiết đáp ứng học liệu: {h.ma} – {h.ten}
                                </h4>
                                <span
                                  className={`font-mono font-bold text-sm ${getRateColor(h.rate_overall)}`}
                                >
                                  Tổng: {h.matched}/{h.total} ({h.rate_overall}%)
                                </span>
                              </div>

                              {/* 5 metrics */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-500 font-medium">Giáo Trình</div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {h.gt_match}/{h.gt_total} ({formatPercent(h.rate_gt)})
                                  </div>
                                  <RateBar rate={h.rate_gt} height={4} />
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-500 font-medium">Sách Tham Khảo</div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {h.stk_match}/{h.stk_total} ({formatPercent(h.rate_stk)})
                                  </div>
                                  <RateBar rate={h.rate_stk} height={4} />
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-500 font-medium">Bài Báo / Edata</div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {h.bb_match}/{h.bb_total} ({formatPercent(h.rate_bb)})
                                  </div>
                                  <RateBar rate={h.rate_bb} height={4} />
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-500 font-medium">Tài liệu In (GT+STK)</div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {formatPercent(h.rate_print)}
                                  </div>
                                  <RateBar rate={h.rate_print} height={4} />
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[11px] text-slate-500 font-medium">Tài liệu Số (Edata)</div>
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {formatPercent(h.rate_digital)}
                                  </div>
                                  <RateBar rate={h.rate_digital} height={4} />
                                </div>
                              </div>

                              {/* CTDT chips */}
                              {h.ctdt_list && h.ctdt_list.length > 0 && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                                    Được giảng dạy trong {h.ctdt_list.length} Chương Trình Đào Tạo:
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {h.ctdt_list.map((cCode) => (
                                      <button
                                        key={cCode}
                                        onClick={() => setCtdtFilter(cCode)}
                                        className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 cursor-pointer"
                                      >
                                        {cCode}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredHp.length)} trong số {filteredHp.length} học phần
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Trước
            </button>

            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HocPhanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải danh sách học phần...</div>}>
      <HocPhanContent />
    </Suspense>
  );
}
