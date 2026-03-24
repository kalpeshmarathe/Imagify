"use client";

import Link from "next/link";
import { ArrowLeft, ScrollText, AlertTriangle, Scale, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <style>{`
        .terms-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-6 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        <div className="terms-card p-8 sm:p-12 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/10">
              <ScrollText className="w-7 h-7 text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Terms of Service</h1>
              <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest mt-1 opacity-60">Updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-10">
            <p className="text-lg text-white/70 leading-relaxed font-bold">
              These Terms and Conditions (“Terms”) govern your access to and use of PicPop.me. By using our service, you agree to comply with these rules.
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">01</span>
                User Eligibility
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                Usage is restricted to individuals aged <strong>13 and older</strong>. By continuing, you represent that you meet or exceed this local age requirement and have the legal capacity to enter into these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">02</span>
                Anonymous Feedback Risk
              </h2>
              <div className="p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex gap-4 text-orange-200/80 text-[14px] leading-relaxed">
                 <AlertTriangle className="w-6 h-6 text-orange-400 shrink-0" />
                 <p className="font-bold">
                   You voluntarily accept the risk of receiving content that may be unexpected or critical. PicPop acts as a carrier and is not liable for the psychological impact of user-generated content.
                 </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">03</span>
                Prohibited Conduct
              </h2>
              <ul className="list-disc pl-5 space-y-3 text-white/50 font-bold">
                <li>Harassment, bullying, or targeted abuse of any user.</li>
                <li>Uploading illegal, non-consensual, or sexually explicit material.</li>
                <li>Attempting to deanonymize users or bypass platform security.</li>
                <li>Using the platform for spam or commercial solicitation.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">04</span>
                Intellectual Property
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                You retain ownership of the images you upload, but you grant PicPop a non-exclusive license to host and display them as requested by your interactions. You must have the rights to any images you share.
              </p>
            </section>

            <section className="space-y-4 p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/10">
              <h2 className="text-xl font-black text-purple-400 flex items-center gap-3">
                <Scale className="w-6 h-6" /> Limitation of Liability
              </h2>
              <p className="text-purple-100/60 text-sm italic font-bold">
                PicPop is provided "as is". We are not responsible for data loss, service interruptions, or any damages arising from your use of the platform.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black italic">
               Violation of these terms will result in immediate suspension.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
