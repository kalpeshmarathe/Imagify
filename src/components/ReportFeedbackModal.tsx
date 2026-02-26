"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam",
  "Harassment or hate",
  "Violence or threats",
  "Copyright violation",
  "Other",
] as const;

interface ReportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackId: string;
  onReportSuccess?: () => void;
  onReportError?: (msg: string) => void;
}

export function ReportFeedbackModal({
  isOpen,
  onClose,
  feedbackId,
  onReportSuccess,
  onReportError,
}: ReportFeedbackModalProps) {
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    if (reason === "Other" && !otherReason.trim()) {
      onReportError?.("Please describe the reason.");
      return;
    }

    setSubmitting(true);
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { getAppFunctions } = await import("@/lib/functions");
      const functions = getAppFunctions();
      if (!functions) throw new Error("Firebase not configured");
      const reportFeedback = httpsCallable<
        { feedbackId: string; reason: string; otherReason?: string },
        { success: boolean; error?: string }
      >(functions, "reportFeedback");

      const res = await reportFeedback({
        feedbackId,
        reason,
        otherReason: reason === "Other" ? otherReason.trim() : undefined,
      });

      const data = res.data;
      if (data?.error) throw new Error(data.error);
      onReportSuccess?.();
      onClose();
      setReason("");
      setOtherReason("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Report failed. Try again.";
      onReportError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReason("");
      setOtherReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full border border-white/10"
        style={{
          background: "var(--bg-card)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
            <Flag className="w-5 h-5 text-[var(--pink)]" /> Report feedback
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4">
          Why are you reporting this? Your IP will be blocked from submitting more feedback.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                style={{
                  background: reason === r ? "rgba(255,61,127,0.15)" : "rgba(255,255,255,0.03)",
                  border: reason === r ? "1px solid rgba(255,61,127,0.4)" : "1px solid transparent",
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-white">{r}</span>
              </label>
            ))}
          </div>

          {reason === "Other" && (
            <div>
              <label htmlFor="other-reason" className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                Please describe
              </label>
              <textarea
                id="other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Describe the reason for reporting..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">{otherReason.length}/500</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white border border-white/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim() || (reason === "Other" && !otherReason.trim())}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                boxShadow: "0 4px 20px rgba(255,61,127,0.3)",
              }}
            >
              {submitting ? "Reporting..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
