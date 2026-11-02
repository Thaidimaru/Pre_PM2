import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Layers,
  BarChart3,
  PieChart,
  ShieldCheck,
  Calendar,
  Filter,
  Loader2,
  Check,
  Radio,
  FileDown,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { APP_VERSION } from '@/version';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';
import forthLogo from '@/assets/images/forth-logo.png';

/**
 * Baseline 10 Provinces standard configuration for NBTC Microwave (Total 197 stations)
 */
export const PROVINCE_BASELINES = [
  { name: 'กาญจนบุรี', total: 32 },
  { name: 'ขอนแก่น', total: 29 },
  { name: 'นครราชสีมา', total: 26 },
  { name: 'นครศรีธรรมราช', total: 22 },
  { name: 'เพชรบูรณ์', total: 22 },
  { name: 'ตรัง', total: 19 },
  { name: 'กำแพงเพชร', total: 18 },
  { name: 'จันทบุรี', total: 18 },
  { name: 'พิจิตร', total: 6 },
  { name: 'นครสวรรค์', total: 5 },
];

export const TOTAL_BASELINE_STATIONS = 197;

/**
 * Format a Date to Thai formal string (e.g., 2 พฤศจิกายน 2569)
 */
export function formatThaiDate(date = new Date()) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Format a Date to Thai time string (e.g., 14:30 น.)
 */
export function formatThaiTime(date = new Date()) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return `${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
  } catch {
    return '-';
  }
}

/**
 * SVG Donut Chart Component with clean vector arcs and crisp legend
 */
function HighResDonutChart({ allowed = 0, denied = 0, pending = 0, total = 197 }) {
  const safeTotal = total > 0 ? total : 197;
  const safeAllowed = Math.max(allowed, 0);
  const safeDenied = Math.max(denied, 0);
  const safePending = Math.max(pending, 0);

  const allowedPct = (safeAllowed / safeTotal) * 100;
  const deniedPct = (safeDenied / safeTotal) * 100;
  const pendingPct = (safePending / safeTotal) * 100;

  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  const allowedLength = (allowedPct / 100) * circumference;
  const deniedLength = (deniedPct / 100) * circumference;
  const pendingLength = (pendingPct / 100) * circumference;

  // Offsets for stroke-dashoffset (starting from top -90deg)
  const allowedOffset = 0;
  const deniedOffset = -allowedLength;
  const pendingOffset = -(allowedLength + deniedLength);

  const surveyedCount = safeAllowed + safeDenied;
  const surveyedPct = (surveyedCount / safeTotal) * 100;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-3 bg-neutral-50/80 rounded-lg border border-neutral-200">
      {/* Donut Graphic */}
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="20"
          />

          {/* Pending arc (Amber) */}
          {pendingLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeDasharray={`${pendingLength} ${circumference - pendingLength}`}
              strokeDashoffset={pendingOffset}
            />
          )}

          {/* Denied arc (Rose Red) */}
          {deniedLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${deniedLength} ${circumference - deniedLength}`}
              strokeDashoffset={deniedOffset}
            />
          )}

          {/* Allowed arc (Emerald Green) */}
          {allowedLength > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${allowedLength} ${circumference - allowedLength}`}
              strokeDashoffset={allowedOffset}
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-[20px] font-extrabold text-neutral-900 leading-none">
            {surveyedPct.toFixed(1)}%
          </span>
          <span className="text-[10.5px] font-bold text-neutral-600 mt-1">
            สำรวจแล้ว
          </span>
          <span className="text-[9.5px] font-semibold text-neutral-500">
            {surveyedCount}/{safeTotal}
          </span>
        </div>
      </div>

      {/* Legend & Stat Details */}
      <div className="flex-1 w-full space-y-2 text-[12px]">
        {/* Allowed */}
        <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50/80 border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-emerald-950">อนุญาตเข้าพื้นที่</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-emerald-800 text-[13px]">{safeAllowed}</span>
            <span className="text-neutral-500 text-[10.5px] ml-1">({allowedPct.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Denied */}
        <div className="flex items-center justify-between p-1.5 rounded bg-rose-50/80 border border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span className="font-bold text-rose-950">ไม่อนุญาตเข้าพื้นที่</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-rose-800 text-[13px]">{safeDenied}</span>
            <span className="text-neutral-500 text-[10.5px] ml-1">({deniedPct.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-1.5 rounded bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="font-bold text-amber-950">รอดำเนินการ / ยังไม่ตรวจ</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-amber-800 text-[13px]">{safePending}</span>
            <span className="text-neutral-500 text-[10.5px] ml-1">({pendingPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Bar Chart comparing survey completion across all 10 provinces
 */
function HighResProvincialBarChart({ provinceData = [] }) {
  return (
    <div className="space-y-1.5 p-3 bg-neutral-50/80 rounded-lg border border-neutral-200">
      {provinceData.map((item, idx) => {
        const pct = item.total > 0 ? (item.surveyed / item.total) * 100 : 0;
        const isComplete = pct >= 100;

        return (
          <div key={item.name} className="flex items-center gap-2 text-[11.5px] leading-tight">
            {/* Province Name */}
            <div className="w-24 shrink-0 font-bold text-neutral-800 flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-[10px] text-neutral-500 font-normal">({item.total})</span>
            </div>

            {/* Horizontal Progress Bar Track */}
            <div className="flex-1 h-3.5 bg-neutral-200 rounded-sm overflow-hidden relative">
              <div
                className={cn(
                  'h-full transition-all duration-300 rounded-sm',
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            {/* Metric Label */}
            <div className="w-20 text-right shrink-0 text-[11px] font-bold">
              <span className={isComplete ? 'text-emerald-700' : 'text-blue-700'}>
                {item.surveyed}/{item.total}
              </span>
              <span className="text-neutral-500 text-[10px] ml-1">({pct.toFixed(0)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * KpiSummaryReportModal Component
 */
export function KpiSummaryReportModal({
  isOpen = false,
  onClose,
  initialRound = 1,
  surveys = [],
  masterStations = [],
  stats = {},
}) {
  const { isDark } = useTheme();
  const [selectedRound, setSelectedRound] = useState(initialRound || 1);
  const [includeAppendix, setIncludeAppendix] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(null);
  const printAreaRef = useRef(null);

  // Sync initialRound on change
  useEffect(() => {
    if (initialRound) {
      setSelectedRound(initialRound);
    }
  }, [initialRound]);

  // Keep modal open state in body class for print rules
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('kpi-report-modal-open');
    } else {
      document.body.classList.remove('kpi-report-modal-open');
    }
    return () => {
      document.body.classList.remove('kpi-report-modal-open');
    };
  }, [isOpen]);

  // Filter active surveys by round
  const activeSurveys = useMemo(() => {
    if (selectedRound === 'all') return surveys || [];
    const rNum = Number(selectedRound);
    return (surveys || []).filter((s) => {
      const rn = Number(s.round_number || s.fields?.round_number || 1);
      return rn === rNum;
    });
  }, [surveys, selectedRound]);

  // Derive master stations map per province
  const masterByProvince = useMemo(() => {
    const map = new Map();
    PROVINCE_BASELINES.forEach((p) => {
      map.set(p.name, []);
    });

    if (Array.isArray(masterStations) && masterStations.length > 0) {
      masterStations.forEach((st) => {
        const prov = (st.province || '').trim();
        if (map.has(prov)) {
          map.get(prov).push(st);
        } else {
          map.set(prov, [st]);
        }
      });
    }

    return map;
  }, [masterStations]);

  // Calculate detailed provincial breakdown statistics
  const provincialStats = useMemo(() => {
    return PROVINCE_BASELINES.map((provBaseline, idx) => {
      const pName = provBaseline.name;
      const baselineTotal = masterByProvince.get(pName)?.length || provBaseline.total;

      const pSurveys = activeSurveys.filter((s) => {
        const p = (s.province || s.fields?.province || '').trim();
        return p === pName;
      });

      let allowed = 0;
      let denied = 0;
      pSurveys.forEach((s) => {
        const p = s.permit || s.fields?.permit;
        if (p === 'อนุญาต' || p === 'on' || p === 'true' || p === true) allowed++;
        else if (p === 'ไม่อนุญาต') denied++;
      });

      const surveyed = pSurveys.length;
      const pending = Math.max(baselineTotal - surveyed, 0);
      const progressPct = baselineTotal > 0 ? (surveyed / baselineTotal) * 100 : 0;

      return {
        rank: idx + 1,
        name: pName,
        total: baselineTotal,
        surveyed,
        allowed,
        denied,
        pending,
        progressPct,
        surveys: pSurveys,
        masterStations: masterByProvince.get(pName) || [],
      };
    });
  }, [activeSurveys, masterByProvince]);

  // Overall system KPI metrics
  const executiveMetrics = useMemo(() => {
    const totalBaseline = TOTAL_BASELINE_STATIONS;
    const surveyed = activeSurveys.length;
    const completionPct = totalBaseline > 0 ? (surveyed / totalBaseline) * 100 : 0;

    let allowed = 0;
    let denied = 0;
    activeSurveys.forEach((s) => {
      const p = s.permit || s.fields?.permit;
      if (p === 'อนุญาต' || p === 'on' || p === 'true' || p === true) allowed++;
      else if (p === 'ไม่อนุญาต') denied++;
    });

    const pending = Math.max(totalBaseline - surveyed, 0);
    const allowedRate = surveyed > 0 ? (allowed / surveyed) * 100 : 0;
    const allowedPctOfTotal = (allowed / totalBaseline) * 100;
    const deniedRate = surveyed > 0 ? (denied / surveyed) * 100 : 0;
    const pendingRate = (pending / totalBaseline) * 100;

    return {
      totalBaseline,
      surveyed,
      completionPct,
      allowed,
      allowedRate,
      allowedPctOfTotal,
      denied,
      deniedRate,
      pending,
      pendingRate,
    };
  }, [activeSurveys]);

  // Calculate total pages for page numbering
  // Page 1: Executive KPI & Visual Charts
  // Page 2: Provincial Breakdown Table & Executive Notes
  // Page 3+: Appendix pages (if includeAppendix is checked)
  const appendixPages = useMemo(() => {
    if (!includeAppendix) return [];

    const STATIONS_PER_APPENDIX_PAGE = 22;
    const pages = [];
    let currentStations = [];

    provincialStats.forEach((prov) => {
      // Find all completed survey records or baseline stations for this province
      const completedMap = new Map();
      prov.surveys.forEach((s) => {
        const sName = s.station || s.fields?.station || s.village || s.fields?.village;
        if (sName) completedMap.set(sName, s);
      });

      const list = prov.masterStations.length > 0
        ? prov.masterStations.map((mst) => {
            const survey = completedMap.get(mst.village) || completedMap.get(mst.station);
            return {
              province: prov.name,
              stationName: mst.village || mst.station,
              location: `ต.${(mst.subdistrict || '').replace(/^ต\./, '')} อ.${(mst.district || '').replace(/^อ\./, '')}`,
              installPlace: mst.installation_place || mst.equipment_place || '-',
              status: survey ? (survey.permit || survey.fields?.permit || 'อนุญาต') : 'รอดำเนินการ',
              visitDate: survey ? (survey.visitDate || survey.fields?.visitDate || survey.savedAt || '-') : '-',
              contact: mst.contact_name || survey?.contactName || survey?.fields?.contactName || '-',
            };
          })
        : prov.surveys.map((s, sIdx) => ({
            province: prov.name,
            stationName: s.station || s.fields?.station || `สถานีที่ ${sIdx + 1}`,
            location: `จ.${prov.name}`,
            installPlace: s.installationPlace || s.fields?.installationPlace || '-',
            status: s.permit || s.fields?.permit || 'อนุญาต',
            visitDate: s.visitDate || s.fields?.visitDate || '-',
            contact: s.contactName || s.fields?.contactName || '-',
          }));

      list.forEach((item) => {
        currentStations.push(item);
        if (currentStations.length === STATIONS_PER_APPENDIX_PAGE) {
          pages.push(currentStations);
          currentStations = [];
        }
      });
    });

    if (currentStations.length > 0) {
      pages.push(currentStations);
    }

    return pages;
  }, [includeAppendix, provincialStats]);

  const totalReportPages = 2 + appendixPages.length;

  const currentGenerationDate = useMemo(() => formatThaiDate(new Date()), []);
  const currentGenerationTime = useMemo(() => formatThaiTime(new Date()), []);

  // Print Document handler
  const handlePrint = () => {
    window.print();
  };

  // Client-Side Direct PDF Download using html2canvas-pro + jsPDF
  const handleDownloadPdfDirect = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfProgress({ current: 0, total: 0 });

    try {
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => {});
      }

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas-pro')).default;
      const reportArea = document.getElementById('printable-kpi-report-area');
      if (!reportArea) throw new Error('ไม่พบพื้นที่จัดทำรายงาน');

      const sheets = Array.from(reportArea.querySelectorAll('.a4-sheet'));
      if (sheets.length === 0) throw new Error('ไม่พบหน้ารายงาน A4');

      setPdfProgress({ current: 0, total: sheets.length });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      for (let i = 0; i < sheets.length; i++) {
        if (i > 0) pdf.addPage('a4', 'portrait');
        const sheet = sheets[i];

        const canvas = await html2canvas(sheet, {
          scale: 1.8, // High DPI for Thai fonts and crisp charts
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.90);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        // Free canvas memory immediately
        canvas.width = 0;
        canvas.height = 0;

        setPdfProgress({ current: i + 1, total: sheets.length });
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const roundSlug = selectedRound === 'all' ? 'AllRounds' : `Round_${selectedRound}`;
      const filename = `NBTC_PrePM_KPI_Summary_${roundSlug}_${dateSlug}.pdf`;

      pdf.save(filename);
      toast.success('ดาวน์โหลดรายงานสรุป KPI (PDF) สำเร็จแล้ว');
    } catch (err) {
      console.error('[KPI PDF Export Error]', err);
      toast.error(`สร้างไฟล์ PDF ไม่สำเร็จ: ${err?.message || 'unknown error'}\nสามารถใช้ปุ่ม "พิมพ์ / บันทึก PDF" แทนได้ครับ`);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="kpi-report-modal-portal"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block"
    >
      {/* Modal Container */}
      <div
        className={cn(
          'relative flex max-h-[96vh] w-full max-w-5xl flex-col rounded-2xl border shadow-2xl overflow-hidden my-auto transition-colors print:max-h-none print:w-full print:border-none print:shadow-none print:rounded-none print:bg-white print:static print:overflow-visible print:m-0 print:p-0',
          isDark ? 'border-cyan-500/30 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-800'
        )}
      >
        {/* Modal Action Header (Hidden in Print) */}
        <div
          className={cn(
            'flex flex-col md:flex-row md:items-center justify-between gap-3 border-b px-4 sm:px-6 py-3.5 no-print print:hidden transition-colors',
            isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-slate-50'
          )}
        >
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-sky-100 text-sky-700 border-sky-200'
              )}
            >
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn('text-sm sm:text-base font-bold leading-tight', isDark ? 'text-white' : 'text-slate-900')}>
                สรุปรายงาน KPI และสถิติผู้บริหาร (Executive PDF Export)
              </h3>
              <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                รายงานทางการมาตรฐาน A4 (TH Sarabun New) พร้อมกราฟสรุปสถิติและตารางจำแนก 10 จังหวัด
              </p>
            </div>
          </div>

          {/* Controls: Round Filter, Appendix Toggle & Export Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Round Select */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="kpi-modal-round-select" className="text-xs font-semibold whitespace-nowrap">
                รอบที่:
              </label>
              <select
                id="kpi-modal-round-select"
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer',
                  isDark
                    ? 'border-cyan-500/40 bg-slate-950 text-cyan-300 hover:border-cyan-400'
                    : 'border-sky-300 bg-white text-sky-800 hover:border-sky-400'
                )}
              >
                <option value="all">ทุกรอบการตรวจเยี่ยม (Consolidated 18 Rounds)</option>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>
                    รอบที่ {r} (ครั้งที่ {r})
                  </option>
                ))}
              </select>
            </div>

            {/* Include Appendix Toggle */}
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
              <input
                type="checkbox"
                checked={includeAppendix}
                onChange={(e) => setIncludeAppendix(e.target.checked)}
                className="rounded accent-sky-600 cursor-pointer"
              />
              <span>รวมภาคผนวกสถานี</span>
            </label>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdfDirect}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              title="ดาวน์โหลดไฟล์ PDF รายงานสรุป KPI โดยตรง"
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>
                {isGeneratingPdf
                  ? pdfProgress && pdfProgress.total > 0
                    ? `สร้าง PDF หน้า ${pdfProgress.current}/${pdfProgress.total}...`
                    : 'กำลังจัดทำ PDF...'
                  : 'ดาวน์โหลด PDF'}
              </span>
            </button>

            {/* Print / Save as PDF via Browser */}
            <button
              type="button"
              onClick={handlePrint}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs',
                isDark
                  ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-600/30 hover:border-cyan-400 hover:text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:border-slate-400'
              )}
              title="พิมพ์เอกสารออกเครื่องพิมพ์ หรือบันทึกเป็น PDF ทางการผ่านหน้าต่างพิมพ์ (Ctrl+P)"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">พิมพ์ / บันทึก PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer',
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
              title="ปิดหน้าต่าง"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Preview Container */}
        <div
          className={cn(
            'flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-5 md:p-6 flex flex-col items-center gap-6 transition-colors print:p-0 print:bg-white print:overflow-visible print:block',
            isDark ? 'bg-slate-950/70' : 'bg-slate-200/80'
          )}
        >
          <div
            id="printable-kpi-report-area"
            ref={printAreaRef}
            className="flex flex-col items-center gap-8 w-full print:block print:w-full print:m-0 print:p-0"
          >
            {/* ========================================================================= */}
            {/* PAGE 1: Executive KPI Summary & Visual Charts                             */}
            {/* ========================================================================= */}
            <div
              className="a4-sheet font-sarabun text-black bg-white shadow-2xl border border-slate-300 rounded-sm w-[210mm] min-h-[297mm] h-[297mm] mx-auto text-[13px] leading-tight relative box-border flex flex-col justify-between print:m-0 print:border-none print:shadow-none"
              style={{
                fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'Noto Sans Thai', sans-serif",
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: '9mm 12mm 9mm 12mm',
              }}
            >
              <div>
                {/* 1. Official Header */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-2">
                  {/* Left Logo: NBTC */}
                  <div className="w-20 shrink-0 flex items-center justify-start">
                    <img
                      src={nbtcLogo}
                      alt="NBTC Logo"
                      style={{ height: '62px', width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Header Titles */}
                  <div className="flex-1 text-center px-2">
                    <h1 className="text-[17px] font-bold tracking-tight text-black leading-tight">
                      รายงานสรุปผลการตรวจเยี่ยมสถานีวิทยุคมนาคม (Pre-PM) และตัวชี้วัด KPI
                    </h1>
                    <p className="text-[13px] font-semibold text-neutral-800 leading-snug">
                      โครงการเพิ่มประสิทธิภาพระบบโครงข่ายสื่อสารด้วยอุปกรณ์ทวนสัญญาณผ่านคลื่นความถี่สูง (SHF)
                    </p>
                    <p className="text-[12px] font-medium text-neutral-700 leading-normal">
                      สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ (สำนักงาน กสทช.)
                    </p>
                  </div>

                  {/* Right Logo: FORTH */}
                  <div className="w-20 shrink-0 flex items-center justify-end">
                    <img
                      src={forthLogo}
                      alt="FORTH Logo"
                      style={{ height: '28px', width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Sub-bar: Round Context & Timestamp */}
                <div className="flex justify-between items-center text-[11.5px] pb-1.5 mb-2.5 border-b border-black text-black font-medium">
                  <div>
                    <span className="font-bold">บริบทการตรวจเยี่ยม:</span>{' '}
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedRound === 'all'
                        ? 'ภาพรวมทุกรอบการตรวจเยี่ยม (Consolidated All 18 Rounds)'
                        : `รอบการตรวจเยี่ยม ครั้งที่ ${selectedRound} (Inspection Round ${selectedRound})`}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">ข้อมูล ณ วันที่:</span> {currentGenerationDate} เวลา {currentGenerationTime}
                  </div>
                </div>

                {/* 2. Executive KPI Summary Cards (5 Metrics against 197 Baseline) */}
                <div className="mb-3">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13px] text-black flex items-center justify-between">
                    <span>1. สรุปตัวชี้วัดหลักและผลการดำเนินงาน (Executive KPI Summary — Baseline 197 สถานี)</span>
                    <span className="text-[11px] font-semibold text-neutral-600">เป้าหมายมาตรฐาน 100%</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                    {/* Card 1: Total Stations */}
                    <div className="border border-neutral-300 rounded p-2 bg-neutral-50/90 text-center flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-neutral-600">สถานีทั้งหมดในระบบ</span>
                      <div className="my-1">
                        <span className="text-[22px] font-extrabold text-neutral-900 leading-none">
                          {executiveMetrics.totalBaseline}
                        </span>
                        <span className="text-[10px] text-neutral-600 ml-0.5">สถานี</span>
                      </div>
                      <span className="text-[9.5px] text-neutral-500">10 จังหวัดทั่วประเทศ</span>
                    </div>

                    {/* Card 2: Total Surveyed & % */}
                    <div className="border border-blue-300 rounded p-2 bg-blue-50/80 text-center flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-blue-950">สำรวจแล้วเสร็จ</span>
                      <div className="my-1">
                        <span className="text-[22px] font-extrabold text-blue-800 leading-none">
                          {executiveMetrics.surveyed}
                        </span>
                        <span className="text-[10px] text-blue-950 ml-0.5">/ {executiveMetrics.totalBaseline}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700">
                        {executiveMetrics.completionPct.toFixed(1)}% ความคืบหน้า
                      </span>
                    </div>

                    {/* Card 3: Permitted Access */}
                    <div className="border border-emerald-300 rounded p-2 bg-emerald-50/80 text-center flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-emerald-950">อนุญาตเข้าพื้นที่</span>
                      <div className="my-1">
                        <span className="text-[22px] font-extrabold text-emerald-700 leading-none">
                          {executiveMetrics.allowed}
                        </span>
                        <span className="text-[10px] text-emerald-950 ml-0.5">สถานี</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {executiveMetrics.allowedRate.toFixed(1)}% ของที่ตรวจ
                      </span>
                    </div>

                    {/* Card 4: Rejected Access */}
                    <div className="border border-rose-300 rounded p-2 bg-rose-50/80 text-center flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-rose-950">ไม่อนุญาตเข้าพื้นที่</span>
                      <div className="my-1">
                        <span className="text-[22px] font-extrabold text-rose-700 leading-none">
                          {executiveMetrics.denied}
                        </span>
                        <span className="text-[10px] text-rose-950 ml-0.5">สถานี</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700">
                        {executiveMetrics.deniedRate.toFixed(1)}% ของที่ตรวจ
                      </span>
                    </div>

                    {/* Card 5: Pending / Unvisited */}
                    <div className="border border-amber-300 rounded p-2 bg-amber-50/80 text-center flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-amber-950">รอดำเนินการ / ยังไม่ตรวจ</span>
                      <div className="my-1">
                        <span className="text-[22px] font-extrabold text-amber-700 leading-none">
                          {executiveMetrics.pending}
                        </span>
                        <span className="text-[10px] text-amber-950 ml-0.5">สถานี</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">
                        {executiveMetrics.pendingRate.toFixed(1)}% คงค้าง
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Visual KPI Charts Section */}
                <div className="mb-3">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13px] text-black">
                    2. กราฟวิเคราะห์สถิติผลการดำเนินงาน (Visual KPI Analytics)
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    {/* Left: Donut Chart */}
                    <div className="border border-neutral-300 rounded p-2">
                      <h4 className="text-[12px] font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        สัดส่วนผลการสำรวจและการขออนุญาตเข้าพื้นที่
                      </h4>
                      <HighResDonutChart
                        allowed={executiveMetrics.allowed}
                        denied={executiveMetrics.denied}
                        pending={executiveMetrics.pending}
                        total={executiveMetrics.totalBaseline}
                      />
                    </div>

                    {/* Right: Horizontal Bar Chart */}
                    <div className="border border-neutral-300 rounded p-2">
                      <h4 className="text-[12px] font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block" />
                        ความคืบหน้าการสำรวจเปรียบเทียบ 10 จังหวัด (Baseline)
                      </h4>
                      <HighResProvincialBarChart provinceData={provincialStats} />
                    </div>
                  </div>
                </div>

                {/* 4. Executive Summary Highlights */}
                <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/50 mb-2">
                  <h4 className="text-[12.5px] font-bold text-neutral-900 mb-1">
                    บทวิเคราะห์สรุปสำหรับผู้บริหาร (Executive Insights & Observations):
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11.5px] text-neutral-800">
                    <li>
                      <strong>สถานะความคืบหน้าภาพรวม:</strong> ดำเนินการตรวจเยี่ยมแล้วเสร็จ{' '}
                      <span className="font-bold text-blue-800">{executiveMetrics.surveyed} สถานี</span> จากเป้าหมายทั้งหมด{' '}
                      <strong>{executiveMetrics.totalBaseline} สถานี</strong> คิดเป็นความคืบหน้า{' '}
                      <span className="font-bold text-blue-800">{executiveMetrics.completionPct.toFixed(1)}%</span>
                    </li>
                    <li>
                      <strong>ความร่วมมือของเจ้าของพื้นที่:</strong> ได้รับความยินยอมให้เข้าปฏิบัติงาน{' '}
                      <span className="font-bold text-emerald-800">{executiveMetrics.allowed} สถานี</span> (คิดเป็น{' '}
                      <strong>{executiveMetrics.allowedRate.toFixed(1)}%</strong> ของสถานีที่ลงตรวจ) โดยมีสถานีที่ไม่อนุญาต{' '}
                      <span className="font-bold text-rose-800">{executiveMetrics.denied} สถานี</span>
                    </li>
                    <li>
                      <strong>การกระจายตัวระดับจังหวัด:</strong> จังหวัดที่มีจำนวนสถานีสูงสุดคือ{' '}
                      <strong>กาญจนบุรี (32 สถานี)</strong>, <strong>ขอนแก่น (29 สถานี)</strong>, และ{' '}
                      <strong>นครราชสีมา (26 สถานี)</strong>
                    </li>
                    {executiveMetrics.pending > 0 && (
                      <li>
                        <strong>แผนงานเร่งรัด:</strong> มีสถานีที่รอเข้าสำรวจเพิ่มเติมอีก{' '}
                        <span className="font-bold text-amber-800">{executiveMetrics.pending} สถานี</span> อยู่ระหว่างประสานงานเจ้าหน้าที่ภาคสนาม
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div className="pt-1.5 border-t border-black text-[10.5px] flex justify-between items-center text-neutral-600">
                <span>
                  ศูนย์ควบคุมผลการตรวจเยี่ยมเจ้าของพื้นที่ Pre-PM Control Room (v{APP_VERSION}) | สำนักงาน กสทช.
                </span>
                <span className="font-bold text-black">
                  หน้าที่ 1 จาก {totalReportPages}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PAGE 2: Provincial Breakdown Table & Sign-Off                             */}
            {/* ========================================================================= */}
            <div
              className="a4-sheet font-sarabun text-black bg-white shadow-2xl border border-slate-300 rounded-sm w-[210mm] min-h-[297mm] h-[297mm] mx-auto text-[13px] leading-tight relative box-border flex flex-col justify-between print:m-0 print:border-none print:shadow-none"
              style={{
                fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'Noto Sans Thai', sans-serif",
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: '9mm 12mm 9mm 12mm',
              }}
            >
              <div>
                {/* Mini Header */}
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-black mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={nbtcLogo}
                      alt="NBTC"
                      style={{ height: '36px', width: 'auto' }}
                      className="object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <h2 className="text-[14px] font-bold text-black">
                        ตารางสรุปผลการดำเนินงานจำแนกรายจังหวัด (Provincial Breakdown Table)
                      </h2>
                      <p className="text-[11px] text-neutral-700">
                        {selectedRound === 'all'
                          ? 'ข้อมูลสรุปรวมทุกรอบการตรวจเยี่ยม (Consolidated 18 Rounds)'
                          : `รอบการตรวจเยี่ยม ครั้งที่ ${selectedRound} (Baseline 197 สถานี)`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10.5px] text-neutral-600">
                    <div>ข้อมูล ณ วันที่: {currentGenerationDate}</div>
                    <div>เวลา {currentGenerationTime}</div>
                  </div>
                </div>

                {/* Section Title */}
                <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13px] text-black mb-1.5">
                  3. ข้อมูลสรุปผลการดำเนินงานรายจังหวัด (เรียงตามจำนวนสถานีเป้าหมาย)
                </div>

                {/* Provincial Breakdown Table */}
                <table className="w-full border-collapse border border-black text-[12px] leading-snug mb-3">
                  <thead>
                    <tr className="bg-neutral-200/90 text-black font-bold border-b border-black text-center">
                      <th className="border border-black py-1 px-1.5 w-10">ลำดับ</th>
                      <th className="border border-black py-1 px-2 text-left">จังหวัด</th>
                      <th className="border border-black py-1 px-1.5 w-20">จำนวนสถานี (Baseline)</th>
                      <th className="border border-black py-1 px-1.5 w-18">สำรวจแล้ว (แห่ง)</th>
                      <th className="border border-black py-1 px-1.5 w-18 bg-emerald-100/70 text-emerald-950">อนุญาต</th>
                      <th className="border border-black py-1 px-1.5 w-18 bg-rose-100/70 text-rose-950">ไม่อนุญาต</th>
                      <th className="border border-black py-1 px-1.5 w-18 bg-amber-100/70 text-amber-950">รอดำเนินการ</th>
                      <th className="border border-black py-1 px-2 w-32">ความคืบหน้า KPI (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provincialStats.map((p, idx) => {
                      const isComplete = p.progressPct >= 100;

                      return (
                        <tr
                          key={p.name}
                          className={cn(
                            'border-b border-neutral-300 text-center',
                            idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/70'
                          )}
                        >
                          <td className="border border-black py-1 px-1 font-semibold">{p.rank}</td>
                          <td className="border border-black py-1 px-2 text-left font-bold text-neutral-900">
                            {p.name}
                          </td>
                          <td className="border border-black py-1 px-1.5 font-bold">{p.total}</td>
                          <td className="border border-black py-1 px-1.5 font-bold text-blue-900">{p.surveyed}</td>
                          <td className="border border-black py-1 px-1.5 font-bold text-emerald-700 bg-emerald-50/40">{p.allowed}</td>
                          <td className="border border-black py-1 px-1.5 font-bold text-rose-700 bg-rose-50/40">{p.denied}</td>
                          <td className="border border-black py-1 px-1.5 font-bold text-amber-800 bg-amber-50/40">{p.pending}</td>
                          <td className="border border-black py-1 px-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-2.5 bg-neutral-200 rounded-xs overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-xs',
                                    isComplete ? 'bg-emerald-600' : 'bg-blue-600'
                                  )}
                                  style={{ width: `${Math.min(p.progressPct, 100)}%` }}
                                />
                              </div>
                              <span className="w-10 text-right font-extrabold text-[11px]">
                                {p.progressPct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-neutral-200 font-extrabold text-black border-t-2 border-black text-center">
                      <td className="border border-black py-1.5 px-2" colSpan={2}>
                        รวมทั้งสิ้น (Total — 10 จังหวัด)
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-blue-950">
                        {executiveMetrics.totalBaseline}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-blue-900">
                        {executiveMetrics.surveyed}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-emerald-800 bg-emerald-100">
                        {executiveMetrics.allowed}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-rose-800 bg-rose-100">
                        {executiveMetrics.denied}
                      </td>
                      <td className="border border-black py-1.5 px-1.5 text-amber-800 bg-amber-100">
                        {executiveMetrics.pending}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-center text-blue-950">
                        {executiveMetrics.completionPct.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Operational Notes Section */}
                <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50 mb-4 text-[11.5px] leading-relaxed">
                  <h4 className="font-bold text-neutral-900 mb-1">
                    หมายเหตุและแนวทางการปฏิบัติงาน (Operational Notes & Guidelines):
                  </h4>
                  <p className="text-neutral-700">
                    1. <strong>เกณฑ์การวัดผลสำเร็จ (KPI):</strong> ถือว่ารอบการตรวจเยี่ยมสำเร็จสมบูรณ์เมื่อจำนวนสถานีที่สำรวจแล้วเสร็จครบ 100% (197 สถานี)
                  </p>
                  <p className="text-neutral-700 mt-0.5">
                    2. <strong>กรณีไม่อนุญาตเข้าพื้นที่:</strong> บันทึกรายละเอียดเหตุผลและข้อขัดข้องลงในระบบ เพื่อให้คณะทำงานและผู้ควบคุมงานร่วมพิจารณาแนวทางแก้ไขกับเจ้าของพื้นที่ต่อไป
                  </p>
                  <p className="text-neutral-700 mt-0.5">
                    3. <strong>การควบคุมสิทธิ์รอบการสำรวจ:</strong> เมื่อรอบการตรวจเยี่ยมได้รับการตรวจสอบและลงตรวจครบ 197 สถานีแล้ว ผู้ดูแลระบบสามารถสั่งปิดรอบ (Lock Round) เพื่อล็อกข้อมูลเป็น Read-Only ตามระเบียบข้อบังคับ
                  </p>
                </div>

                {/* Executive Sign-off Section */}
                <div className="mt-4 pt-2 border-t border-neutral-300">
                  <div className="grid grid-cols-3 gap-6 text-center text-[12px]">
                    {/* Sign-off 1 */}
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-neutral-700 mb-9">ผู้จัดทำและรวบรวมรายงาน</p>
                      <div className="w-40 border-b border-black mb-1" />
                      <p className="font-bold text-black">(......................................................)</p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">เจ้าหน้าที่ระบบศูนย์ควบคุม Pre-PM</p>
                      <p className="text-[10.5px] text-neutral-500">วันที่ ......../......../................</p>
                    </div>

                    {/* Sign-off 2 */}
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-neutral-700 mb-9">ผู้ตรวจสอบความถูกต้อง</p>
                      <div className="w-40 border-b border-black mb-1" />
                      <p className="font-bold text-black">(......................................................)</p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">วิศวกรผู้ควบคุมงานโครงการ</p>
                      <p className="text-[10.5px] text-neutral-500">วันที่ ......../......../................</p>
                    </div>

                    {/* Sign-off 3 */}
                    <div className="flex flex-col items-center">
                      <p className="font-semibold text-neutral-700 mb-9">ผู้อนุมัติรายงาน</p>
                      <div className="w-40 border-b border-black mb-1" />
                      <p className="font-bold text-black">(......................................................)</p>
                      <p className="text-[11px] text-neutral-600 mt-0.5">ผู้อำนวยการส่วนงาน / ผู้จัดการโครงการ</p>
                      <p className="text-[10.5px] text-neutral-500">วันที่ ......../......../................</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 2 Footer */}
              <div className="pt-1.5 border-t border-black text-[10.5px] flex justify-between items-center text-neutral-600">
                <span>
                  ตารางสรุปผลดำเนินงานจำแนกรายจังหวัด Pre-PM | สัญญาเลขที่ 8680228
                </span>
                <span className="font-bold text-black">
                  หน้าที่ 2 จาก {totalReportPages}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PAGE 3+: Detailed Station Appendix (Grouped by Province)                  */}
            {/* ========================================================================= */}
            {includeAppendix &&
              appendixPages.map((stationsOnPage, pageIdx) => {
                const pageNumber = 3 + pageIdx;

                return (
                  <div
                    key={`appendix-page-${pageIdx}`}
                    className="a4-sheet font-sarabun text-black bg-white shadow-2xl border border-slate-300 rounded-sm w-[210mm] min-h-[297mm] h-[297mm] mx-auto text-[13px] leading-tight relative box-border flex flex-col justify-between print:m-0 print:border-none print:shadow-none"
                    style={{
                      fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'Noto Sans Thai', sans-serif",
                      color: '#000000',
                      backgroundColor: '#ffffff',
                      padding: '9mm 12mm 9mm 12mm',
                    }}
                  >
                    <div>
                      {/* Mini Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b-2 border-black mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={nbtcLogo}
                            alt="NBTC"
                            style={{ height: '32px', width: 'auto' }}
                            className="object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div>
                            <h2 className="text-[13.5px] font-bold text-black">
                              ภาคผนวก: บัญชีรายชื่อสถานีและการลงพื้นที่ตรวจเยี่ยม (Detailed Station Appendix)
                            </h2>
                            <p className="text-[11px] text-neutral-700">
                              {selectedRound === 'all'
                                ? 'รายการสถานีจากทุกรอบการตรวจเยี่ยม'
                                : `รอบการตรวจเยี่ยม ครั้งที่ ${selectedRound} (หน้า ${pageIdx + 1}/${appendixPages.length})`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-neutral-500">
                          ข้อมูล ณ วันที่ {currentGenerationDate}
                        </div>
                      </div>

                      {/* Station List Table */}
                      <table className="w-full border-collapse border border-black text-[11px] leading-tight mb-2">
                        <thead>
                          <tr className="bg-neutral-200 text-black font-bold border-b border-black text-center">
                            <th className="border border-black py-1 px-1 w-9">ลำดับ</th>
                            <th className="border border-black py-1 px-1.5 w-20">จังหวัด</th>
                            <th className="border border-black py-1 px-2 text-left">ชื่อสถานี / หมู่บ้าน</th>
                            <th className="border border-black py-1 px-2 text-left">ที่ตั้ง (ตำบล, อำเภอ)</th>
                            <th className="border border-black py-1 px-2 text-left">สถานที่ติดตั้ง</th>
                            <th className="border border-black py-1 px-1.5 w-20">วันที่ตรวจ</th>
                            <th className="border border-black py-1 px-1.5 w-18">ผลขออนุญาต</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stationsOnPage.map((st, sIdx) => {
                            const isAllowed = st.status === 'อนุญาต' || st.status === 'on' || st.status === 'true' || st.status === true;
                            const isDenied = st.status === 'ไม่อนุญาต';
                            const isPending = !isAllowed && !isDenied;

                            const globalIdx = pageIdx * 22 + sIdx + 1;

                            return (
                              <tr
                                key={`${st.province}-${st.stationName}-${sIdx}`}
                                className={cn(
                                  'border-b border-neutral-300 text-center',
                                  sIdx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                                )}
                              >
                                <td className="border border-black py-1 px-1 font-semibold">{globalIdx}</td>
                                <td className="border border-black py-1 px-1.5 font-bold text-neutral-800">{st.province}</td>
                                <td className="border border-black py-1 px-2 text-left font-bold text-neutral-900 truncate max-w-[150px]">
                                  {st.stationName}
                                </td>
                                <td className="border border-black py-1 px-2 text-left text-neutral-700 truncate max-w-[120px]">
                                  {st.location}
                                </td>
                                <td className="border border-black py-1 px-2 text-left text-neutral-600 truncate max-w-[120px]">
                                  {st.installPlace}
                                </td>
                                <td className="border border-black py-1 px-1 text-neutral-700 text-[10px]">
                                  {st.visitDate}
                                </td>
                                <td className="border border-black py-1 px-1 font-bold">
                                  {isAllowed && (
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                      อนุญาต
                                    </span>
                                  )}
                                  {isDenied && (
                                    <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                                      ไม่อนุญาต
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">
                                      รอดำเนินการ
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Appendix Footer */}
                    <div className="pt-1.5 border-t border-black text-[10.5px] flex justify-between items-center text-neutral-600">
                      <span>
                        ภาคผนวกรายละเอียดสถานีรายจังหวัด Pre-PM | สัญญาเลขที่ 8680228
                      </span>
                      <span className="font-bold text-black">
                        หน้าที่ {pageNumber} จาก {totalReportPages}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default KpiSummaryReportModal;

