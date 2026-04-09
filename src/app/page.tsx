"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Flame, MessageCircle, Star, Zap, Target, ScanLine, Sparkles, Upload, Link2, Camera, Heart, Skull, HandMetal, Eye, Rocket, ChevronDown, ChevronRight, Share2, Inbox, ImageIcon, ShieldCheck, ArrowUpRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { MobileNav } from "@/components/MobileNav";
import { ImageShowcase } from "@/components/ImageShowcase";
import { ImageResponseCards } from "@/components/ImageResponseCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleAd } from "@/components/GoogleAd";
import { NotificationBell } from "@/components/NotificationBell";
import { ActivityTicker } from "@/components/ActivityTicker";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeActivity } from "@/hooks/useRealtimeActivity";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { db } from "@/lib/firebase";

const MARQUEE_ITEMS: { Icon: typeof Flame; label: string }[] = [
  { Icon: Camera, label: "photo drops" },
  { Icon: Sparkles, label: "image vibes" },
  { Icon: Zap, label: "unfiltered snaps" },
  { Icon: Eye, label: "visual honesty" },
  { Icon: MessageCircle, label: "anon feedback" },
  { Icon: ImageIcon, label: "pixel check" },
  { Icon: Target, label: "image react" },
  { Icon: ScanLine, label: "snapshot review" },
  { Icon: Star, label: "rate the shot" },
  { Icon: Flame, label: "honest exposure" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { user, profile } = useAuth();
  const { activity: personalActivity, coolId: activeUserCoolId } = useRealtimeActivity();
  const { unreadNotifications } = useUnreadNotifications(user?.uid);

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        :root {
          --pink: #FF3D7F;
          --purple: #7C3AFF;
          --blue: #00C8FF;
          --yellow: #FFE500;
          --green: #00FF94;
          --bg: var(--bg-primary);
        }

        /* ── Grain overlay ── */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
          opacity: 0.25; /* Reduced slightly for mobile */
          transform: translateZ(0); /* Force GPU */
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 99px; }

        /* ── Marquee ── */
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; width: max-content; animation: marquee 18s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        /* ── Float ── */
        @keyframes float { 0%,100%{transform:translateY(0) rotate(var(--r,0deg))} 50%{transform:translateY(-14px) rotate(var(--r,0deg))} }
        .float { animation: float 4s ease-in-out infinite; }

        /* ── Wiggle ── */
        @keyframes wiggle { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        .wiggle { animation: wiggle 2.4s ease-in-out infinite; }

        /* ── Slot machine ── */
        @keyframes slot {
          0%   { transform: translateY(0); }
          18%  { transform: translateY(-20%); }
          36%  { transform: translateY(-40%); }
          54%  { transform: translateY(-60%); }
          72%  { transform: translateY(-80%); }
          90%  { transform: translateY(-80%); }
          100% { transform: translateY(0); }
        }
        .slot { animation: slot 7s cubic-bezier(0.25,0.46,0.45,0.94) infinite; }

        /* ── Fade up ── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay: 0.15s; opacity: 0; }
        .delay-2 { animation-delay: 0.3s; opacity: 0; }
        .delay-3 { animation-delay: 0.45s; opacity: 0; }
        .delay-4 { animation-delay: 0.6s; opacity: 0; }

        /* ── Pop in ── */
        @keyframes popIn { 0%{opacity:0;transform:scale(0.5) rotate(-10deg)} 70%{transform:scale(1.08) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* ── Sticker badge ── */
        .sticker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 9999px;
          font-weight: 900;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
          border: 2.5px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          white-space: nowrap;
          cursor: default;
          transition: transform 0.2s, box-shadow 0.2s;
          transform: translateZ(0);
        }
        .sticker:hover { transform: scale(1.08) rotate(-2deg) !important; }

        /* ── Outlined text ── */
        .text-outline {
          -webkit-text-stroke: 3px white;
          color: transparent;
        }

        /* ── Neon glow ── */
        .glow-pink  { text-shadow: 0 0 40px rgba(255,61,127,0.8), 0 0 80px rgba(255,61,127,0.4); }
        .glow-blue  { text-shadow: 0 0 40px rgba(0,200,255,0.8), 0 0 80px rgba(0,200,255,0.4); }
        .glow-green { text-shadow: 0 0 40px rgba(0,255,148,0.8), 0 0 80px rgba(0,255,148,0.4); }

        /* ── Step card ── */
        .step-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .step-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, var(--card-glow, rgba(124,58,255,0.12)) 0%, transparent 65%);
          pointer-events: none;
        }
        .step-card:hover {
          transform: translateY(-6px) rotate(-0.5deg);
          border-color: var(--border);
          box-shadow: 0 32px 64px rgba(0,0,0,0.5);
        }

        /* ── Navbar glass (theme from globals) ── */
        .navbar-glass { 
          border-bottom: 1px solid var(--border);
          transform: translateZ(0);
        }

        /* ── CTA button ── */
        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
          will-change: transform, box-shadow;
        }
        .cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .cta-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 16px 48px rgba(255,61,127,0.5); }
        .cta-btn:active { transform: scale(0.97); }

        /* ── Photo card ── */
        .photo-card {
          position: relative;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .photo-card:hover { transform: scale(1.04) rotate(0deg) !important; }

        /* ── Pill nav link ── */
        .nav-pill {
          padding: 6px 16px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          transition: background 0.2s, color 0.2s;
        }
        .nav-pill:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* ── Section divider ── */
        .slash-divider {
          width: 100%;
          height: 80px;
          background: linear-gradient(135deg, #FF3D7F, #7C3AFF, #00C8FF);
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 100%);
        }

        /* ── Footer link ── */
        .footer-link { color: var(--text-muted); font-weight: 700; transition: color 0.2s; }
        .footer-link:hover { color: var(--text-primary); }
      `}</style>

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <Navbar />

      <div className="">
        <ActivityTicker
          items={unreadNotifications as any}
          coolId={profile?.coolId || "Me"}
        />
      </div>


      {/* ================================================================
          HERO
      ================================================================ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #1a0533 0%, var(--bg-primary) 65%)" }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: "var(--purple)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: "var(--pink)" }} />

        {/* ── LEFT PHOTO ── */}
        <div
          className="photo-card absolute left-[2%] top-1/2 hidden lg:block"
          style={{ transform: "translateY(-54%) rotate(-9deg)", zIndex: 10, animationDelay: "200ms" }}
        >
          <div
            className="p-[5px] rounded-[26px]"
            style={{
              background: "linear-gradient(135deg, var(--pink), var(--purple), var(--blue))",
              boxShadow: "0 30px 80px rgba(255,61,127,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="w-[200px] h-[260px] xl:w-[230px] xl:h-[300px] rounded-[22px] overflow-hidden bg-black relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/image (1).webp" alt="feedback preview" width={230} height={300} className="w-full h-full object-cover" fetchPriority="high" />
              {/* Overlay shimmer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* ── RIGHT PHOTO ── */}
        <div
          className="photo-card absolute right-[2%] top-1/2 hidden lg:block"
          style={{ transform: "translateY(-44%) rotate(7deg)", zIndex: 10 }}
        >
          <div
            className="p-[5px] rounded-[26px]"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--purple), var(--pink))",
              boxShadow: "0 30px 80px rgba(0,200,255,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="w-[200px] h-[260px] xl:w-[230px] xl:h-[300px] rounded-[22px] overflow-hidden bg-black relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/image (2).webp" alt="feedback preview" width={230} height={300} className="w-full h-full object-cover" fetchPriority="high" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* ── Floating 3D objects ── */}
        <div className="absolute hidden sm:block float" style={{ top: "9%", left: "7%", zIndex: 20, "--r": "-6deg" } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image1.png" alt="" className="w-28 h-28 md:w-40 md:h-40 xl:w-44 xl:h-44 object-contain"
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }} loading="lazy" />
        </div>
        <div className="absolute hidden sm:block float" style={{ top: "7%", right: "6%", zIndex: 20, animationDelay: "0.7s", "--r": "5deg" } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image2.png" alt="" className="w-32 h-32 md:w-44 md:h-44 xl:w-52 xl:h-52 object-contain"
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }} loading="lazy" />
        </div>
        <div className="absolute hidden md:block float" style={{ bottom: "8%", left: "12%", zIndex: 20, animationDelay: "0.4s", animationDuration: "5s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image3.png" alt="" className="w-20 h-20 md:w-28 md:h-28 xl:w-32 xl:h-32 object-contain"
            style={{ filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.5))" }} loading="lazy" />
        </div>

        {/* ── Hero text ── */}
        <div className="relative text-center px-4" style={{ zIndex: 30 }}>
          {/* Label pill */}
          <div className="fade-up flex justify-center mb-6">
            <div
              className="sticker text-xs"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" style={{ boxShadow: "0 0 8px var(--green)" }} />
              the PicPop experience — one-way anonymity.
            </div>
          </div>


          <h1
            className="font-black text-white leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}
          >
            <span className="fade-up block">PicPop.</span>
            <span className="fade-up delay-1 block text-outline">photo reacts.</span>
            <span className="fade-up delay-2 block" style={{ color: "var(--blue)" }}>totally anon.</span>
          </h1>


          <p className="fade-up delay-3 mt-6 text-white/60 max-w-sm mx-auto font-bold text-base sm:text-lg leading-relaxed">
            The world's most honest image feedback platform. Drop your unique PicPop link and get anonymous photo reactions from friends and followers — without them ever knowing it's you.
          </p>


          <div className="fade-up delay-4 mt-10 mb-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? (profile?.coolId ? "/dashboard" : "/create-id") : "/login"}
              className="cta-btn rounded-full px-12 py-5 font-black text-white text-base overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%)",
                boxShadow: "0 8px 40px rgba(0,200,255,0.4)",
              }}
            >
              <span className="inline-flex items-center gap-2">
                {user ? (profile?.coolId ? "Go to Dashboard" : "Claim your ID") : "Join the Vibe"} 
                <Rocket className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="#play"
              className="rounded-full px-10 py-5 font-black text-white/70 text-base border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300 backdrop-blur-md"
            >
              <span className="inline-flex items-center gap-1.5">How it works <ChevronDown className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE DIVIDER ── */}
      <div className="overflow-hidden border-y border-white/08 py-6" style={{ background: "#0f0f0f" }}>
        <div className="marquee-track">
          {Array(2).fill(MARQUEE_ITEMS).flat().map((item, i) => {
            const Icon = item.Icon;
            return (
              <span key={i} className="mx-10 text-sm font-black text-white/40 uppercase tracking-[0.2em] flex-shrink-0 inline-flex items-center gap-2 shadow-sm">
                <Icon className="w-4 h-4 shrink-0 transition-transform hover:scale-125" /> {item.label}
              </span>
            );
          })}
        </div>
      </div>


      {/* ================================================================
          SECTION 2: PLAY FEEDBACK GAMES
      ================================================================ */}
      <section id="play" className="relative bg-[var(--bg)] min-h-screen flex items-center overflow-hidden py-24 px-4 sm:px-6">

        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
            style={{ background: "var(--blue)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
            style={{ background: "var(--pink)" }} />
        </div>

        {/* ── 3D objects ── */}
        <div className="absolute top-10 left-[5%] float hidden sm:block" style={{ zIndex: 5, animationDuration: "4s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image1.png" alt="" className="w-28 h-28 md:w-36 md:h-36 object-contain opacity-70"
            style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.8))" }} loading="lazy" />
        </div>
        <div className="absolute top-8 right-[4%] float hidden sm:block" style={{ zIndex: 5, animationDuration: "5s", animationDelay: "0.6s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image2.png" alt="" className="w-32 h-32 md:w-44 md:h-44 object-contain opacity-70"
            style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.7))" }} loading="lazy" />
        </div>
        <div className="absolute bottom-10 left-[3%] float hidden md:block" style={{ zIndex: 5, animationDelay: "0.3s", animationDuration: "6s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/image3.png" alt="" className="w-24 h-24 md:w-32 md:h-32 object-contain opacity-70"
            style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.7))" }} loading="lazy" />
        </div>

        {/* ── Left response image bubbles ── */}
        {[
          { src: "/images/response.png", top: "18%", delay: "0.8s", rot: "-5deg" },
          { src: "/images/response1.png", top: "54%", delay: "1.4s", rot: "3deg" },
        ].map((b, i) => {
          return (
            <div key={i} className="absolute left-[2%] sm:left-[4%] hidden lg:block float" style={{ top: b.top, zIndex: 10, animationDelay: b.delay, animationDuration: "5s" }}>
              <div className="relative" style={{ transform: `rotate(${b.rot})` }}>
                <div className="p-[3px] rounded-2xl" style={{ background: "linear-gradient(135deg,rgba(255,61,127,0.8),rgba(124,58,255,0.8))", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
                  <div className="w-[130px] h-[155px] rounded-xl overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.src} alt="response" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Right response image bubbles ── */}
        {[
          { src: "/images/response3.jpg", top: "20%", delay: "1s", rot: "5deg" },
          { src: "/images/response4.jpg", top: "55%", delay: "0.5s", rot: "-4deg" },
        ].map((b, i) => {
          return (
            <div key={i} className="absolute right-[2%] sm:right-[4%] hidden lg:block float" style={{ top: b.top, zIndex: 10, animationDelay: b.delay, animationDuration: "4.8s" }}>
              <div className="relative" style={{ transform: `rotate(${b.rot})` }}>
                <div className="p-[3px] rounded-2xl" style={{ background: "linear-gradient(135deg,rgba(0,200,255,0.8),rgba(255,61,127,0.8))", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
                  <div className="w-[130px] h-[155px] rounded-xl overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.src} alt="response" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Central content ── */}
        <div className="relative max-w-2xl mx-auto text-center" style={{ zIndex: 20 }}>
          <AnimateOnScroll>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-4">the feedback loop</p>
            <h2
              className="font-black leading-[0.88] tracking-tight text-white mb-6"
              style={{ fontSize: "clamp(3.8rem, 12vw, 9rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}
            >
              real<br />
              <span className="text-outline">anonymous</span><br />
              <span style={{ color: "var(--blue)" }}>vibes.</span>
            </h2>
          </AnimateOnScroll>

          {/* Slot machine */}
          <AnimateOnScroll delay={200}>
            <div
              className="mt-8 mx-auto overflow-hidden rounded-2xl border border-white/10"
              style={{ height: "clamp(3rem, 8vw, 5.5rem)", background: "rgba(255,255,255,0.04)", maxWidth: "480px" }}
            >
              <div className="slot" style={{ height: "500%" }}>
                {[
                  { label: "photo drop", Icon: Camera, color: "var(--pink)" },
                  { label: "pixel check", Icon: ImageIcon, color: "var(--blue)" },
                  { label: "vibe check", Icon: Sparkles, color: "var(--purple)" },
                  { label: "anon react", Icon: Target, color: "var(--green)" },
                  { label: "honest look", Icon: Zap, color: "#fff" },
                ].map((item, i) => {
                  const SlotIcon = item.Icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-center gap-2 font-black"
                      style={{
                        height: "20%",
                        fontSize: "clamp(1.6rem, 5vw, 3.5rem)",
                        fontFamily: "var(--font-nunito), 'Nunito'",
                        color: item.color,
                        lineHeight: 1,
                      }}
                    >
                      <SlotIcon className="w-8 h-8 shrink-0" /> {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Mobile response image cards */}
          <AnimateOnScroll delay={350}>
            <div className="mt-12 flex flex-wrap justify-center gap-4 lg:hidden">
              {[
                { src: "/images/response.png", bg: "linear-gradient(135deg,#FF3D7F,#7C3AFF)", rot: "-3deg" },
                { src: "/images/response1.png", bg: "linear-gradient(135deg,#7C3AFF,#00C8FF)", rot: "2deg" },
                { src: "/images/response2.png", bg: "linear-gradient(135deg,#00C8FF,#FF3D7F)", rot: "-2deg" },
                { src: "/images/response3.jpg", bg: "linear-gradient(135deg,#FF3D7F,#FFE500)", rot: "3deg" },
              ].map((r, i) => {
                return (
                  <div key={i} className="relative transition-transform hover:scale-110 duration-300" style={{ transform: `rotate(${r.rot})` }}>
                    <div className="p-[3px] rounded-xl shadow-2xl" style={{ background: r.bg }}>
                      <div className="w-20 h-24 rounded-lg overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.src} alt="response" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* ================================================================
          SECTION 2.5: IMAGE SHOWCASE
      ================================================================ */}
      <section className="relative bg-[#0d0d0d] py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--pink)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--purple)" }} />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-3">the timeline</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}>
                how they{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, var(--pink), var(--purple), var(--blue))" }}
                >
                  react
                </span>
              </h2>
              <p className="mt-4 text-white/40 text-base sm:text-lg font-bold">They drop an image. You get a notification. The chat begins.</p>
            </div>
          </AnimateOnScroll>
          <ImageShowcase />
        </div>
      </section>


      {/* ================================================================
          SECTION 3: HOW IT WORKS
      ================================================================ */}
      <section id="how" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden" style={{ background: "var(--bg-primary)" }}>

        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--purple), var(--pink), transparent)" }} />

        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">getting started</p>
              <h2
                className="font-black text-[var(--text-primary)] leading-[0.9]"
                style={{ fontSize: "clamp(3rem, 9vw, 7rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}
              >
                your<br />
                <span className="text-outline">feedback</span><br />
                portal.
              </h2>
              <p className="mt-8 text-white/50 text-base sm:text-lg font-bold max-w-md mx-auto">
                No sign-up for your friends. They just click your link, drop an image, and you get notified instantly.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Step cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", Icon: Link2, title: "Get Your ID", desc: "Claim your unique 'Cool ID'—a personalized handle that serves as your gateway. No traditional signup required for your audience, making the barrier to entry non-existent for your friends and followers.", color: "var(--pink)", glow: "rgba(255,61,127,0.12)", href: user ? "/dashboard" : "/login" },
              { step: "02", Icon: Share2, title: "Spread the Link", desc: "Embed your portal link in your Instagram bio, share it on Twitter, or send it directly on WhatsApp. Our optimized landing pages ensure high conversion rates for your feedback requests.", color: "var(--purple)", glow: "rgba(124,58,255,0.12)", href: user ? "/dashboard" : "/login" },
              { step: "03", Icon: Inbox, title: "Anonymous Chat", desc: "Dive into a secure inbox containing anonymous photo drops and reactions. Reply to each drop to start a secret thread where you can ask follow-up questions without ever knowing their identity.", color: "var(--blue)", glow: "rgba(0,200,255,0.12)", href: user ? "/inbox" : "/login" },
            ].map((s, i) => {
              const StepIcon = s.Icon;
              return (
                <AnimateOnScroll key={i} delay={i * 120}>
                  <Link href={s.href} className="flex flex-col h-full group">
                    <div className="step-card h-full" style={{ "--card-glow": s.glow } as React.CSSProperties}>
                      <div className="mb-5"><StepIcon className="w-12 h-12 transition-transform group-hover:scale-110" style={{ color: s.color }} /></div>
                      <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: s.color }}>{s.step}</div>
                      <h3 className="text-2xl font-black text-white mb-3">{s.title}</h3>
                      <p className="text-white/40 font-bold text-sm leading-relaxed mb-6">{s.desc}</p>
                      <div className="mt-auto text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2" style={{ color: s.color }}>
                        Start now <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              );
            })}
          </div>

          {/* Image response cards */}
          <AnimateOnScroll delay={400}>
            <ImageResponseCards />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================
          SECTION 3.0: CREATIVE COLLECTIONS (Unique Curation / Value)
      ================================================================ */}
      <section className="relative py-24 bg-black px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Explore the <span className="text-[var(--pink)]">Hub.</span></h2>
            <p className="text-[var(--text-muted)] font-bold max-w-2xl mx-auto">
              PicPop isn't just about random drops. Discover specialized collections designed to help you master specific visual niches.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: "Portfolio Polish", count: "1.2k+ prompts", theme: "var(--blue)", desc: "Curated questions for designers looking to refine their UI/UX presentations." },
               { title: "Portrait Vibe", count: "800+ prompts", theme: "var(--pink)", desc: "Specialized feedback hooks for fashion and lifestyle photographers." },
               { title: "Identity Check", count: "2.4k+ prompts", theme: "var(--purple)", desc: "Get deep-dives into your personal brand and online avatar aesthetics." },
               { title: "Commercial Gut", count: "500+ prompts", theme: "var(--green)", desc: "Market research loops for small businesses testing product shots." }
             ].map((collect, i) => (
                <div key={i} className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/05 hover:bg-white/[0.04] transition-all cursor-pointer">
                   <div className="w-10 h-10 rounded-xl mb-6 flex items-center justify-center" style={{ backgroundColor: `${collect.theme}20`, border: `1px solid ${collect.theme}30` }}>
                      <Sparkles className="w-5 h-5" style={{ color: collect.theme }} />
                   </div>
                   <h3 className="text-lg font-black text-white mb-2">{collect.title}</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 block">{collect.count}</span>
                   <p className="text-xs text-white/40 font-bold leading-relaxed">{collect.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3.1: ADVANCED FEATURES (High Value Detail)
      ================================================================ */}

      <section className="relative py-24 bg-[#0c0c0c] px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--blue)] mb-3">Power Tools</p>
              <h2 className="text-3xl sm:text-6xl font-black text-white leading-tight">Beyond Simple <br/><span className="text-outline">Anonymity.</span></h2>
            </div>
            <p className="text-[var(--text-muted)] font-bold max-w-sm mb-2">
              We've engineered PicPop to be more than just a secret-box. It's a full-featured social interaction layer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Real-time Sync", desc: "Our infrastructure uses WebSocket-driven technology to ensure that when a friend drops a photo, it appears in your inbox in under 200ms.", icon: Zap },
              { title: "Smart Notifications", desc: "Never miss a vibe. Get intelligent push notifications and browser alerts tailored to your activity levels.", icon: Rocket },
              { title: "Threaded Chats", desc: "One-off messages are boring. PicPop supports full threaded conversations, allowing for deep dives into feedback.", icon: MessageCircle },
              { title: "Encryption First", desc: "All images are processed through secure transfer protocols. We prioritize your data integrity above all else.", icon: ShieldCheck },
              { title: "Visual Analytics", desc: "Understand your engagement. See which of your links are performing best and what times your audience is most active.", icon: Target },
              { title: "Custom Branding", desc: "Your portal, your rules. Customize your landing page profile with your own images and unique brand messaging.", icon: Sparkles }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/05 hover:bg-white/[0.03] hover:border-white/10 transition-all group">
                <f.icon className="w-10 h-10 text-white/20 group-hover:text-white transition-colors mb-6" />
                <h3 className="text-xl font-black text-white mb-4">{f.title}</h3>
                <p className="text-sm text-white/40 font-bold leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ================================================================
          SECTION 3.2: USE CASES (High Value Content)
      ================================================================ */}
      <section className="relative py-24 bg-[var(--bg-primary)] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Who is it for?</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Versatile Feedback for Everyone</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Photographers", desc: "Get honest critiques on your composition and lighting without the 'polite' bias of your social circle.", icon: Camera, color: "var(--pink)" },
              { title: "Designers", desc: "Run blind UI/UX tests. Share a screenshot and let users react to what they actually see first.", icon: Target, color: "var(--blue)" },
              { title: "Influencers", desc: "Test different outfit combinations or post ideas. Find out what really resonates with your audience.", icon: Sparkles, color: "var(--purple)" },
              { title: "Creators", desc: "Gather unvarnished opinions on your latest video thumbnails or brand assets before you go live.", icon: Zap, color: "var(--green)" }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/05 hover:border-white/10 transition-all">
                <item.icon className="w-8 h-8 mb-4" style={{ color: item.color }} />
                <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3.3: SAFETY & MODERATION
      ================================================================ */}
      <section className="relative py-24 bg-[#080808] border-y border-white/05 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3 h-3" /> Secure Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Safe, Secure,<br/>and Sensible.</h2>
            <div className="space-y-4 text-white/50 font-bold text-sm leading-relaxed">
              <p>
                Anonymity shouldn't mean a lack of accountability. At PicPop, we've built a multi-layered safety system to ensure that your feedback experience remains positive and constructive.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-400 font-black">✓</span>
                  <span><strong>AI Content Filtering:</strong> Every image uploaded is scanned for inappropriate content using advanced vision models.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-black">✓</span>
                  <span><strong>Block & Report:</strong> One-tap blocking of any sender who crosses the line. We track patterns to ban bad actors.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-black">✓</span>
                  <span><strong>Rate Limiting:</strong> Anti-spam measures prevent flood attacks and bot interaction on your personal links.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] animate-pulse" />
              <div className="relative p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                 <ShieldCheck className="w-32 h-32 text-blue-400 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ================================================================
          SECTION 3.5: FAQ & KNOWLEDGE BASE (Anti-Low-Value-Content)
      ================================================================ */}
      <section id="faq" className="relative py-24 bg-[#0a0a0a] border-y border-white/05 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-[var(--text-muted)] font-bold">Everything you need to know about anonymous photo feedback.</p>
          </div>

          <div className="space-y-4">
            {[
              { 
                q: "Is it really anonymous?", 
                a: "Yes. We use a one-way anonymity engine. When you send feedback, your identity is cryptographicly isolated from the recipient profile. Even if you chat back and forth, they will never know who they are talking to unless you choose to reveal yourself. We do not store personal identifiers that link your real-world identity to your anonymous sessions, ensuring total privacy across all feedback metadata." 
              },
              { 
                q: "Do you store my images?", 
                a: "Images are stored securely on our encrypted servers solely to enable the feedback loop. We do not use your images for AI training, and we do not share them with third parties. You can delete your drops and images at any time, and they will be purged from our active storage. Our infrastructure follows SOC2-compliant patterns to ensure data residency and security." 
              },
              { 
                q: "Is PicPop free to use?", 
                a: "Yes, the core features of PicPop—creating IDs, sharing links, and receiving anonymous feedback—are completely free. We keep the platform running through non-intrusive advertisements provided by partners like Google AdSense. This ad-supported model ensures that we can provide high-quality feedback tools to everyone at no cost." 
              },
              { 
                q: "How do I prevent harassment?", 
                a: "We take safety seriously. Users can block specific senders, report inappropriate content, and our automated filters flag potentially harmful text and imagery before they reach your inbox. Our moderation team reviews reported content 24/7. We also employ machine learning algorithms to detect toxic patterns and shadow-ban repeated offenders." 
              },
              { 
                q: "Can I use PicPop for business feedback?", 
                a: "Absolutely. Many designers and creators use PicPop for 'blind vibe checks' on logos, UI designs, and photography projects to get unvarnished opinions before a public launch. It's an excellent tool for qualitative market research where user anonymity encourages honest, unbiased data collection." 
              },
              {
                q: "Can I use my link on Instagram?",
                a: "Definitely! Most of our users place their unique link in their Instagram bio. It's the most effective way to engage with your followers and get feedback on your latest posts or stories. We've optimized our landing pages for the Instagram browser to ensure a seamless handoff."
              },
              {
                q: "What makes PicPop different from other anon apps?",
                a: "PicPop is specifically designed for visual-first feedback. While other apps focus on text secrets, we focus on photo reactions and constructive dialogue around imagery. This creates a purposeful, creative interaction layer that prevents the toxicity often found in text-only anonymous platforms."
              },
              {
                q: "Is there a limit to how many drops I can receive?",
                a: "Currently, there is no hard cap on the number of feedback drops you can receive. Our cloud infrastructure is designed to scale dynamically, ensuring that whether you get 10 or 10,000 reactions, our systems remain responsive and your notifications remain instant."
              },
              {
                q: "Do my friends need to download an app?",
                a: "No. One of our core design pillars is zero friction. Your friends can react to your photos directly through their mobile or desktop browser without downloading any software or creating an account, ensuring the highest possible response rate."
              }
            ].map((item, i) => (
              <div key={i} className={`rounded-[2rem] border transition-all duration-300 ${openFaq === i ? 'bg-white/[0.04] border-white/10' : 'bg-white/[0.02] border-white/05 hover:bg-white/[0.03]'}`}>
                 <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                 >
                    <span className="text-lg font-black text-white group-hover:text-[var(--blue)] transition-colors">{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-white/20 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-white' : ''}`} />
                 </button>
                 {openFaq === i && (
                   <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-white/40 leading-relaxed font-bold text-sm">
                        {item.a}
                      </p>
                   </div>
                 )}
              </div>
            ))}



          </div>

          <div className="mt-16 p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 text-center">
            <h3 className="text-xl font-black text-white mb-4">Need more help?</h3>
            <p className="text-white/40 font-bold mb-8 text-sm">Check our full documentation or reach out to our team.</p>
            <Link href="/about" className="inline-flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
              Learn more about our mission <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {process.env.NEXT_PUBLIC_ADSENSE_SLOT && (
        <div className="max-w-5xl mx-auto px-4">
          <GoogleAd slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT} format="horizontal" />
        </div>
      )}

      {/* ================================================================
          SECTION 4: JOIN THE VIBE (CTA)
      ================================================================ */}
      <section className="relative overflow-hidden py-32 sm:py-48 px-4 sm:px-6">
        {/* Full bleed gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FF3D7F 0%, #7C3AFF 50%, #00C8FF 100%)" }} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Floating icons */}
        <div className="absolute top-12 left-[8%] float opacity-70"><Sparkles className="w-12 h-12 text-white/80" /></div>
        <div className="absolute bottom-12 right-[8%] float opacity-70" style={{ animationDelay: "1s" }}><MessageCircle className="w-12 h-12 text-white/80" /></div>
        <div className="absolute top-16 right-[20%] float opacity-50" style={{ animationDelay: "0.5s" }}><Sparkles className="w-8 h-8 text-white/70" /></div>
        <div className="absolute bottom-20 left-[20%] float opacity-50" style={{ animationDelay: "1.5s" }}><MessageCircle className="w-8 h-8 text-white/70" /></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <AnimateOnScroll>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-6">experience it now</p>
            <h2
              className="font-black text-white leading-[0.9] mb-10"
              style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}
            >
              ready to<br />
              <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.9)", color: "transparent" }}>get real?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="cta-btn rounded-full px-16 py-6 font-black text-xl transition-all shadow-2xl"
                style={{
                  background: "#fff",
                  color: "#7C3AFF",
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {user ? "Go to Dashboard" : "Join the Portal"} 
                  <Sparkles className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================
          SECTION 4.2: THE PICPOP ADVANTAGE (Comparative Content)
      ================================================================ */}
      <section className="relative py-24 bg-[var(--bg-primary)] px-4 sm:px-6">

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Why PicPop?</h2>
             <p className="text-[var(--text-muted)] font-bold max-w-2xl mx-auto">
               In the crowded landscape of social apps, PicPop stands out by focusing on what actually matters: visual truth.
             </p>
          </div>

          <div className="space-y-6">
             {[
               { q: "Contextual Feedback", a: "Unlike text-based secret apps where messages often lack context, PicPop centers every interaction around an image. This focus leads to more relevant, high-quality feedback that you can actually use to improve your craft or personal brand." },
               { q: "One-Way Privacy Architecture", a: "Most anonymous platforms are two-way anonymized or completely public. PicPop's unique one-way logic ensures you (the owner) are known, while the contributors are protected. This creates a safe bridge between your public persona and private interactions." },
               { q: "Creator-Centric Design", a: "We don't sell your data to training models. We don't flood your screen with intrusive pop-up ads. We provide a clean, premium environment designed specifically for photographers, designers, and visual thinkers." },
               { q: "Building Professional Credibility", a: "By explicitly asking for feedback through a dedicated portal, you demonstrate a level of professional vulnerability and a commitment to growth that resonates with followers and clients alike." }
             ].map((item, i) => (
               <div key={i} className="flex flex-col md:flex-row gap-6 p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/05 hover:border-white/08 transition-all">
                  <div className="md:w-1/3 text-xl font-black text-white">{item.q}</div>
                  <div className="md:w-2/3 text-white/40 font-bold leading-relaxed text-sm">{item.a}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4.3: COMMUNITY VOICES (Placeholder Testimonials)
      ================================================================ */}
      <section className="relative py-24 bg-[#0a0a0a] overflow-hidden px-4 sm:px-6">
         <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
               <div className="p-8 rounded-[2rem] bg-gradient-to-br from-pink-500/5 to-transparent border border-pink-500/10">
                  <div className="flex gap-1 text-pink-500 mb-4"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                  <p className="text-white font-bold italic mb-6">"PicPop helped me realize which of my portfolio shots were actually resonating. The anonymous element removed the 'friend-tax' on honesty."</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">— Lifestyle Photographer</p>
               </div>
               <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                  <div className="flex gap-1 text-blue-500 mb-4"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                  <p className="text-white font-bold italic mb-6">"As a UI designer, I use my link to run quick vibe checks on concepts. It's faster and more honest than any survey tool I've used."</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">— Product Lead</p>
               </div>
               <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                  <div className="flex gap-1 text-purple-500 mb-4"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                  <p className="text-white font-bold italic mb-6">"I put my link in my bio and got 50+ reactions in one day. The chat feature makes it so easy to follow up on anonymous critiques!"</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">— Digital Creator</p>
               </div>
            </div>
         </div>
      </section>


      {/* ================================================================
          SECTION 4.5: EDUCATIONAL CONTENT (High-Value Publisher Content)
      ================================================================ */}
      <section className="relative py-24 bg-black px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
              The Power of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink)] to-[var(--purple)]">Unfiltered Truth.</span>
            </h2>
            <div className="space-y-6 text-white/60 font-medium leading-relaxed">
              <p>
                In an era dominated by performative social media, standard feedback loops often fall into the "politeness trap." We've all seen it: a friend asks for an opinion on a photo, and the response is a standard "looks great!" regardless of how people actually feel.
              </p>
              <p>
                <strong>PicPop</strong> disrupts this cycle by introducing a one-way anonymous barrier. Scientific studies on social behavior suggest that anonymity reduces the fear of social retribution, allowing for radical honesty. This isn't just about being "critical"—it's about being <strong>real</strong>.
              </p>
              <p>
                Whether you're a designer looking for a gut-check on a new UI concept, or a photographer trying to gauge the mood of a portrait, anonymity provides a data quality that public commentary simply cannot match.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/08">
                <h3 className="text-white font-black mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Secure
                </h3>
                <p className="text-xs text-white/40 font-bold">End-to-end data safety protocols.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/08">
                <h3 className="text-white font-black mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Fast
                </h3>
                <p className="text-xs text-white/40 font-bold">Real-time reactions in milliseconds.</p>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/08">
                <h3 className="text-white font-black mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" /> Private
                </h3>
                <p className="text-xs text-white/40 font-bold">One-way anon logic by design.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/08">
                <h3 className="text-white font-black mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" /> Human
                </h3>
                <p className="text-xs text-white/40 font-bold">Built for real social interaction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4.6: COMMUNITY COMMITMENT
      ================================================================ */}
      <section className="relative py-24 bg-[#050505] px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Our Pledge to You</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">Authentic Social Integrity.</h2>
          <p className="text-white/40 font-bold leading-relaxed mb-12 max-w-2xl mx-auto">
            Social media should empower you, not drain you. At PicPop, we are committed to building a digital space where honesty is celebrated, privacy is a right, and genuine connection is the ultimate goal. We don't just build features; we build trust.
          </p>
          <div className="grid sm:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Transparency</h3>
              <p className="text-xs text-white/20 font-bold">We are open about how our algorithms and privacy logic work. No hidden tracking, no secrets.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Inclusion</h3>
              <p className="text-xs text-white/20 font-bold">Our platform is built for everyone, from professional artists to casual users looking for a fun social experience.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Evolution</h3>
              <p className="text-xs text-white/20 font-bold">We constantly evolve based on community feedback. Your voice directly shapes the future of PicPop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4.7: SYSTEM INTEGRITY & MISSION
      ================================================================ */}
      <section className="relative py-24 bg-[var(--bg-primary)] px-4 sm:px-6 border-y border-white/05">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              A New Standard for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--blue)] to-[var(--purple)]">Social Honesty.</span>
            </h2>
            <div className="prose prose-invert prose-lg max-w-none text-white/50 font-bold leading-relaxed space-y-6">
              <p>
                The digital world is currently facing a crisis of authenticity. High-pressure social environments have forced us to curate every pixel of our lives, leading to a feedback desert where everything is "good" but nothing is "real." 
              </p>
              <p>
                <strong>PicPop</strong> was founded on the idea that anonymity, when applied correctly within a structured visual context, acts as a powerful catalyst for truth. By removing the social repercussions of an opinion, we allow for a quality of dialogue that is impossible in public comment sections.
              </p>
              <p>
                Our commitment is to maintain this space as a haven for constructive, visual-first engagement. We are not just building an app; we are rebuilding the bridge between what people think and what people say.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
               <div>
                  <div className="text-2xl font-black text-white">99.9%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Uptime Reliability</div>
               </div>
               <div>
                  <div className="text-2xl font-black text-white">256-bit</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Data Encryption</div>
               </div>
               <div>
                  <div className="text-2xl font-black text-white">24/7</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Moderation Active</div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
             <div className="absolute inset-0 bg-purple-500/20 blur-[120px] rounded-full" />
             <div className="relative p-12 rounded-[3rem] bg-white/[0.02] border border-white/08 backdrop-blur-2xl">
                <Sparkles className="w-16 h-16 text-[var(--purple)] mb-8 animate-pulse" />
              <h3 className="text-2xl font-black text-white mb-4">Our Integrity Promise</h3>
              <p className="text-sm text-white/40 font-bold leading-relaxed">
                 We promise to never sell your private image data, to always prioritize your mental well-being over engagement metrics, and to keep our platform open and free for creators around the globe.
              </p>
             </div>
          </div>
        </div>
      </section>

      <Footer />


    </div>
  );
}
