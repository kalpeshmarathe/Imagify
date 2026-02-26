"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "neutral";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "neutral",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const btnConfirmStyle =
    variant === "danger"
      ? {
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "#fff",
        }
      : {
          background: "linear-gradient(135deg, var(--pink), var(--purple))",
          color: "#fff",
        };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 modal-overlay backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 max-w-sm w-full border border-white/10"
        style={{
          background: "var(--bg-card)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
            style={btnConfirmStyle}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
