"use client";

import { Heart } from "lucide-react";

/* Image response cards for "How it works" section — hover effects require client */

const CARDS = [
  { src: "/images/response.png", label: "for you", bg: "linear-gradient(135deg,#FF3D7F,#7C3AFF)", glow: "rgba(255,61,127,0.5)", rot: "-6deg", scale: "1" },
  { src: "/images/response1.png", label: "love it", bg: "linear-gradient(135deg,#7C3AFF,#00C8FF)", glow: "rgba(124,58,255,0.55)", rot: "0deg", scale: "1.1" },
  { src: "/images/response2.png", label: "vibes", bg: "linear-gradient(135deg,#00C8FF,#FF3D7F)", glow: "rgba(0,200,255,0.5)", rot: "6deg", scale: "1" },
  { src: "/images/response3.jpg", label: "princess", bg: "linear-gradient(135deg,#FF3D7F,#FFE500)", glow: "rgba(255,61,127,0.45)", rot: "-3deg", scale: "1" },
  { src: "/images/response4.jpg", label: "chalak", bg: "linear-gradient(135deg,#00C8FF,#7C3AFF)", glow: "rgba(0,200,255,0.45)", rot: "3deg", scale: "1" },
  { src: "/images/response5.png", label: "adventure", bg: "linear-gradient(135deg,#00FF94,#00C8FF)", glow: "rgba(0,255,148,0.5)", rot: "-4deg", scale: "1" },
  { src: "/images/response6.png", label: "explorer", bg: "linear-gradient(135deg,#7C3AFF,#FFE500)", glow: "rgba(124,58,255,0.45)", rot: "2deg", scale: "1" },
];

export function ImageResponseCards() {
  return (
    <div className="mt-12 flex flex-wrap justify-center items-end gap-5 sm:gap-8">
      {CARDS.map((r, i) => (
        <div
          key={i}
          className="relative group cursor-pointer"
          style={{ transform: `rotate(${r.rot}) scale(${r.scale})`, transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(0deg) scale(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${r.rot}) scale(${r.scale})`)}
        >
          <div className="p-[3px] rounded-2xl" style={{ background: r.bg, boxShadow: `0 12px 40px ${r.glow}` }}>
            <div className="w-24 h-28 sm:w-28 sm:h-34 md:w-32 md:h-40 rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.src} alt={r.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
