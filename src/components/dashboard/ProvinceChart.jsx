import React from 'react';
import { MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function ProvinceChart({ provinces = [] }) {
  const { isDark } = useTheme();
  const displayProvinces = provinces.slice(0, 10);
  const maxProvinceCount = Math.max(...displayProvinces.map((p) => p.count), 1);

  return (
    <GlassCard className="flex flex-col h-full" hoverEffect={false}>
      {/* Panel Title */}
      <div className={cn('flex items-center gap-2 pb-4 border-b', isDark ? 'border-slate-800/80' : 'border-slate-200')}>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            isDark ? 'bg-blue-500/20 text-cyan-300' : 'bg-sky-100 text-sky-600'
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>
        <h2 className={cn('text-lg font-bold tracking-normal leading-normal', isDark ? 'text-white' : 'text-slate-900')}>
          สรุปผลการสำรวจรายจังหวัด (10 อันดับแรก)
        </h2>
      </div>

      {/* Province Breakdown List */}
      <div className="pt-5 flex-1 flex flex-col justify-between">
        <div
          className={cn(
            'overflow-hidden rounded-xl border transition-colors',
            isDark ? 'border-slate-800/80 bg-slate-950/30' : 'border-slate-200 bg-white'
          )}
        >
            <div
              className={cn(
                'grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-semibold border-b',
                isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800/80' : 'bg-slate-50 text-slate-600 border-slate-200'
              )}
            >
              <span className="col-span-1">ลำดับที่</span>
              <span className="col-span-4">จังหวัด</span>
              <span className="col-span-5">สัดส่วน</span>
              <span className="col-span-2 text-right">รวม</span>
            </div>
            <div className={cn('divide-y', isDark ? 'divide-slate-800/40' : 'divide-slate-100')}>
              {displayProvinces.length > 0 ? (
                displayProvinces.map((prov, i) => {
                  const pct = Math.max(10, Math.min(100, (prov.count / maxProvinceCount) * 100));
                  return (
                    <div
                      key={prov.name}
                      className={cn(
                        'grid grid-cols-12 gap-2 items-center px-4 py-2 text-sm transition-colors',
                        isDark ? 'hover:bg-slate-800/30' : 'hover:bg-sky-50/50'
                      )}
                    >
                      <span className={cn('col-span-1 text-xs font-mono', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {i + 1}.
                      </span>
                      <span
                        className={cn('col-span-4 font-medium truncate', isDark ? 'text-slate-200' : 'text-slate-800')}
                        title={prov.name}
                      >
                        {prov.name}
                      </span>
                      <div className="col-span-5 flex items-center pr-2">
                        <div
                          className={cn(
                            'h-2 w-full rounded-full overflow-hidden transition-colors',
                            isDark ? 'bg-slate-800' : 'bg-slate-200'
                          )}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          'col-span-2 text-right font-mono font-bold',
                          isDark ? 'text-cyan-300' : 'text-sky-600'
                        )}
                      >
                        {prov.count.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className={cn('py-12 text-center text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  ยังไม่มีข้อมูลจังหวัด
                </div>
              )}
            </div>
          </div>

        </div>
      </GlassCard>
    );
  }
