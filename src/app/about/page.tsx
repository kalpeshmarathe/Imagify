"use client";

import Link from "next/link";
import { ArrowLeft, Info, HelpCircle, Shield, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <style>{`
        .about-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
        }
        .faq-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 1.5rem;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .faq-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 px-2">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-6 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        <div className="about-card p-8 sm:p-14 mb-16">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Info className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">The PicPop Story</h1>
              <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-[0.2em] mt-1.5 opacity-60">Visual Truth Since 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-12">
            <section className="space-y-5">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-400" />
                Unfiltered Interaction
              </h2>
              <p className="text-white/60 leading-relaxed text-lg font-bold">
                PicPop was born out of a simple idea: visual feedback should be as raw and honest as possible. We stripped away the "Perfect Life" aesthetic of traditional social media and replaced it with a private, image-centric feedback loop.
              </p>
              <p className="text-white/50 leading-relaxed font-bold">
                Our platform isn't about collecting likes or building an audience. It's about getting real reactions to your moments, outfits, experiments, and vibes from the people you share your link with.
              </p>
            </section>

            <section id="faq" className="space-y-8 pt-12 border-t border-white/05">
              <div className="flex items-center gap-3">
                 <HelpCircle className="w-7 h-7 text-green-400" />
                 <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
              </div>
              
              <div className="grid gap-4">
                <div className="faq-item">
                  <h3 className="text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Is it really anonymous?
                  </h3>
                  <p className="text-white/40 font-bold text-sm leading-relaxed">
                    Yes. When someone sends you feedback, PicPop hides their identity by default. Unless you both explicitly choose to reveal through chat, the sender remains anonymous. Even as an owner, you cannot see who sent it.
                  </p>
                </div>

                <div className="faq-item">
                  <h3 className="text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" /> Do I need an account to send?
                  </h3>
                  <p className="text-white/40 font-bold text-sm leading-relaxed">
                    Nope. Visitors to your link can drop images and text immediately. We believe in removing barriers to communication. Only the "Owner" needs a CoolID to manage their inbox.
                  </p>
                </div>

                <div className="faq-item">
                  <h3 className="text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Can I delete feedback?
                  </h3>
                  <p className="text-white/40 font-bold text-sm leading-relaxed">
                    As an owner, you have absolute control. You can delete any feedback, block specific senders (based on IP identification), or even turn off your link whenever you need a break.
                  </p>
                </div>

                <div className="faq-item">
                  <h3 className="text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Is my data secure?
                  </h3>
                  <p className="text-white/40 font-bold text-sm leading-relaxed">
                    We use industry-standard encryption and Firebase's secure storage. We don't sell your data or use your private images for AI training. Your privacy is the cornerstone of PicPop.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-12 border-t border-white/05">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-400" />
                Commitment to Safety
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                Anonymity should never be a shield for toxicity. We implement real-time moderation and give every owner the tools to block and report abusive behavior instantly. Our team actively monitors the health of the community to ensure PicPop remains a positive space for all users.
              </p>
              <div className="p-6 rounded-2xl bg-white/02 border border-blue-500/10">
                <p className="text-xs text-blue-300 font-bold leading-relaxed">
                  Have more questions or need to report a bug? Reach out at <a href="mailto:support@picpop.me" className="text-blue-400 underline decoration-blue-400/30 underline-offset-4 hover:decoration-blue-400">support@picpop.me</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
