"use client";

import { Heart } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ImageShowcase — shows 4 response images as feedback cards
   (replacing old text-only badge labels with image reactions)
───────────────────────────────────────────────────────────── */

const RESPONSES = [
    { src: "/images/response.png", label: "for you", labelBg: "linear-gradient(90deg, #FF3D7F, #7C3AFF)", borderBg: "linear-gradient(135deg, #FF4F8B, #8A4DFF)", glow: "rgba(255, 79, 139, 0.55)", glowSoft: "rgba(255, 79, 139, 0.22)", rotate: "-7deg", hoverRotate: "0deg", labelPos: { top: "-14px", right: "-12px" }, zIndex: 1 },
    { src: "/images/response1.png", label: "love it", labelBg: "linear-gradient(90deg, #7C3AFF, #00C8FF)", borderBg: "linear-gradient(135deg, #8A4DFF, #3DA9FF)", glow: "rgba(138, 77, 255, 0.65)", glowSoft: "rgba(138, 77, 255, 0.28)", rotate: "0deg", hoverRotate: "0deg", scale: "1.08", labelPos: { top: "-14px", left: "-12px" }, zIndex: 10 },
    { src: "/images/response2.png", label: "vibes", labelBg: "linear-gradient(90deg, #00C8FF, #FF3D7F)", borderBg: "linear-gradient(135deg, #3DA9FF, #FF4F8B)", glow: "rgba(61, 169, 255, 0.55)", glowSoft: "rgba(61, 169, 255, 0.22)", rotate: "7deg", hoverRotate: "0deg", labelPos: { bottom: "-14px", left: "-12px" }, zIndex: 1 },
    { src: "/images/response3.jpg", label: "princess", labelBg: "linear-gradient(90deg, #FF3D7F, #FFE500)", borderBg: "linear-gradient(135deg, #FF4F8B, #FFE500)", glow: "rgba(255, 61, 127, 0.5)", glowSoft: "rgba(255, 229, 0, 0.2)", rotate: "-4deg", hoverRotate: "0deg", labelPos: { bottom: "-14px", right: "-12px" }, zIndex: 1 },
    { src: "/images/response4.jpg", label: "chalak", labelBg: "linear-gradient(90deg, #00C8FF, #7C3AFF)", borderBg: "linear-gradient(135deg, #3DA9FF, #8A4DFF)", glow: "rgba(61, 169, 255, 0.5)", glowSoft: "rgba(124, 58, 255, 0.2)", rotate: "4deg", hoverRotate: "0deg", labelPos: { top: "-14px", right: "-12px" }, zIndex: 1 },
    { src: "/images/response5.png", label: "adventure", labelBg: "linear-gradient(90deg, #00FF94, #00C8FF)", borderBg: "linear-gradient(135deg, #00FF94, #3DA9FF)", glow: "rgba(0, 255, 148, 0.5)", glowSoft: "rgba(0, 200, 255, 0.2)", rotate: "-5deg", hoverRotate: "0deg", labelPos: { bottom: "-14px", left: "-12px" }, zIndex: 1 },
    { src: "/images/response6.png", label: "explorer", labelBg: "linear-gradient(90deg, #7C3AFF, #FFE500)", borderBg: "linear-gradient(135deg, #8A4DFF, #FFE500)", glow: "rgba(124, 58, 255, 0.5)", glowSoft: "rgba(255, 229, 0, 0.2)", rotate: "3deg", hoverRotate: "0deg", labelPos: { bottom: "-14px", right: "-12px" }, zIndex: 1 },
];

export function ImageShowcase() {
    return (
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8 lg:gap-10">
            {RESPONSES.map((r, i) => (
                <div
                    key={i}
                    className="group relative flex-shrink-0 cursor-pointer"
                    style={{
                        transform: `rotate(${r.rotate})${r.scale ? ` scale(${r.scale})` : ""}`,
                        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                        zIndex: r.zIndex,
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = `rotate(${r.hoverRotate}) scale(${r.scale ? "1.14" : "1.06"})`)
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = `rotate(${r.rotate})${r.scale ? ` scale(${r.scale})` : ""}`)
                    }
                >
                    {/* Gradient border wrapper */}
                    <div
                        className="p-[3px] rounded-2xl sm:rounded-3xl"
                        style={{
                            background: r.borderBg,
                            boxShadow: `0 0 40px ${r.glow}, 0 0 80px ${r.glowSoft}`,
                        }}
                    >
                        <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-black w-44 h-56 sm:w-52 sm:h-66 md:w-60 md:h-76">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={r.src}
                                alt={`Response image ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
