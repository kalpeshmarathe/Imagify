"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Share2, Bookmark, BarChart3, Users, Zap, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function CreatorEconomyPostPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <Link href="/blog" className="flex items-center gap-2.5 group transition-transform hover:scale-105">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> back to blog
            </Link>
          </div>
        </header>

        {/* Article Meta */}
        <div className="mb-12">
           <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">Creator Economy</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5"><Clock className="w-4 h-4" /> 10 min read</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">March 28, 2026</span>
           </div>
           <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-10 tracking-tight">
              Why 'Vibe Checking' is the New Market Research
           </h1>
           <div className="flex items-center justify-between py-8 border-y border-white/05">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 overflow-hidden" />
                 <div>
                    <span className="block text-white font-black text-sm">Sonia Deshmukh</span>
                    <span className="block text-white/30 text-[10px] font-black uppercase tracking-widest">Growth Strategist</span>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Share2 className="w-4 h-4 text-white/60" /></button>
                 <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Bookmark className="w-4 h-4 text-white/60" /></button>
              </div>
           </div>
        </div>

        {/* Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-32 font-bold leading-relaxed text-white/60">
          <p className="lead text-xl text-white/70 mb-12">
            Traditional surveys are dead. In a world of infinite content, the "vibe" is the only metric that matters before a major launch. Here is how top influencers are using PicPop to stay ahead.
          </p>

          <h2 className="text-white font-black text-3xl mb-8">Beyond the Like Button</h2>
          <p className="mb-8">
            The like button is binary and low-confidence. It doesn't tell you *why* someone liked a post, or more importantly, what they didn't like. "Vibe checking" through anonymous image drops allows creators to get qualitative data at scale.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 group hover:border-orange-500/30 transition-colors">
                <BarChart3 className="w-10 h-10 text-orange-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black mb-4">Sentiment Over Stats</h4>
                <p className="text-sm m-0">Focusing on emotional resonance rather than just raw reach numbers.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 group hover:border-blue-500/30 transition-colors">
                <Users className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black mb-4">Deep Audience Fit</h4>
                <p className="text-sm m-0">Understanding if your new brand direction actually matches what your core fans love.</p>
             </div>
          </div>

          <p className="mb-12">
            Top creators on PicPop share unique links in their private stories, asking fans to "Drop a reaction image that describes my new thumbnail." The resulting grid of anonymous drops acts as a visual mood board of audience sentiment.
          </p>

          <div className="p-10 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 mb-12">
             <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-orange-400" />
                <h4 className="text-white font-black text-xl">The Beta Testing Effect</h4>
             </div>
             <p className="text-white/50 text-base m-0">
               By sharing 3 different concept logos or photos anonymously, influencers are essentially beta-testing their brand identity without risk to their public metrics.
             </p>
          </div>

          <h2 className="text-white font-black text-3xl mb-8">Predicting Virality</h2>
          <p>
            When 100 people anonymously send a "fire" or "wow" reaction to a draft photo, a creator knows they have a hit. If the reactions are lukewarm or confused, it's time to re-shoot. This "Visual Intelligence" is the secret weapon of the creator economy in 2026.
          </p>
        </article>

        <Footer />
      </div>
    </div>
  );
}
