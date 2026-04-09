"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Share2, MessageCircle, ImageIcon, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function GuidePage() {
  const steps = [
    {
      title: "Create Your Unique ID",
      desc: "First, sign up or log in to PicPop. Once authenticated, you can claim your 'Cool ID'—a personalized username that serves as your feedback portal address.",
      icon: CheckCircle2,
      color: "var(--pink)"
    },
    {
      title: "Share Your Portal Link",
      desc: "Copy your unique link (e.g., picpop.me/u/yourname) and share it on your social media bios, Twitter threads, or directly with friends on WhatsApp.",
      icon: Share2,
      color: "var(--blue)"
    },
    {
      title: "Receive Anonymous Drops",
      desc: "When someone visits your link, they can upload an image. You'll get a real-time notification in your inbox. The sender remains completely anonymous.",
      icon: ImageIcon,
      color: "var(--purple)"
    },
    {
      title: "Start the Conversation",
      desc: "Reply to the image drop to start a chat thread. You can ask for more details or give your thoughts, all while their identity stays hidden.",
      icon: MessageCircle,
      color: "var(--green)"
    }
  ];

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      {/* Background accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--blue)]/5 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--pink)]/5 blur-[120px] rounded-full z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Complete Platform Guide</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
            Mastering the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Feedback Loop.</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] font-bold max-w-2xl leading-relaxed">
            Welcome to the definitive guide on using PicPop. Whether you're a creator looking for critiques or just want to have fun with friends, this guide covers everything.
          </p>
        </div>

        {/* Step by Step */}
        <section className="mb-32">
          <h2 className="text-3xl font-black text-white mb-12">Getting Started in 4 Steps</h2>
          <div className="grid gap-6">
            {steps.map((step, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/05 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col md:flex-row gap-8 items-start">
                <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                   <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-30">Step 0{i+1}</div>
                  <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-[var(--text-muted)] font-bold leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips Section (More text!) */}
        <section className="mb-32">
          <div className="p-10 sm:p-16 rounded-[3rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10">
            <h2 className="text-3xl font-black text-white mb-8">Pro Tips for Better Feedback</h2>
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Optimize Your Bio
                </h4>
                <p className="text-white/50 text-sm font-bold leading-relaxed">
                  Don't just paste the link. Add a call-to-action like "Drop your honest thoughts on my latest shoot" or "Vibe check my new profile pic." Specificity breeds better interaction.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" /> Engagement is Key
                </h4>
                <p className="text-white/50 text-sm font-bold leading-relaxed">
                  Reply to every drop! Even a simple "thanks for the feedback" encourages more drops in the future. Remember, they took the time to contribute to your growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed FAQ for Guide */}
        <section className="mb-32 space-y-12">
           <h2 className="text-3xl font-black text-white text-center">In-Depth Knowledge Base</h2>
           <div className="grid gap-10">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white">How does one-way anonymity protect me?</h3>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                  Most anonymous apps have a problem: people use them to hide behind a mask and be negative. Our one-way system means that while the sender is anonymous to you, you are NOT anonymous to the platform. We maintain security logs to prevent systemic abuse, ensuring that anonymity is used for honesty, not harassment.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white">What type of images work best?</h3>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                  Higher resolution images generally receive better feedback. Avoid using text-heavy screenshots for 'vibe checks'; instead, use portraits, product shots, or design mockups where the visual impact is clear and immediate.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white">Can I use PicPop for my business or brand?</h3>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                  Yes, many creative agencies use PicPop for internal blind testing. By sharing the link within a team without revealing which designer made which version, you get truly unbiased feedback from your colleagues.
                </p>
              </div>
           </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-white text-black p-12 rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black mb-6">Ready to start?</h2>
          <p className="text-lg font-bold mb-8 opacity-70">Join thousands of creators getting real feedback every day.</p>
          <Link href="/login" className="px-10 py-5 bg-black text-white rounded-2xl font-black hover:scale-105 transition-transform inline-block">
             Claim Your ID Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
