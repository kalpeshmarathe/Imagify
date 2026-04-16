"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Footer } from "@/components/Footer";

const BLOG_POSTS = [
  {
    id: "aesthetic-wallpapers-2026",
    title: "10 Aesthetic Wallpaper Trends Dominating 2026",
    excerpt: "From glassmorphism to organic 3D textures, discover the visual styles that are defining digital aesthetics this year and how to use them in your feedback loops.",
    date: "April 05, 2026",
    readTime: "8 min read",
    tag: "Design Trends"
  },
  {
    id: "anonymous-feedback-psychology",
    title: "The Psychology of Anonymity: Why We're More Honest Behind a Screen",
    excerpt: "Understanding the social disinhibition effect and how one-way anonymity can actually build stronger, more authentic connections in creative circles.",
    date: "April 02, 2026",
    readTime: "12 min read",
    tag: "Social Science"
  },
  {
    id: "creator-economy-vibe-checks",
    title: "Why 'Vibe Checking' is the New Market Research for Influencers",
    excerpt: "Traditional surveys are dead. Discover how top creators are using PicPop and image-based feedback to gauge audience sentiment before a major launch.",
    date: "March 28, 2026",
    readTime: "10 min read",
    tag: "Creator Economy"
  },
  {
    id: "visual-storytelling-guide",
    title: "Mastering the Art of Visual Storytelling Through Feedback",
    excerpt: "A deep dive into how subtle photo edits and framing choices change the narrative of your brand, and how to ask the right questions to get better critiques.",
    date: "March 20, 2026",
    readTime: "15 min read",
    tag: "Photography"
  }
];

export default function BlogPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      {/* Background Accent */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--blue)]/20 blur-[150px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--purple)]/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> back
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <BookOpen className="w-4 h-4 text-[var(--pink)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">The Insight Journal</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white mb-8 tracking-tight leading-[0.9]">
            Visual <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink)] via-[var(--purple)] to-[var(--blue)]">Intelligence.</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] font-bold max-w-2xl leading-relaxed">
            Exploring the intersection of design, psychology, and the creator economy. High-quality insights for the visual-first world.
          </p>
        </div>

        {/* Featured Card */}
        <div className="mb-24 group relative">
           <div className="p-1 sm:p-2 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10">
              <div className="relative h-[400px] w-full rounded-[2.8rem] overflow-hidden bg-white/5 flex flex-col justify-end p-8 sm:p-16">
                 <div className="absolute top-12 right-12 opacity-10"><Sparkles className="w-32 h-32" /></div>
                 <div className="max-w-2xl relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-pink-500/20">Featured Insight</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight group-hover:text-[var(--pink)] transition-colors cursor-pointer">The Invisible Mirror: How Anonymous Feedback Reshapes Self-Perception</h2>
                    <p className="text-white/40 font-bold mb-8 line-clamp-2">A comprehensive study on how removing identity barriers in digital communication allows for higher-order cognitive processing and reduced social anxiety.</p>
                    <div className="flex items-center gap-6">
                       <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/20"><Clock className="w-4 h-4" /> 20 min read</span>
                       <button className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs group/btn">Read Article <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-2" /></button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-wrap gap-4 mb-16">
           {["All Posts", "Design Trends", "Psychology", "Social Strategy", "Platform News"].map((c, i) => (
             <button key={i} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${i === 0 ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}>
               {c}
             </button>
           ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-32">
          {BLOG_POSTS.map((post, i) => (
             <Link href={`/blog/${post.id}`} key={i} className="group flex flex-col p-8 sm:p-12 rounded-[3.1rem] bg-white/[0.02] border border-white/05 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-10">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{post.tag}</span>
                   <TrendingUp className="w-5 h-5 text-white/10 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[var(--blue)] transition-colors">{post.title}</h3>
                <p className="text-white/40 font-bold text-sm leading-relaxed mb-10 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/05">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{post.date}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{post.readTime}</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
             </Link>
          ))}
        </div>

        {/* Newsletter / CTA */}
        <div className="p-12 sm:p-20 rounded-[4rem] bg-gradient-to-br from-[var(--blue)]/10 to-transparent border border-[var(--blue)]/20 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingUp className="w-40 h-40" /></div>
           <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">Stay Ahead of the Vibe.</h2>
           <p className="text-white/40 font-bold mb-10 max-w-lg mx-auto leading-relaxed text-lg">Weekly deep-dives into creative culture, anonymity research, and digital aesthetics. No spam, just intelligence.</p>
           <form className="max-w-md mx-auto relative group">
              <input 
                type="email" 
                placeholder="you@email.com" 
                className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-[var(--blue)] transition-all placeholder:text-white/20" 
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
                Join List
              </button>
           </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
