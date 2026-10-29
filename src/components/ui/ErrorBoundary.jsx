import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

/**
 * Robust Error Boundary Component
 * Traps runtime rendering errors within isolated widgets/modals,
 * prevents the React Scheduler / MessagePort microtask loop from locking the entire browser,
 * and renders a graceful recovery UI.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[ErrorBoundary] Caught error in ${this.props.componentName || 'component'}:`,
      error,
      errorInfo
    );
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.error('[ErrorBoundary] Error in onError callback:', e);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // If resetKeys change, auto-reset the error boundary
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      JSON.stringify(this.props.resetKeys) !== JSON.stringify(prevProps.resetKeys)
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    if (typeof this.props.onReset === 'function') {
      try {
        this.props.onReset();
      } catch (e) {
        console.error('[ErrorBoundary] Error in onReset callback:', e);
      }
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.resetError,
        });
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentName = this.props.componentName || 'ส่วนประกอบนี้';
      const errorMessage = this.state.error?.message || 'Unknown runtime error';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="my-4 w-full rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 p-6 text-slate-100 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/20 p-3 text-rose-400 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-300">
                  เกิดข้อผิดพลาดในการแสดงผล ({componentName})
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                ระบบได้ตัดตอนข้อผิดพลาดชั่วคราวเพื่อป้องกันไม่ให้แอปพลิเคชันค้าง
                คุณสามารถกดลองใหม่อีกครั้ง หรือรีเฟรชหน้าเว็บเพื่อกลับสู่การทำงานปกติ
              </p>

              {/* Technical Error Summary */}
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px] text-rose-300 break-all overflow-x-auto select-text">
                <span className="text-slate-500 mr-1.5 font-bold">Error:</span>
                {errorMessage}
              </div>

              {/* Recovery Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={this.resetError}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-600/30 px-3.5 py-2 text-xs font-semibold text-rose-200 transition-all hover:bg-rose-600/40 hover:text-white active:scale-95 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>ลองใหม่อีกครั้ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>โหลดหน้าเว็บใหม่</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

