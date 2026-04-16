"use client";

import Link from "next/link";
import { ArrowLeft, Users, Target, Rocket, Sparkles, Heart, Shield, Zap } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--pink)]/10 blur-[120px] rounded-full z-0 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--purple)]/10 blur-[120px] rounded-full z-0 animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 group hover:bg-white/10 transition-all cursor-default">
            <Sparkles className="w-4 h-4 text-[var(--pink)] group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Our Story & Mission</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Honesty through <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink)] via-[var(--purple)] to-[var(--blue)]">Anonymity.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-bold leading-relaxed">
            PicPop was born out of a simple observation: we're often too polite to give real feedback, and too shy to ask for it.
          </p>
        </div>

        {/* The Problem & Solution */}
        <div className="grid sm:grid-cols-2 gap-8 mb-24">
          <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.05] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">The Filter Bubble</h3>
            <p className="text-[var(--text-muted)] font-bold leading-relaxed">
              Standard social media is an echo chamber of likes. It's designed for validation, not improvement. We realized that people need a safe space to share raw, honest reactions without the social pressure of their identity. Research shows that people are 70% more likely to give constructive criticism when they aren't worried about social friction.
            </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.05] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">The PicPop Way</h3>
            <p className="text-[var(--text-muted)] font-bold leading-relaxed">
              We've created a one-way anonymous feedback loop. You know exactly who you're asking, but they don't know who's asking. This reduces bias and unlocks the kind of "vibe checks" that just aren't possible anywhere else. Whether it's a new profile picture or a design mockup, you get the truth immediately.
            </p>
          </div>
        </div>

        {/* Detailed Vision Section */}
        <div className="mb-24 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-4">Why Anonymity Matters</h2>
            <p className="text-[var(--text-muted)] font-bold max-w-2xl mx-auto">
              In a world of constant surveillance, privacy is a feature, not a bug.
            </p>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-[var(--text-muted)] font-medium leading-relaxed space-y-6">
            <p>
              Anonymity has often been misunderstood as a tool for negativity. At PicPop, we see it differently. We see it as a catalyst for <strong>authenticity</strong>. When you remove the face from the feedback, you focus on the content itself rather than the social hierarchy.
            </p>
            <p>
              Our platform is designed to facilitate "constructive anonymity." This means we provide the tools for honest dialogue while maintaining a strict zero-tolerance policy for abuse. By providing a structured environment—where users drop images and others react—we create a purposeful interaction that goes beyond simple text-based chatting.
            </p>
          </div>
        </div>


        {/* Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-white mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs">Privacy First</h4>
              <p className="text-xs text-[var(--text-muted)] font-bold">Your identity is your power. We protect it with banking-grade security and anonymous session logic.</p>
            </div>
            <div className="text-center p-6 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs">Radical Honesty</h4>
              <p className="text-xs text-[var(--text-muted)] font-bold">We believe better decisions are made when we have access to the truth, unvarnished and real.</p>
            </div>
            <div className="text-center p-6 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-black text-white uppercase tracking-widest text-xs">User Agency</h4>
              <p className="text-xs text-[var(--text-muted)] font-bold">You control what you share, who you ask, and when you delete your data. It's your platform.</p>
            </div>
          </div>
        </div>

        {/* The Team / Future */}
        <div className="p-12 rounded-[3rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 mb-24">
          <h2 className="text-3xl font-black text-white mb-6">Built for the next generation of social.</h2>
          <div className="space-y-6 text-lg text-[var(--text-muted)] font-bold leading-relaxed mb-12">
            <p>
              PicPop is a project driven by the desire to bring authenticity back to the web. We are a small, dedicated team of developers and designers based in India, working to build tools that matter. 
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-12">
             <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black text-sm">Kalpesh Marathe</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Founder & Lead Dev</p>
             </div>
             <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black text-sm">Maya Venu</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Head of Design</p>
             </div>
             <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black text-sm">Arpit Mehta</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Security & Data</p>
             </div>
          </div>

          <div className="space-y-6 text-lg text-[var(--text-muted)] font-bold leading-relaxed mb-12 border-t border-white/05 pt-12">
            <p>
              Our platform is built using modern web standards to ensure speed and security. We leverage Next.js for high-performance rendering, Firebase for real-time data synchronization, and AI-driven moderation to keep the community safe. 
            </p>
            <p>
              We believe that the future of social interaction isn't just about sharing everything with everyone; it's about sharing the right things with the right level of privacy.
            </p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black hover:scale-105 active:scale-95 transition-all">
            Get in touch
          </Link>
        </div>


        {/* Footer info */}
        <div className="text-center text-[var(--text-muted)] mb-12">
            <p className="text-xs font-black uppercase tracking-[0.3em]">PicPop © 2026 — Built with Passion</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
