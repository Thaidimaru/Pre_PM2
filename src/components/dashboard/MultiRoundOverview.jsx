import React, { useMemo } from 'react';
import { Layers, CheckCircle2, Clock, AlertCircle, ChevronRight, BarChart3, Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { isRoundClosed } from '@/lib/api';

export function MultiRoundOverview({
  surveys = [],
  totalStations = 197,
  selectedRound = 1,
  onSelectRound,
}) {
  const { isDark } = useTheme();

  // Compute statistics for all 18 rounds (Rounds 1 - 18)
  const roundMetrics = useMemo(() => {
    return Array.from({ length: 18 }, (_, idx) => {
      const roundNum = idx + 1;
      const inRound = surveys.filter((s) => {
        const rn = Number(s.round_number || s.fields?.round_number || 1);
        return rn === roundNum;
      });

      const completed = inRound.length;
      const allowed = inRound.filter(
        (s) => s.permit === 'อนุญาต' || s.fields?.permit === 'อนุญาต' || s.permit === 'on'
      ).length;
      const denied = inRound.filter(
        (s) => s.permit === 'ไม่อนุญาต' || s.fields?.permit === 'ไม่อนุญาต'
      ).length;
      const missing = Math.max(totalStations - completed, 0);
      const percentage = totalStations > 0 ? (completed / totalStations) * 100 : 0;
      const isComplete = completed >= totalStations && totalStations > 0;
      const isLocked = isRoundClosed(roundNum);

      return {
        roundNum,
        completed,
        allowed,
        denied,
        missing,
        percentage,
        isComplete,
        isLocked,
      };
    });
  }, [surveys, totalStations]);

  // Aggregate overall status
  const completedRoundsCount = roundMetrics.filter((r) => r.isComplete).length;
  const inProgressRoundsCount = roundMetrics.filter((r) => !r.isComplete && r.completed > 0).length;

  return (
    <GlassCard hoverEffect={false} className="p-5 space-y-4">
      {/* Header with Title and Quick Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-sky-100 text-sky-600'
            )}
          >
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h2 className={cn('text-base sm:text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              ภาพรวมความคืบหน้าการตรวจเยี่ยม 18 รอบ (Inspection Rounds 1–18 Matrix)
            </h2>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              เปรียบเทียบความคืบหน้าการลงพื้นที่แยกตามรอบกับฐานข้อมูล 197 สถานี · ครบแล้ว {completedRoundsCount} รอบ, กำลังดำเนินการ {inProgressRoundsCount} รอบ
            </p>
          </div>
        </div>

        {/* Global / All Rounds Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectRound && onSelectRound('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5',
              selectedRound === 'all'
                ? isDark
                  ? 'bg-blue-600/30 border-blue-500/60 text-white shadow-xs'
                  : 'bg-sky-100 border-sky-400 text-sky-800 font-bold shadow-xs'
                : isDark
                ? 'border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>แสดงทุกรอบรวมกัน</span>
          </button>
        </div>
      </div>

      {/* 18-Round Progress Grid Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {roundMetrics.map((rm) => {
          const isSelected = selectedRound === rm.roundNum;
          return (
            <button
              key={rm.roundNum}
              type="button"
              onClick={() => onSelectRound && onSelectRound(rm.roundNum)}
              className={cn(
                'flex flex-col justify-between p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group',
                isSelected
                  ? isDark
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/30'
                    : 'border-sky-500 bg-sky-50/80 shadow-[0_0_15px_rgba(14,165,233,0.2)] ring-2 ring-sky-500/30'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50'
                  : 'border-slate-200/90 bg-white hover:border-sky-300 hover:bg-sky-50/40 shadow-2xs'
              )}
            >
              {/* Card Top: Round Name & Status Indicator */}
              <div className="flex items-center justify-between gap-1 w-full pb-1">
                <span className="text-xs font-bold font-mono">
                  รอบ {rm.roundNum}
                </span>
                {rm.isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-rose-400 shrink-0" title="ปิดรอบแล้ว (Read-Only)" />
                ) : rm.isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : rm.completed > 0 ? (
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-500/50" />
                )}
              </div>

              {/* Card Middle: Completion Numbers */}
              <div className="my-1.5">
                <div className="text-base font-extrabold tracking-tight">
                  <span className={cn(
                    rm.isComplete
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : rm.completed > 0
                      ? isDark ? 'text-amber-300' : 'text-amber-600'
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                  )}>
                    {rm.completed}
                  </span>
                  <span className="text-xs font-normal opacity-50">/{totalStations}</span>
                </div>
                <div className="text-[10px] font-medium opacity-70">
                  {rm.isLocked ? (
                    <span className="text-rose-400 font-semibold">ปิดรอบแล้ว (Read-Only)</span>
                  ) : rm.isComplete ? (
                    'ครบ 100%'
                  ) : rm.completed > 0 ? (
                    `ขาด ${rm.missing} สถานี`
                  ) : (
                    'ยังไม่เริ่ม'
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    rm.isLocked
                      ? 'bg-rose-500'
                      : rm.isComplete
                      ? 'bg-emerald-500'
                      : rm.completed > 0
                      ? 'bg-amber-500'
                      : 'bg-transparent'
                  )}
                  style={{ width: `${Math.min(rm.percentage, 100)}%` }}
                />
              </div>

              {/* Selected Highlight Tab Indicator */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default MultiRoundOverview;

