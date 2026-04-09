"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Share2, Bookmark, Image, Camera, Sparkles, Wand2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function VisualPostPage() {
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
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Photography</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5"><Clock className="w-4 h-4" /> 15 min read</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">March 20, 2026</span>
           </div>
           <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-10 tracking-tight">
              Mastering Visual Storytelling Through Feedback
           </h1>
           <div className="flex items-center justify-between py-8 border-y border-white/05">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden" />
                 <div>
                    <span className="block text-white font-black text-sm">Vikram Roy</span>
                    <span className="block text-white/30 text-[10px] font-black uppercase tracking-widest">Visual Director</span>
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
            Every image tells a story. But is it the story you intended? Understanding the delta between your intent and the audience's perception is the key to mastering visual storytelling.
          </p>

          <h2 className="text-white font-black text-3xl mb-8">Intent vs. Perception</h2>
          <p className="mb-8">
            As creators, we have "blind spots." We know the context of a photo, so we fill in the gaps mentally. An anonymous user seeing your image for 2 seconds on PicPop doesn't have that context. Their reaction is the purest data point you have for your visual communication.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
                <Camera className="w-10 h-10 text-pink-400 mb-6" />
                <h4 className="text-white font-black mb-4">Technical Prowess</h4>
                <p className="text-sm m-0">Does the lighting and composition support the emotional core of the image?</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10">
                <Wand2 className="w-10 h-10 text-blue-400 mb-6" />
                <h4 className="text-white font-black mb-4">Vibe Accuracy</h4>
                <p className="text-sm m-0">If you intended "mysterious" but got "confusing" reactions, your storytelling needs refinement.</p>
             </div>
          </div>

          <h2 className="text-white font-black text-3xl mb-8">A/B Testing Your Soul</h2>
          <p className="mb-8">
            Photography is deeply personal, but storytelling is collective. By sharing different edits (e.g., a warm vs. cold grading) on PicPop, you can see which version resonates more with a blind audience. This empirical approach to art is what separates professional visual directors from hobbyists.
          </p>

          <div className="p-10 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 mb-12">
             <Image className="w-8 h-8 text-indigo-400 mb-4" />
             <h4 className="text-white font-black text-xl mb-4">The Director's Rule</h4>
             <p className="text-white/50 text-base m-0 italic">
               "If people don't get the vibe in the first 0.5 seconds, the story hasn't started yet."
             </p>
          </div>

          <p className="mb-12">
            Use anonymous feedback to find your "hook." Is it the color? The expression? The negative space? Once you identify what the audience is reacting to, you can amplify it in your future work.
          </p>

          <h2 className="text-white font-black text-3xl mb-8">Summary</h2>
          <p>
            Visual storytelling is a dialogue. Stop monologuing and start using tools like PicPop to listen to what your images are actually saying to the world.
          </p>
        </article>

        <Footer />
      </div>
    </div>
  );
}
