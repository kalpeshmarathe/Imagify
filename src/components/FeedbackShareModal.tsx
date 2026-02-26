"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { Camera, Sparkles } from "lucide-react";
import { ShareCardTemplate } from "./ShareCardTemplate";
import { IndividualFeedbackTemplate } from "./IndividualFeedbackTemplate";

interface FeedbackShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleFeedback: { feedbackImageUrl: string };
  allData: {
    imageUrl: string;
    coolId: string;
    feedbackImageUrls: string[];
  };
  shareUrl: string;
}

async function saveImageToDevice(blob: Blob) {
  try {
    if ("showSaveFilePicker" in window) {
      const handle = await (window as unknown as {
        showSaveFilePicker: (o: { suggestedName: string; types?: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: "picpop-feedback.png",
        types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch {
    /* fallback */
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "picpop-feedback.png";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function FeedbackShareModal({
  isOpen,
  onClose,
  singleFeedback,
  allData,
  shareUrl,
}: FeedbackShareModalProps) {
  const [action, setAction] = useState<"idle" | "single" | "all" | null>(null);
  const singleRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) setAction(null);
  }, [isOpen]);

  useEffect(() => {
    if (!action || !isOpen) return;
    const run = async () => {
      const el = action === "single" ? singleRef.current : allRef.current;
      const selector = "[data-share-template]";
      const node = el?.querySelector(selector) || el;
      if (!node) return;
      try {
        await new Promise((r) => setTimeout(r, 400));
        const dataUrl = await toPng(node as HTMLElement, { cacheBust: true, pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "picpop-feedback.png", { type: "image/png" });

        await saveImageToDevice(blob);

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: shareUrl, title: "picpop — anonymous feedback" });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        setAction(null);
      }
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, [action, isOpen, shareUrl]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 modal-overlay backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="rounded-2xl p-6 max-w-sm w-full border border-white/10"
          style={{
            background: "var(--bg-card)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-black text-white mb-1">Share feedback</h3>
          <p className="text-xs text-white/50 mb-4">Save or share to Instagram, WhatsApp & more</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!!action}
              onClick={() => setAction("single")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-left transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(255,61,127,0.25), rgba(124,58,255,0.25))",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {action === "single" ? "Preparing..." : <span className="inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Share this feedback</span>}
            </button>
            <button
              type="button"
              disabled={!!action}
              onClick={() => setAction("all")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-left transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,255,0.25), rgba(0,200,255,0.15))",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {action === "all" ? "Preparing..." : <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Share all feedbacks</span>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-sm font-bold text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {(action === "single" || action === "all") && (
        <div style={{ position: "fixed", left: -9999, top: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
          {action === "single" && (
            <div ref={singleRef}>
              <IndividualFeedbackTemplate
                feedbackImageUrl={singleFeedback.feedbackImageUrl}
                coolId={allData.coolId}
              />
            </div>
          )}
          {action === "all" && (
            <div ref={allRef}>
              <ShareCardTemplate
                imageUrl={allData.imageUrl}
                coolId={allData.coolId}
                feedbackImageUrls={allData.feedbackImageUrls}
                shareUrl={shareUrl}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
