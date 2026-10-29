import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Search, Filter, ArrowRight, Radio, MapPin, Phone, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { STATION_ALIASES } from '@/lib/api';

function normalizeStationKey(name) {
  const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
  let s = String(name || '').trim();
  for (let i = 0; i < THAI_DIGITS.length; i++) {
    s = s.replaceAll(THAI_DIGITS[i], String(i));
  }
  return s.split(/\s+/).join(' ');
}

export function PendingStationsChecklist({
  selectedRound = 1,
  masterStations = [],
  completedSurveys = [],
  onNavigate,
}) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Set of stations already completed in this round
  const completedStationSet = useMemo(() => {
    const set = new Set();
    for (const sv of completedSurveys) {
      const v = sv.station?.trim() || sv.fields?.station?.trim() || '';
      if (v) {
        set.add(v);
        set.add(normalizeStationKey(v));
        const alias = STATION_ALIASES[v];
        if (alias) {
          set.add(alias);
          set.add(normalizeStationKey(alias));
        }
      }
      const sid = sv.siteId?.trim() || sv.fields?.siteId?.trim() || '';
      if (sid) {
        set.add(sid.toUpperCase());
        set.add(sid.toLowerCase());
      }
    }
    return set;
  }, [completedSurveys]);

  // Identify all missing/pending stations for this round
  const missingStations = useMemo(() => {
    return masterStations.filter((st) => {
      const v = st.village?.trim() || '';
      const norm = normalizeStationKey(v);
      const siteId = `SITE-${String(st.id).padStart(3, '0')}`;
      const alias = STATION_ALIASES[v] || '';

      const isCompleted =
        completedStationSet.has(v) ||
        completedStationSet.has(norm) ||
        completedStationSet.has(siteId) ||
        completedStationSet.has(siteId.toLowerCase()) ||
        (alias && (completedStationSet.has(alias) || completedStationSet.has(normalizeStationKey(alias))));

      return !isCompleted;
    });
  }, [masterStations, completedStationSet]);

  // Unique provinces among missing stations for filter
  const provinces = useMemo(() => {
    const pSet = new Set(missingStations.map((s) => s.province).filter(Boolean));
    return Array.from(pSet).sort();
  }, [missingStations]);

  // Filter missing stations by search and province
  const filteredStations = useMemo(() => {
    return missingStations.filter((st) => {
      if (selectedProvince !== 'all' && st.province !== selectedProvince) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const siteIdStr = `site-${String(st.id).padStart(3, '0')}`.toLowerCase();
        const v = (st.village || '').toLowerCase();
        const p = (st.province || '').toLowerCase();
        const d = (st.district || '').toLowerCase();
        const sd = (st.subdistrict || '').toLowerCase();
        const c = (st.contact_name || st.contactName || '').toLowerCase();
        return (
          siteIdStr.includes(q) ||
          v.includes(q) ||
          p.includes(q) ||
          d.includes(q) ||
          sd.includes(q) ||
          c.includes(q)
        );
      }
      return true;
    });
  }, [missingStations, selectedProvince, searchQuery]);

  const totalPages = Math.ceil(filteredStations.length / pageSize) || 1;
  const paginatedStations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStations.slice(start, start + pageSize);
  }, [filteredStations, currentPage, pageSize]);

  // Handle click on "บันทึกผลรอบนี้"
  const handleStartSurvey = (st) => {
    if (onNavigate) {
      const siteId = `SITE-${String(st.id).padStart(3, '0')}`;
      const stationName = st.village || '';
      // Route with query parameters for automatic pre-fill in FieldVisitView
      onNavigate(`/field?siteId=${encodeURIComponent(siteId)}&station=${encodeURIComponent(stationName)}&round=${selectedRound}`, {
        siteId,
        station: stationName,
        round: selectedRound,
      });
    }
  };

  // If this round is 100% complete
  if (missingStations.length === 0 && masterStations.length > 0) {
    return (
      <GlassCard hoverEffect={false} className="p-6 border-emerald-500/30 bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-300">
              รอบที่ {selectedRound}: การตรวจเยี่ยมเสร็จสมบูรณ์ครบถ้วน 100%
            </h3>
            <p className="text-xs text-emerald-400/80">
              สถานีวิทยุคมนาคมทั้งหมด 197 สถานีได้รับการลงพื้นที่และบันทึกผลการสำรวจในรอบที่ {selectedRound} เรียบร้อยแล้ว ไม่มีสถานีค้างดำเนินการ
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard hoverEffect={false} className="p-5 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
            )}
          >
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className={cn('text-base sm:text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              สถานีที่ยังไม่ได้ลงพื้นที่ในรอบที่ {selectedRound} (Missing / Pending Stations)
            </h3>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              ขาดอีก {missingStations.length} สถานี จากทั้งหมด {masterStations.length || 197} สถานี baseline
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 opacity-50" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานี, อำเภอ, จังหวัด..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                'pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-60',
                isDark
                  ? 'border-slate-800 bg-slate-900/60 text-white placeholder-slate-500'
                  : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400'
              )}
            />
          </div>

          {/* Province Filter */}
          <select
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setCurrentPage(1);
            }}
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none cursor-pointer',
              isDark
                ? 'border-slate-800 bg-slate-900/60 text-white'
                : 'border-slate-200 bg-white text-slate-800'
            )}
          >
            <option value="all">ทุกจังหวัด ({provinces.length} จว.)</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Missing Stations Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead
            className={cn(
              'border-b text-[11px] font-bold uppercase tracking-wider',
              isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-slate-100/80 text-slate-600'
            )}
          >
            <tr>
              <th className="py-2.5 px-3 text-center w-14">ลำดับ</th>
              <th className="py-2.5 px-3 w-28">Site ID</th>
              <th className="py-2.5 px-4 min-w-[200px]">ชื่อสถานี / ที่ตั้ง</th>
              <th className="py-2.5 px-3 w-36">จังหวัด / อำเภอ</th>
              <th className="py-2.5 px-3 min-w-[170px]">ผู้ติดต่อในพื้นที่</th>
              <th className="py-2.5 px-3 text-center w-36">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className={cn('divide-y', isDark ? 'divide-slate-800/60' : 'divide-slate-200')}>
            {paginatedStations.length > 0 ? (
              paginatedStations.map((st, idx) => {
                const siteId = `SITE-${String(st.id).padStart(3, '0')}`;
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const contactName = st.contact_name || st.contactName || '-';
                const contactPhone = st.contact_phone || st.contactPhone || '';

                return (
                  <tr
                    key={st.id || idx}
                    className={cn(
                      'transition-colors',
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-amber-50/40'
                    )}
                  >
                    <td className="py-2.5 px-3 text-center font-mono opacity-50">{rowNum}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 dark:text-cyan-300">
                      {siteId}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold">{st.village}</div>
                      <div className="text-[11px] opacity-60">
                        {st.installation_place || st.installationPlace || 'ไม่ระบุสถานที่ติดตั้ง'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{st.province || '-'}</div>
                      <div className="text-[11px] opacity-60">อ.{st.district || '-'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{contactName}</div>
                      {contactPhone && (
                        <div className="text-[11px] opacity-60 font-mono">{contactPhone}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleStartSurvey(st)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs',
                          isDark
                            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        )}
                        title={`ลงพื้นที่บันทึกผลรอบที่ ${selectedRound} สำหรับสถานี ${st.village}`}
                      >
                        <span>บันทึกผลรอบที่ {selectedRound}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  ไม่พบสถานีค้างดำเนินการที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="opacity-60">
            แสดงหน้า {currentPage} จาก {totalPages} ({filteredStations.length} สถานี)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 cursor-pointer"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 cursor-pointer"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default PendingStationsChecklist;

