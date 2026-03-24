"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-xl">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden group">
        {/* Abstract background accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all duration-700" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/05 border border-white/05 flex items-center justify-center shrink-0">
             <Cookie className="w-7 h-7 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-white font-black text-lg mb-1 tracking-tight">Cookies & Privacy</h4>
            <p className="text-white/40 text-xs font-bold leading-relaxed">
              We use tasty cookies to personalize your visual experience and analyze how you interact with our vibes. By clicking accept, you’re cool with our <Link href="/privacy" className="text-blue-400/80 underline decoration-blue-500/30 underline-offset-4 hover:text-blue-300">Privacy Policy</Link>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 hover:bg-white/05 transition-all"
            >
              Skip
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-3 rounded-2xl bg-white text-[#0a0a0a] text-[10px] font-black uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Check className="w-3 h-3" strokeWidth={4} /> Accept
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
