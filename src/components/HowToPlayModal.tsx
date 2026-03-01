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
  {
    img: "",
    title: "Copy your link",
    shortLabel: "Copy link",
    description: "Copy your feedback link from picpop.me (use the Copy button above)",
  },
  {
    img: "",
    title: "Open Snapchat",
    shortLabel: "Open app",
    description: "Open Snapchat and tap the camera button to create a new Snap.",
  },
  {
    img: "",
    title: "Take or upload a Snap",
    shortLabel: "Create Snap",
    description: "Take a photo or video, or upload one from your gallery.",
  },
  {
    img: "",
    title: "Add link sticker",
    shortLabel: "Add link",
    description: "Tap the sticker icon (square with folded corner), then select the Link sticker and paste your feedback link.",
  },
  {
    img: "",
    title: "Share your Snap",
    shortLabel: "Share",
    description: "Send your Snap to friends or add it to your Story. Friends can tap the link to send you anonymous feedback!",
  },
];

const WHATSAPP_STEPS: Step[] = [
  {
    img: "",
    title: "Copy your link",
    shortLabel: "Copy link",
    description: "Copy your feedback link from picpop.me (use the Copy button above)",
  },
  {
    img: "",
    title: "Open WhatsApp",
    shortLabel: "Open app",
    description: "Open WhatsApp and go to the chat where you want to share your feedback link.",
  },
  {
    img: "",
    title: "Paste your link",
    shortLabel: "Paste link",
    description: "Long-press in the message input field and paste your feedback link.",
  },
  {
    img: "",
    title: "Add a message",
    shortLabel: "Add message",
    description: "Optional: Add a fun message like 'Drop some feedback on this!' to encourage friends.",
  },
  {
    img: "",
    title: "Send",
    shortLabel: "Send",
    description: "Tap the send button to share your link. Friends can tap it to send you anonymous feedback!",
  },
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

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const SnapchatIcon = () => (
 <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 28.87 28.87"
  className=""
>
  <g>
    <g>
      <rect
        width="28.87"
        height="28.87"
        rx="6.48"
        ry="6.48"
        fill="#fffc00"
      ></rect>

      <path
        fill="#fefefe"
        stroke="#000"
        strokeWidth="0.5"
        strokeMiterlimit="10"
        d="M22.83 18.68v-.07a2.11 2.11 0 0 0-.55-.14A5 5 0 0 1 20 16.83a3.86 3.86 0 0 1-.75-1.37.75.75 0 0 1 0-.55 1.27 1.27 0 0 1 .82-.48 3.75 3.75 0 0 0 1-.55c.07-.07.07-.14.14-.21v-.07a.21.21 0 0 0 0-.27.56.56 0 0 0-.34-.34.66.66 0 0 0-.62-.07 2.11 2.11 0 0 1-.55.14h-.07a1 1 0 0 1-.62 0v-.14a7 7 0 0 1 .07-1.16 18.56 18.56 0 0 0-.07-1.91 4.3 4.3 0 0 0-1.78-2.6 4.65 4.65 0 0 0-2.13-.75 2.56 2.56 0 0 0-.75-.07 4.6 4.6 0 0 0-2.94 1A5.4 5.4 0 0 0 10 9.24v.07a5 5 0 0 0-.21 2.26 11 11 0 0 1 0 1.5 1.4 1.4 0 0 1-.75 0H9a2.11 2.11 0 0 1-.55-.14.53.53 0 0 0-.55.14h-.05c-.07.07-.27.21-.27.41v.07a.58.58 0 0 0 .21.34c.07.07.14.07.21.14a3.48 3.48 0 0 0 1.16.48c.21.14.48.27.48.48a1.09 1.09 0 0 1-.21.89 5.62 5.62 0 0 1-1.71 2.05 5.59 5.59 0 0 1-1.3.62h-.07a.6.6 0 0 0-.41.27h-.07c0 .14 0 .34.07.41s.14.14.21.14a4.35 4.35 0 0 0 1.23.41c.27.07.55.14.75.21a.53.53 0 0 0 .07.21c.07.21.14.48.21.75 0 .07.07.07.14.14a.4.4 0 0 0 .26-.09h.07a5.65 5.65 0 0 1 1.85-.07 11.3 11.3 0 0 1 1.78 1 2.64 2.64 0 0 0 1.44.55h1.23a3.43 3.43 0 0 0 .89-.34h.07A12.48 12.48 0 0 1 17.9 21h.1a1.91 1.91 0 0 1 .68-.07 5.94 5.94 0 0 1 1.57.07h.07a.15.15 0 0 0 .14-.14.07.07 0 0 0 .07-.07c0-.07.07-.07 0-.07h.07a1.58 1.58 0 0 1 .27-.75.52.52 0 0 1 .34-.14 6.47 6.47 0 0 0 1.23-.34 1.72 1.72 0 0 0 .55-.34c.01-.15.01-.41-.16-.47z"
      />
    </g>
  </g>
</svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PLATFORMS = [
  { 
    id: "instagram" as const, 
    label: "Instagram", 
    color: "from-orange-500 to-pink-600",
    icon: <InstagramIcon />
  },
  { 
    id: "snapchat" as const, 
    label: "Snapchat", 
    color: "from-yellow-400 to-yellow-500",
    icon: <SnapchatIcon />
  },
  { 
    id: "whatsapp" as const, 
    label: "WhatsApp", 
    color: "from-emerald-500 to-green-600",
    icon: <WhatsAppIcon />
  },
];

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
              {PLATFORMS.map((p) => (
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${p.color} text-white shadow-lg`}
                  >
                    {p.icon}
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{p.label}</span>
                  <ChevronDown className="w-5 h-5 text-[var(--text-muted)] ml-auto rotate-[-90deg]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5">
              {/* Copy link bar - for all platforms */}
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
