"use client";

import { useAuth } from "@/lib/auth-context";
import { useLoading } from "@/lib/loading-context";

export function GlobalLoader() {
  const { loading: authLoading } = useAuth();
  const { pageLoading, actionLoading } = useLoading();

  const show = authLoading || pageLoading || actionLoading;
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-sm"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="w-14 h-14 rounded-full border-[3px] border-white/10 flex-shrink-0"
          style={{
            borderTopColor: "var(--pink)",
            borderRightColor: "var(--purple)",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p className="text-sm font-bold text-white/60 animate-pulse">loading...</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
