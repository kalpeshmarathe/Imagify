"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Flame, MessageCircle, Star, Zap, Target, ScanLine, Sparkles, Upload, Link2, Camera, Heart, Skull, HandMetal, Eye, Rocket, ChevronDown, ChevronRight, Share2, Inbox, ImageIcon, ShieldCheck, ArrowUpRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { MobileNav } from "@/components/MobileNav";
import { ImageShowcase } from "@/components/ImageShowcase";
import { ImageResponseCards } from "@/components/ImageResponseCards";
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
        style={{ background: "radial-gradient(ellipse at 50% 0%, var(--hero-radial-mid) 0%, var(--bg-primary) 65%)" }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
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

        {/* ── Hero text ── */}
        <div className="relative text-center px-4" style={{ zIndex: 30 }}>
          {/* Label pill */}
          <div className="fade-up flex justify-center mb-6">
            <div
              className="sticker text-xs"
              style={{ background: "var(--sticker-bg)", border: "1.5px solid var(--sticker-border)" }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" style={{ boxShadow: "0 0 8px var(--green)" }} />
              the PicPop experience — one-way anonymity.
            </div>
          </div>


          <h1
            className="font-black text-[var(--text-primary)] leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}
          >
            <span className="fade-up block">PicPop.</span>
            <span className="fade-up delay-1 block text-outline">photo reacts.</span>
            <span className="fade-up delay-2 block" style={{ color: "var(--blue)" }}>totally anon.</span>
          </h1>


          <p className="fade-up delay-3 mt-6 text-[var(--text-muted)] max-w-sm mx-auto font-bold text-base sm:text-lg leading-relaxed">
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
              className="rounded-full px-10 py-5 font-black text-[var(--text-secondary)] text-base border border-[var(--border)] hover:border-[var(--purple)]/35 hover:text-[var(--text-primary)] transition-all duration-300 backdrop-blur-md bg-[var(--bg-card)]/40"
            >
              <span className="inline-flex items-center gap-1.5">How it works <ChevronDown className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE DIVIDER ── */}
      <div className="overflow-hidden border-y border-[var(--border)] py-6" style={{ background: "var(--surface-band)" }}>
        <div className="marquee-track">
          {Array(2).fill(MARQUEE_ITEMS).flat().map((item, i) => {
            const Icon = item.Icon;
            return (
              <span key={i} className="mx-10 text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex-shrink-0 inline-flex items-center gap-2 shadow-sm">
                <Icon className="w-4 h-4 shrink-0 transition-transform hover:scale-125" /> {item.label}
              </span>
            );
          })}
        </div>
      </div>


      {/* ================================================================
          SECTION 2: PLAY FEEDBACK GAMES
      ================================================================ */}
      <section id="play" className="relative bg-[var(--bg-primary)] min-h-screen flex items-center overflow-hidden py-24 px-4 sm:px-6">

        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
            style={{ background: "var(--blue)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
            style={{ background: "var(--pink)" }} />
        </div>

        {/* ── Left response image bubbles ── */}
        {[
          { src: "/images/response.webp", top: "18%", delay: "0.8s", rot: "-5deg" },
          { src: "/images/response1.webp", top: "54%", delay: "1.4s", rot: "3deg" },
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
          { src: "/images/response3.webp", top: "20%", delay: "1s", rot: "5deg" },
          { src: "/images/response4.webp", top: "55%", delay: "0.5s", rot: "-4deg" },
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
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">the feedback loop</p>
            <h2
              className="font-black leading-[0.88] tracking-tight text-[var(--text-primary)] mb-6"
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
              className="mt-8 mx-auto overflow-hidden rounded-2xl border"
              style={{
                height: "clamp(3rem, 8vw, 5.5rem)",
                background: "var(--slot-machine-bg)",
                borderColor: "var(--slot-machine-border)",
                maxWidth: "480px",
              }}
            >
              <div className="slot" style={{ height: "500%" }}>
                {[
                  { label: "photo drop", Icon: Camera, color: "var(--pink)" },
                  { label: "pixel check", Icon: ImageIcon, color: "var(--blue)" },
                  { label: "vibe check", Icon: Sparkles, color: "var(--purple)" },
                  { label: "anon react", Icon: Target, color: "var(--green)" },
                  { label: "honest look", Icon: Zap, color: "var(--text-primary)" },
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
                { src: "/images/response.webp", bg: "linear-gradient(135deg,#FF3D7F,#7C3AFF)", rot: "-3deg" },
                { src: "/images/response1.webp", bg: "linear-gradient(135deg,#7C3AFF,#00C8FF)", rot: "2deg" },
                { src: "/images/response2.webp", bg: "linear-gradient(135deg,#00C8FF,#FF3D7F)", rot: "-2deg" },
                { src: "/images/response3.webp", bg: "linear-gradient(135deg,#FF3D7F,#FFE500)", rot: "3deg" },
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
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden border-y border-[var(--border)]" style={{ background: "var(--surface-raised)" }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--pink)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--purple)" }} />

        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">the timeline</p>
              <h2 className="font-black text-[var(--text-primary)]" style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontFamily: "var(--font-nunito), 'Nunito'" }}>
                how they{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, var(--pink), var(--purple), var(--blue))" }}
                >
                  react
                </span>
              </h2>
              <p className="mt-4 text-[var(--text-muted)] text-base sm:text-lg font-bold">They drop an image. You get a notification. The chat begins.</p>
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
              <p className="mt-8 text-[var(--text-muted)] text-base sm:text-lg font-bold max-w-md mx-auto">
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
                      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3">{s.title}</h3>
                      <p className="text-[var(--text-muted)] font-bold text-sm leading-relaxed mb-6">{s.desc}</p>
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
          SECTION 3.3: SAFETY & MODERATION
      ================================================================ */}
      <section className="relative py-24 border-y border-[var(--border)] px-4 sm:px-6" style={{ background: "var(--surface-panel)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3 h-3" /> Secure Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] mb-6">Safe, Secure,<br/>and Sensible.</h2>
            <div className="space-y-4 text-[var(--text-muted)] font-bold text-sm leading-relaxed">
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
              <div className="relative p-8 rounded-[3rem] bg-[var(--bg-card)]/80 border border-[var(--border)] backdrop-blur-xl shadow-lg">
                 <ShieldCheck className="w-32 h-32 text-blue-400 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ================================================================
          SECTION 3.5: FAQ & KNOWLEDGE BASE (Anti-Low-Value-Content)
      ================================================================ */}
      <section id="faq" className="relative py-24 border-y border-[var(--border)] px-4 sm:px-6" style={{ background: "var(--surface-faq)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] mb-6">Frequently Asked Questions</h2>
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
              <div key={i} className={`rounded-[2rem] border border-[var(--border)] transition-all duration-300 ${openFaq === i ? "bg-[var(--bg-card)] shadow-md" : "bg-[var(--bg-secondary)]/60 hover:bg-[var(--bg-card)]/90"}`}>
                 <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                 >
                    <span className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--blue)] transition-colors">{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-dim)] transition-transform duration-300 ${openFaq === i ? "rotate-180 text-[var(--text-primary)]" : ""}`} />
                 </button>
                 {openFaq === i && (
                   <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[var(--text-muted)] leading-relaxed font-bold text-sm">
                        {item.a}
                      </p>
                   </div>
                 )}
              </div>
            ))}



          </div>

          <div className="mt-16 p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-[var(--border)] text-center">
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-4">Need more help?</h3>
            <p className="text-[var(--text-muted)] font-bold mb-8 text-sm">Check our full documentation or reach out to our team.</p>
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



      <Footer />


    </div>
  );
}
