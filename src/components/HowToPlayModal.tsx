"use client";

import { useState, useEffect } from "react";
import { X, Copy, ChevronLeft, ChevronDown } from "lucide-react";

type Platform = "instagram" | "snapchat" | "whatsapp" | null;

interface Step {
  img: string;
  title: string;
  shortLabel: string;
  description: string;
}

const INSTAGRAM_STEPS: Step[] = [
  {
    img: "/images/instagram/step1.gif",
    title: "Copy your link",
    shortLabel: "Copy link",
    description: "Copy your feedback link from picpop.me (use the Copy button above)",
  },
  {
    img: "/images/instagram/step2.gif",
    title: "Open Stories",
    shortLabel: "Open Stories",
    description: "Open Instagram and create a new Story. Tap the sticker icon in the top bar.",
  },
  {
    img: "/images/instagram/step3.gif",
    title: "Add link sticker",
    shortLabel: "Add link",
    description: "In the sticker menu, tap on the Link sticker to add it to your Story.",
  },
  {
    img: "/images/instagram/step4.gif",
    title: "Paste your link",
    shortLabel: "Paste link",
    description: "Paste the link you copied into the link field and confirm.",
  },
  {
    img: "/images/instagram/step5.gif",
    title: "Share your Story",
    shortLabel: "Share",
    description: "Position the link sticker where you want, then share your Story for friends to tap and send feedback.",
  },
];

const SNAPCHAT_STEPS: Step[] = [
  { img: "", title: "Step 1", shortLabel: "1", description: "Coming soon" },
  { img: "", title: "Step 2", shortLabel: "2", description: "Coming soon" },
  { img: "", title: "Step 3", shortLabel: "3", description: "Coming soon" },
  { img: "", title: "Step 4", shortLabel: "4", description: "Coming soon" },
  { img: "", title: "Step 5", shortLabel: "5", description: "Coming soon" },
];

const WHATSAPP_STEPS: Step[] = [
  { img: "", title: "Step 1", shortLabel: "1", description: "Coming soon" },
  { img: "", title: "Step 2", shortLabel: "2", description: "Coming soon" },
  { img: "", title: "Step 3", shortLabel: "3", description: "Coming soon" },
  { img: "", title: "Step 4", shortLabel: "4", description: "Coming soon" },
  { img: "", title: "Step 5", shortLabel: "5", description: "Coming soon" },
];

const PLATFORM_STEPS: Record<NonNullable<Platform>, Step[]> = {
  instagram: INSTAGRAM_STEPS,
  snapchat: SNAPCHAT_STEPS,
  whatsapp: WHATSAPP_STEPS,
};

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackUrl: string;
  onCopyLink: () => void;
}

export function HowToPlayModal({ isOpen, onClose, feedbackUrl, onCopyLink }: HowToPlayModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(null);
      setActiveStepIndex(0);
    }
  }, [isOpen]);

  const steps = selectedPlatform ? PLATFORM_STEPS[selectedPlatform] : [];
  const activeStepIndexSafe = selectedPlatform && steps.length > 0 ? (activeStepIndex ?? 0) : 0;
  const activeStep = steps[activeStepIndexSafe] ?? steps[0] ?? null;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <style>{`
        .how-to-play-scroll::-webkit-scrollbar { width: 8px; }
        .how-to-play-scroll::-webkit-scrollbar-track { background: var(--bg-secondary); border-radius: 4px; margin: 4px 0; }
        .how-to-play-scroll::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 4px; }
        .how-to-play-scroll::-webkit-scrollbar-thumb:hover { background: var(--pink); }
      `}</style>
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            {selectedPlatform && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatform(null);
                  setActiveStepIndex(0);
                }}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {selectedPlatform ? `Share on ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}` : "How to share your link"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="how-to-play-scroll flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {!selectedPlatform ? (
            /* Platform selection */
            <div className="p-5 space-y-3">
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Choose a platform to see step-by-step instructions.
              </p>
              {(
                [
                  { id: "instagram" as const, label: "Instagram", color: "from-orange-500 to-pink-600" },
                  { id: "snapchat" as const, label: "Snapchat", color: "from-yellow-400 to-yellow-500" },
                  { id: "whatsapp" as const, label: "WhatsApp", color: "from-emerald-500 to-green-600" },
                ]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(p.id);
                    setActiveStepIndex(0);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--pink)]/40 hover:bg-white/[0.02] transition-all text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${p.color} text-white font-bold text-sm shadow-lg`}
                  >
                    {p.label[0]}
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{p.label}</span>
                  <ChevronDown className="w-5 h-5 text-[var(--text-muted)] ml-auto rotate-[-90deg]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5">
              {/* Copy link bar - only for Instagram */}
              {selectedPlatform === "instagram" && (
                <div
                  className="rounded-xl p-4 mb-6 flex items-center gap-3"
                  style={{ background: "rgba(255,61,127,0.06)", border: "1px solid rgba(255,61,127,0.2)" }}
                >
                  <p className="text-xs font-medium text-[var(--text-muted)] flex-1 truncate">{feedbackUrl}</p>
                  <button
                    type="button"
                    onClick={onCopyLink}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-white text-sm"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
              )}

              {/* 5 clickable steps - numbers only, in one line */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStepIndex(i)}
                    className={`flex items-center justify-center aspect-square rounded-xl border transition-all ${
                      activeStepIndex === i
                        ? "border-[var(--pink)] bg-[var(--pink)]/10 shadow-[0_0_0_2px_rgba(255,61,127,0.3)]"
                        : "border-[var(--border)] hover:border-[var(--text-muted)]/40 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: activeStepIndex === i
                          ? "linear-gradient(135deg, var(--pink), var(--purple))"
                          : "var(--bg-secondary)",
                        color: activeStepIndex === i ? "white" : "var(--text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected step detail */}
              {activeStep && (
                <div
                  className="rounded-xl p-5 border border-[var(--border)]"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">{activeStep.title}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{activeStep.description}</p>
                  {activeStep.img && (
                    <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeStep.img}
                        alt={activeStep.title}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
