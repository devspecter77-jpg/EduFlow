import { useEffect, useRef, useState } from 'react';

interface PageLoaderProps {
  // Real readiness signal (e.g. auth check in progress) instead of a fixed timer —
  // the splash disappears as soon as the app is actually ready, not after an
  // arbitrary delay that makes every load/refresh feel stuck.
  loading: boolean;
}

export function PageLoader({ loading }: PageLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (!loading && wasLoading.current) {
      setFadeOut(true);
      const hideTimer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(hideTimer);
    }
    wasLoading.current = loading;
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8
        bg-white dark:bg-slate-950
        transition-opacity duration-500 ease-in-out
        ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[500px] h-[500px] rounded-full
          bg-gradient-radial from-teal-400/10 via-cyan-400/5 to-transparent
          blur-3xl animate-pulse" />
      </div>

      {/* ── 3D Scene ── */}
      <div className="loader-scene">
        {/* Orbiting rings */}
        <div className="loader-ring loader-ring-1">
          <div className="loader-ring-inner" />
        </div>
        <div className="loader-ring loader-ring-2">
          <div className="loader-ring-inner" />
        </div>
        <div className="loader-ring loader-ring-3">
          <div className="loader-ring-inner" />
        </div>

        {/* Glow backdrop */}
        <div className="loader-glow" />

        {/* 3D Logo Cube */}
        <div className="loader-cube">
          {(['front','back','left','right','top','bottom'] as const).map((face) => (
            <div key={face} className={`loader-cube-face loader-cube-${face}`}>
              <img
                src="/photo_2026-06-12_11-17-02.jpg"
                alt="EduFlow"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Brand + Progress ── */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        {/* Brand name */}
        <h1 className="loader-brand">
          Edu<span>Flow</span> CRM
        </h1>

        {/* Tagline */}
        <p className="loader-tagline">
          Ta'lim markazlari uchun CRM
        </p>

        {/* Progress bar */}
        <div className="loader-progress-track mt-2">
          <div className="loader-progress-fill" />
        </div>

        {/* Bouncing dots */}
        <div className="loader-dots mt-1">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      </div>
    </div>
  );
}
