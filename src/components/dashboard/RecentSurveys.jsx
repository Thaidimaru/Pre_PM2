import React, { useState } from 'react';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { SurveyReportModal } from '@/components/export/SurveyReportModal';
import { SurveyPreviewModal } from '@/components/dashboard/SurveyPreviewModal';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function RecentSurveys({ recent = [], onNavigate }) {
  const { isDark } = useTheme();
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = recent.length;
  const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * effectivePageSize;
  const endIndex = pageSize === 'all' ? totalItems : Math.min(startIndex + effectivePageSize, totalItems);
  const displayedItems = pageSize === 'all' ? recent : recent.slice(startIndex, endIndex);

  const getBadge = (permit) => {
    if (permit === 'อนุญาต') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
            isDark
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    if (permit === 'ไม่อนุญาต') {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
            isDark
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              : 'bg-rose-50 border-rose-300 text-rose-700'
          )}
        >
          <XCircle className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
          isDark
            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
            : 'bg-purple-50 border-purple-300 text-purple-700'
        )}
      >
        <AlertCircle className="h-3 w-3" />
        {permit || 'รอพิจารณา'}
      </span>
    );
  };

  return (
    <>
      <GlassCard className="flex flex-col" hoverEffect={false}>
        {/* Panel Title & Action */}
        <div className={cn('flex items-center justify-between pb-4 border-b', isDark ? 'border-slate-800/80' : 'border-slate-200')}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-sky-100 text-sky-600'
              )}
            >
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className={cn('text-lg font-bold tracking-normal leading-tight', isDark ? 'text-white' : 'text-slate-900')}>
                การสำรวจล่าสุด
              </h2>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                คลิกที่รหัสรายการ หรือชื่อสถานี เพื่อพรีวิวข้อมูลและรูปภาพ
              </p>
            </div>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('field')}
              className={cn(
                'group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                isDark
                  ? 'border-blue-500/30 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50 hover:text-white'
                  : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-400 shadow-2xs'
              )}
            >
              <span>บันทึกใหม่</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Toolbar: Count info & Page Size Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 pb-1 text-xs">
          <div className={cn('font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>
            แสดง{' '}
            <span className={cn('font-bold font-mono', isDark ? 'text-cyan-300' : 'text-sky-600')}>
              {totalItems > 0 ? startIndex + 1 : 0} - {endIndex}
            </span>{' '}
            จากทั้งหมด{' '}
            <span className={cn('font-bold font-mono', isDark ? 'text-cyan-300' : 'text-sky-600')}>
              {totalItems}
            </span>{' '}
            สถานี
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="station-page-size"
              className={cn('font-medium cursor-pointer', isDark ? 'text-slate-400' : 'text-slate-500')}
            >
              จำนวนต่อหน้า:
            </label>
            <select
              id="station-page-size"
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500',
                isDark
                  ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 shadow-2xs'
              )}
            >
              <option value={5}>5 สถานี/หน้า</option>
              <option value={10}>10 สถานี/หน้า</option>
              <option value={20}>20 สถานี/หน้า</option>
              <option value={50}>50 สถานี/หน้า</option>
              <option value={100}>100 สถานี/หน้า</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </div>
        </div>

        {/* Table Container with scrollbar */}
        <div
          className={cn(
            'overflow-x-auto overflow-y-auto max-h-[420px] rounded-xl border mt-2 custom-scrollbar transition-colors',
            isDark ? 'border-slate-800/80 bg-slate-950/20' : 'border-slate-200 bg-white'
          )}
        >
          <table className="w-full text-left text-sm relative border-collapse">
            <thead
              className={cn(
                'sticky top-0 z-10 backdrop-blur-md shadow-xs',
                isDark ? 'bg-slate-900/95 text-slate-400' : 'bg-slate-50/95 text-slate-500'
              )}
            >
              <tr className={cn('border-b text-xs font-semibold', isDark ? 'border-slate-800' : 'border-slate-200')}>
                <th className="py-2.5 pr-3 pl-3">รหัสรายการ</th>
                <th className="py-2.5 px-3">สถานี</th>
                <th className="py-2.5 px-3">จังหวัด</th>
                <th className="py-2.5 px-3 text-center">ผล</th>
                <th className="py-2.5 px-3 text-right">เวลาบันทึก</th>
                <th className="py-2.5 pl-3 pr-3 text-center">Export</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isDark ? 'divide-slate-800/50' : 'divide-slate-200')}>
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => (
                  <tr
                    key={item.recordId}
                    className={cn(
                      'transition-colors',
                      isDark ? 'hover:bg-slate-800/30' : 'hover:bg-sky-50/50'
                    )}
                  >
                    {/* Clickable Record ID */}
                    <td className="py-3 pr-3 pl-3 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(item)}
                        className={cn(
                          'group inline-flex items-center gap-1.5 transition-colors font-mono cursor-pointer text-left',
                          isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-700'
                        )}
                        title="คลิกเพื่อพรีวิวข้อมูลที่กรอกและรูปภาพ"
                      >
                        <span className="group-hover:underline underline-offset-2 font-semibold">
                          {item.recordId}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    {/* Clickable Station Name */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(item)}
                        className={cn(
                          'text-left font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 flex-wrap',
                          isDark ? 'text-slate-200 hover:text-cyan-300' : 'text-slate-800 hover:text-sky-600'
                        )}
                        title="คลิกเพื่อพรีวิวข้อมูลที่กรอกและรูปภาพ"
                      >
                        <span className="hover:underline underline-offset-2">
                          {item.station}
                        </span>
                        {item.photos && item.photos.length > 0 && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium border',
                              isDark
                                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                                : 'bg-sky-100 border-sky-200 text-sky-700'
                            )}
                            title={`มีรูปภาพแนบ ${item.photos.length} รูป`}
                          >
                            <ImageIcon className="h-3 w-3" />
                            <span>{item.photos.length}</span>
                          </span>
                        )}
                      </button>
                    </td>

                    <td className={cn('py-3 px-3', isDark ? 'text-slate-300' : 'text-slate-700')}>
                      {item.province}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {getBadge(item.permit)}
                    </td>

                    <td className={cn('py-3 px-3 text-right text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {new Date(item.savedAt).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>

                    <td className="py-3 pl-3 pr-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(item)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shadow-xs',
                          isDark
                            ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-600/30 hover:border-cyan-400 hover:text-white'
                            : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-400'
                        )}
                        title="ส่งออกรายงาน A4 ทางการ (Export PDF / Print)"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Export</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={cn('py-8 text-center', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    ยังไม่มีผลสำรวจ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            className={cn(
              'flex items-center justify-between pt-3 mt-2 border-t text-xs',
              isDark ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-600'
            )}
          >
            <div className="font-medium">
              หน้า <span className="font-bold font-mono">{safeCurrentPage}</span> จาก{' '}
              <span className="font-bold font-mono">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs',
                  isDark
                    ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                )}
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>ก่อนหน้า</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((pageNum) => {
                    if (totalPages <= 5) return true;
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - safeCurrentPage) <= 1
                    );
                  })
                  .map((pageNum, idx, arr) => {
                    const prevNum = arr[idx - 1];
                    const showEllipsis = prevNum && pageNum - prevNum > 1;
                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && <span className="px-1 text-slate-500">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            'h-7 min-w-[1.75rem] px-1.5 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer',
                            safeCurrentPage === pageNum
                              ? isDark
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-sky-100 text-sky-700 border border-sky-300'
                              : isDark
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          )}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs',
                  isDark
                    ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                )}
                title="หน้าถัดไป"
              >
                <span>ถัดไป</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Survey Preview Modal (Detail & Photos with Download) */}
      <SurveyPreviewModal
        isOpen={Boolean(selectedPreview)}
        onClose={() => setSelectedPreview(null)}
        surveyData={selectedPreview || {}}
        onOpenOfficialReport={(reportData) => {
          setSelectedReport(reportData);
        }}
      />

      {/* Survey Official A4 Printable Report Modal */}
      <SurveyReportModal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        surveyData={selectedReport || {}}
      />
    </>
  );
}
