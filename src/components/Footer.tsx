"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/05 bg-[#080808] py-20 px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10 bg-purple-500 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10 bg-pink-500 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <img src="/logo.svg" alt="picpop" className="h-7 w-auto opacity-95" />
            </Link>
            <p className="text-white/40 font-bold text-sm leading-relaxed max-w-sm">
              The world's most honest image feedback platform. Drop a link, receive visual reactions, and chat without revealing your identity. One-way anonymity by design.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="sticker text-[10px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] inline-block" style={{ boxShadow: "0 0 6px var(--green)" }} />
                System Live
              </div>
              <div className="sticker text-[10px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Ad-Free Experience
              </div>
            </div>
          </div>

          {/* Links: Platform */}
          <div className="space-y-6">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] opacity-30">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="footer-link-v2">About Us</Link></li>
              <li><Link href="/#how" className="footer-link-v2">How it Works</Link></li>
              <li><Link href={user ? "/dashboard" : "/login"} className="footer-link-v2">Get Feedback</Link></li>
              <li><Link href="/browse" className="footer-link-v2">Browse Ideas</Link></li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div className="space-y-6">
            <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] opacity-30">Regulation</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="footer-link-v2">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link-v2">Terms of Service</Link></li>
              <li><Link href="/about#faq" className="footer-link-v2">Help & FAQ</Link></li>
              <li>
                <a href="mailto:hello@picpop.me" className="footer-link-v2 inline-flex items-center gap-1.5 group">
                  Contact Support <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t border-white/05 flex flex-col sm:flex-row items-center justify-between gap-8">
          <p className="flex items-center gap-1.5 text-xs text-white/10 font-black tracking-tight uppercase">
            <Sparkles className="w-3.5 h-3.5" /> © {currentYear} PicPop Studio — all assets protected. 
          </p>
          <div className="flex items-center gap-8">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/05 cursor-default hover:text-white/10 transition-colors">Digital Integrity</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/05 cursor-default hover:text-white/10 transition-colors">Vibe Centric</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-link-v2 {
          color: rgba(255, 255, 255, 0.4);
          font-weight: 800;
          font-size: 0.85rem;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: block;
        }
        .footer-link-v2:hover {
          color: #fff;
          transform: translateX(6px);
        }
        .sticker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 9999px;
          font-weight: 900;
          letter-spacing: -0.01em;
          white-space: nowrap;
          cursor: default;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
    </footer>
  );
}
