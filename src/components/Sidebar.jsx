import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, Radio, Activity, Sun, Moon } from 'lucide-react';
import { APP_VERSION } from '@/version';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function Sidebar({ currentPage, onNavigate, mobileOpen, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'ศูนย์ควบคุมภาพรวม',
      icon: LayoutDashboard
    },
    {
      id: 'field',
      label: 'Field Visit',
      sublabel: 'แบบบันทึกตรวจเยี่ยม',
      icon: ClipboardList
    }
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-[88px] z-20 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-[88px] z-30 flex h-[calc(100vh-88px)] w-64 flex-col justify-between border-r p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-in-out lg:translate-x-0',
          isDark
            ? 'border-[rgba(28,139,255,0.22)] bg-[linear-gradient(180deg,rgba(2,15,35,0.98),rgba(2,11,27,0.99))] text-white'
            : 'border-slate-200/90 bg-white/95 text-slate-800 shadow-lg',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-6">
          <div>
            <div
              className={cn(
                'px-3 pb-2 text-[11px] font-bold tracking-wider uppercase',
                isDark ? 'text-cyan-400' : 'text-sky-600'
              )}
            >
              Control Center Menu
            </div>
            <nav className="space-y-1.5" aria-label="แถบเมนูหลัก">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      onClose?.();
                    }}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
                      isActive
                        ? isDark
                          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/15 text-white border border-blue-500/40 shadow-[0_0_20px_rgba(8,127,255,0.2)]'
                          : 'bg-sky-50 text-sky-800 border border-sky-300 shadow-xs'
                        : isDark
                          ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                        isActive
                          ? isDark
                            ? 'bg-blue-500/30 text-cyan-300'
                            : 'bg-sky-100 text-sky-600'
                          : isDark
                            ? 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col leading-normal">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span
                        className={cn(
                          'text-[11px] leading-normal',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        {item.sublabel}
                      </span>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className={cn(
                          'absolute right-0 h-6 w-1 rounded-l-full',
                          isDark ? 'bg-cyan-400 shadow-[0_0_8px_#24b8ff]' : 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]'
                        )}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action buttons (Theme Switcher & Logout) */}
          <div className={cn('pt-3 space-y-2 border-t', isDark ? 'border-slate-800/80' : 'border-slate-200')}>
            {/* Theme Toggle Button in Sidebar */}
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
                isDark
                  ? 'border-blue-500/20 text-slate-300 hover:bg-blue-950/30 hover:border-blue-500/40 hover:text-white'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  isDark
                    ? 'bg-blue-500/20 text-amber-400 group-hover:bg-blue-500/30'
                    : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                )}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </div>
              <div className="flex flex-col leading-normal">
                <span className="text-sm font-semibold">{isDark ? 'โหมดสว่าง' : 'โหมดมืด'}</span>
                <span className={cn('text-[10px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {isDark ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Branding & Signal Status */}
        <div
          className={cn(
            'rounded-xl border p-3.5 text-center transition-colors',
            isDark
              ? 'border-blue-500/20 bg-blue-950/20 text-slate-200'
              : 'border-slate-200 bg-slate-50/80 text-slate-800'
          )}
        >
          <div className="mb-2 flex items-center justify-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="h-2.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-3.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="h-4.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="h-5.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
          <div className={cn('text-xs font-bold tracking-wider', isDark ? 'text-slate-200' : 'text-slate-800')}>
            NBTC
          </div>
          <div className={cn('text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Pre-PM Survey v{APP_VERSION}
          </div>
        </div>
      </aside>
    </>
  );
}
