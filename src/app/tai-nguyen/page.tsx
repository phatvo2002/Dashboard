'use client';

import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import '@/components/charts/ChartConfig';
import rawData from '@/data/hcmulaw-data.json';
import { DashboardData } from '@/types/dashboard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RateBar } from '@/components/dashboard/RateBar';
import { formatNumber, getRateBadgeClass } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { Library, BookOpen, FileDigit, Link2, Download } from 'lucide-react';

const data = rawData as unknown as DashboardData;
const { summary } = data;

export default function TaiNguyenPage() {
  // Chart 7: Required vs Matched vs Missing
  const chart7Data = {
    labels: ['Giáo trình (GT)', 'Sách tham khảo (STK)', 'Bài báo / Edata (BB)'],
    datasets: [
      {
        label: 'Yêu cầu trong đề cương',
        data: [summary.gt_total, summary.stk_total, summary.bb_total],
        backgroundColor: '#94a3b8',
      },
      {
        label: 'Thư viện đã đáp ứng',
        data: [summary.gt_match, summary.stk_match, summary.bb_match],
        backgroundColor: '#2563eb',
      },
      {
        label: 'Còn thiếu',
        data: [
          summary.gt_total - summary.gt_match,
          summary.stk_total - summary.stk_match,
          summary.bb_total - summary.bb_match,
        ],
        backgroundColor: '#f87171',
      },
    ],
  };

  // Chart 8: Libol vs Edata
  const chart8Data = {
    labels: [
      `Libol - Tài liệu in: ${formatNumber(summary.libol_records)}`,
      `Edata - Tài liệu số: ${formatNumber(summary.edata_records)}`,
    ],
    datasets: [
      {
        data: [summary.libol_records, summary.edata_records],
        backgroundColor: ['#1d4ed8', '#7c3aed'],
        borderWidth: 0,
      },
    ],
  };

  const gtR = summary.gt_total ? Math.round((summary.gt_match / summary.gt_total) * 1000) / 10 : 0;
  const stkR = summary.stk_total ? Math.round((summary.stk_match / summary.stk_total) * 1000) / 10 : 0;
  const bbR = summary.bb_total ? Math.round((summary.bb_match / summary.bb_total) * 1000) / 10 : 0;
  const allR = summary.total_all ? Math.round((summary.match_all / summary.total_all) * 1000) / 10 : 0;

  const tableRows = [
    {
      name: 'Giáo trình bắt buộc (GT)',
      req: summary.gt_total,
      match: summary.gt_match,
      missing: summary.gt_total - summary.gt_match,
      rate: gtR,
      desc: 'Tài liệu học tập bắt buộc cho sinh viên theo đề cương chi tiết môn học',
    },
    {
      name: 'Sách tham khảo (STK)',
      req: summary.stk_total,
      match: summary.stk_match,
      missing: summary.stk_total - summary.stk_match,
      rate: stkR,
      desc: 'Tài liệu đọc thêm, chuyên khảo, sách dịch tham khảo mở rộng',
    },
    {
      name: 'Bài báo / Tạp chí / Edata (BB)',
      req: summary.bb_total,
      match: summary.bb_match,
      missing: summary.bb_total - summary.bb_match,
      rate: bbR,
      desc: 'Bài báo khoa học, án lệ, tài liệu pháp luật điện tử trong kho Edata',
    },
  ];

  const handleExport = () => {
    const exportData = [
      ...tableRows.map((r) => ({
        'Loại Tài Nguyên': r.name,
        'Yêu Cầu': r.req,
        'Đáp Ứng': r.match,
        'Thiếu Hụt': r.missing,
        'Tỷ Lệ Đáp Ứng (%)': `${r.rate}%`,
        'Ghi Chú': r.desc,
      })),
      {
        'Loại Tài Nguyên': 'TỔNG CỘNG',
        'Yêu Cầu': summary.total_all,
        'Đáp Ứng': summary.match_all,
        'Thiếu Hụt': summary.total_all - summary.match_all,
        'Tỷ Lệ Đáp Ứng (%)': `${allR}%`,
        'Ghi Chú': 'Toàn bộ tài nguyên yêu cầu trong kỳ kiểm định',
      },
    ];
    exportToExcel(exportData, 'HCMULaw_ThongKe_TaiNguyen_ThuVien', 'TaiNguyen');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kho Tài Nguyên Thư Viện HCMULaw
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp quy mô kho tư liệu in (Libol), kho tài nguyên số (Edata) và mức độ ánh xạ chuẩn MARC21.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Xuất Báo Cáo Tài Nguyên</span>
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Bản Ghi Libol (In)"
          value={formatNumber(summary.libol_records)}
          subValue="Sách in, giáo trình, tạp chí tại kho"
          status="accent"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <KpiCard
          label="Bản Ghi Edata (Số)"
          value={formatNumber(summary.edata_records)}
          subValue="Bài báo, án lệ, tài liệu điện tử số"
          icon={<FileDigit className="h-5 w-5" />}
        />
        <KpiCard
          label="Tổng Quy Mô Thư Viện"
          value={formatNumber(summary.libol_records + summary.edata_records)}
          subValue="Toàn bộ tài nguyên trong CSDL trường"
          icon={<Library className="h-5 w-5" />}
        />
        <KpiCard
          label="Bản Ghi MARC21 Đã Ánh Xạ"
          value={formatNumber(summary.marc_mapped)}
          subValue="Bản ghi MARC đã nối trực tiếp với HP"
          status="ok"
          icon={<Link2 className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            So sánh Yêu cầu - Đáp ứng - Thiếu hụt theo loại
          </h3>
          <div className="h-64">
            <Bar
              data={chart7Data}
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
            Cơ cấu Nguồn học liệu: Libol (In) vs Edata (Số)
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={chart8Data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 font-semibold text-slate-800 dark:text-slate-200 text-sm">
          Bảng thống kê chi tiết theo loại tài nguyên
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3">Loại Tài Nguyên</th>
                <th className="px-4 py-3 text-right">Yêu Cầu</th>
                <th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">Đáp Ứng</th>
                <th className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">Thiếu Hụt</th>
                <th className="px-4 py-3 text-right">Tỷ Lệ</th>
                <th className="px-6 py-3 min-w-[180px]">Tiến Độ Đáp Ứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-medium">{formatNumber(r.req)}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                    {formatNumber(r.match)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatNumber(r.missing)}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRateBadgeClass(r.rate)}`}>
                      {r.rate}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <RateBar rate={r.rate} height={8} />
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                <td className="px-5 py-4 text-slate-900 dark:text-white">
                  TỔNG CỘNG TÀI NGUYÊN HỌC LIỆU
                </td>
                <td className="px-4 py-4 text-right font-mono">{formatNumber(summary.total_all)}</td>
                <td className="px-4 py-4 text-right font-mono text-blue-700 dark:text-blue-400">
                  {formatNumber(summary.match_all)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-rose-600 dark:text-rose-400">
                  {formatNumber(summary.total_all - summary.match_all)}
                </td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getRateBadgeClass(allR)}`}>
                    {allR}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <RateBar rate={allR} height={8} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
