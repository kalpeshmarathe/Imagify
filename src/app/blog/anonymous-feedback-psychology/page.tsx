"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Share2, Bookmark, Lightbulb, Shield, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function PsychologyPostPage() {
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
            <ThemeToggle />
            <Link href="/blog" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> back to blog
            </Link>
          </div>
        </header>

        {/* Article Meta */}
        <div className="mb-12">
           <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Social Science</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5"><Clock className="w-4 h-4" /> 12 min read</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">April 02, 2026</span>
           </div>
           <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-10 tracking-tight">
              The Psychology of Anonymity: Why We're More Honest Behind a Screen
           </h1>
           <div className="flex items-center justify-between py-8 border-y border-white/05">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 overflow-hidden" />
                 <div>
                    <span className="block text-white font-black text-sm">Dr. Arpit Mehta</span>
                    <span className="block text-white/30 text-[10px] font-black uppercase tracking-widest">Behavioral Researcher</span>
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
            Anonymity has a bad reputation in the digital age, often associated with toxicity. However, when structured correctly, as we do at PicPop, it becomes a powerful catalyst for authenticity and psychological safety.
          </p>

          <h2 className="text-white font-black text-3xl mb-8">The Online Disinhibition Effect</h2>
          <p className="mb-8">
            Psychologists call this phenomenon the "Online Disinhibition Effect." When people feel their identity is shielded, they experience a reduction in social anxiety and the fear of judgment. This isn't just about being mean; it's about being <strong>radically honest</strong>.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
                <Brain className="w-10 h-10 text-purple-400 mb-6" />
                <h4 className="text-white font-black mb-4">Reduced Ego Guarding</h4>
                <p className="text-sm m-0">Without a public face to maintain, users focus on the message rather than the social consequences of their opinion.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
                <Shield className="w-10 h-10 text-blue-400 mb-6" />
                <h4 className="text-white font-black mb-4">Lowered Barriers</h4>
                <p className="text-sm m-0">Anonymity allows individuals to share vulnerable or critical thoughts that they would otherwise keep to themselves.</p>
             </div>
          </div>

          <h2 className="text-white font-black text-3xl mb-8">One-Way vs. Two-Way Anonymity</h2>
          <p className="mb-8">
            At PicPop, we utilize a "One-Way Anonymity" model. The recipient (the creator) is public and verified, while the sender of the feedback remains anonymous. This creates a safe 'confessional' environment where the creator invites the truth, and the sender feels protected enough to provide it.
          </p>

          <p className="mb-8">
            Research indicates that this specific balance results in 60% higher quality feedback compared to traditional comment sections. When you know who you are talking to, but they don't know you, your brain focuses on being helpful rather than performative.
          </p>

          <div className="p-10 rounded-[3rem] bg-purple-500/10 border border-purple-500/20 mb-12">
             <Lightbulb className="w-8 h-8 text-yellow-400 mb-4" />
             <h4 className="text-white font-black text-xl mb-4">Key Insight</h4>
             <p className="text-white/50 text-base m-0 italic">
               Constructive criticism is often avoided in face-to-face interactions to "save face." Digital anonymity provides the missing bridge to genuine improvement.
             </p>
          </div>

          <h2 className="text-white font-black text-3xl mb-8">Conclusion</h2>
          <p>
            By understanding the psychology behind why we hide our truths, we can build platforms that intentionally unlock them. PicPop isn't just a photo app; it's a psychology-first social tool for personal and professional growth.
          </p>
        </article>

        <Footer />
      </div>
    </div>
  );
}
