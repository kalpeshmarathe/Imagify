"use client";

import { CheckCircle2, AlertCircle, Bell, X } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 11);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000) => {
      addToast(message, type, duration);
    },
    [addToast]
  );

  const value = useMemo<ToastContextType>(
    () => ({
      toast,
      success: (m) => addToast(m, "success"),
      error: (m) => addToast(m, "error"),
      info: (m) => addToast(m, "info"),
    }),
    [toast, addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Visual toasts removed in favor of on-page activity banner */}
    </ToastContext.Provider>
  );
}

function ToastItem({
  message,
  type,
  onDismiss,
}: Toast & { onDismiss: () => void }) {
  const isError = type === "error";
  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className="pointer-events-auto w-full max-w-[420px] rounded-[24px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl border border-white/10 flex items-stretch gap-0 transition-all duration-500 group animate-in slide-in-from-bottom-12 fade-in zoom-in-95"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
      }}
    >
      {/* Dynamic Left Bar with pulsing glow */}
      <div className={`w-2 shrink-0 relative overflow-hidden ${
        isSuccess ? "bg-[#00FF94]" :
        isError ? "bg-[#FF3D7F]" :
        "bg-gradient-to-b from-[#FF3D7F] to-[#7C3AFF]"
      }`}>
        <div className="absolute inset-x-0 top-0 h-full w-full opacity-30 animate-pulse bg-white/20" />
      </div>

      <div className="flex flex-1 items-center gap-4 py-4 pl-5 pr-6 relative">
        {/* Glow effect */}
        <div className={`absolute -left-10 -top-10 w-32 h-32 blur-3xl opacity-10 rounded-full ${
          isSuccess ? "bg-[#00FF94]" : isError ? "bg-[#FF3D7F]" : "bg-[#7C3AFF]"
        }`} />

        <div className={`shrink-0 w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${
          isSuccess ? "bg-[#00FF94]/10 text-[#00FF94] shadow-[#00FF94]/10" :
          isError ? "bg-[#FF3D7F]/10 text-[#FF3D7F] shadow-[#FF3D7F]/10" :
          "bg-white/5 text-white/90 shadow-white/5"
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : isError ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Bell className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${
              isSuccess ? "text-[#00FF94]" : isError ? "text-[#FF3D7F]" : "text-white/40"
            }`}>
              {isSuccess ? "Notification" : isError ? "Alert" : "System Message"}
            </span>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Now</span>
          </div>
          <p className="text-[15px] font-[800] tracking-tight leading-snug text-white line-clamp-2">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (m: string) => { },
      success: (m: string) => { },
      error: (m: string) => { },
      info: (m: string) => { },
    };
  }
  return ctx;
}
