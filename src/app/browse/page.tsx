"use client";

import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { ExploreImages } from "@/components/ExploreImages";

export default function BrowsePage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
            <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
            <span className="text-xl font-black tracking-tighter text-white">picpop</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--purple)]/10 flex items-center justify-center border border-[var(--purple)]/20 shrink-0">
            <ImageIcon className="w-6 h-6 text-[var(--purple)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Browse ideas</h1>
            <p className="text-[var(--text-muted)] font-bold text-sm mt-2 leading-relaxed max-w-xl">
              Explore reaction images curated for feedback. Tap an image to open it in a new tab. To send feedback on someone’s link, open their PicPop URL and pick a reaction from here.
            </p>
          </div>
        </div>

        <ExploreImages
          onSubmitShared={async (item) => {
            if (typeof window !== "undefined" && item.feedbackImageUrl) {
              window.open(item.feedbackImageUrl, "_blank", "noopener,noreferrer");
            }
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
