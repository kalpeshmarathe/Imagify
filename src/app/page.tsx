import Link from "next/link";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { MobileNav } from "@/components/MobileNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ===== FLOATING FEEDBACK WIDGET (desktop/tablet) ===== */}
      <div className="fixed top-1/2 -translate-y-1/2 right-3 md:right-4 z-50 hidden md:block">
        <AnimateOnScroll direction="right" threshold={0} delay={800}>
          <div className="w-56 md:w-64 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <p className="text-sm font-semibold text-gray-900">Got feedback?</p>
            <p className="text-xs text-gray-500 mt-0.5">Drop it here. Anonymous.</p>
            <Link
              href="/dashboard"
              className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
              }}
            >
              Send feedback
            </Link>
          </div>
        </AnimateOnScroll>
      </div>

      {/* ===== FLOATING FEEDBACK BUTTON (mobile) ===== */}
      <Link
        href="/dashboard"
        className="fixed bottom-5 right-5 z-50 md:hidden rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
        style={{
          background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
          boxShadow: "0 4px 24px rgba(255, 79, 139, 0.5)",
        }}
      >
        Feedback ✨
      </Link>

      {/* ===== TOP NAV ===== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-md border-b border-white/5">
        <nav className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-base sm:text-lg font-bold bg-clip-text text-transparent transition-opacity hover:opacity-90"
            style={{
              backgroundImage: "linear-gradient(90deg, #FF4F8B, #8A4DFF, #3DA9FF)",
            }}
          >
            Imagify
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex text-sm gap-6">
              <Link href="#how" className="text-gray-400 hover:text-white transition-colors">How it works</Link>
              <Link href="#play" className="text-gray-400 hover:text-white transition-colors">Play</Link>
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
                }}
              >
                Give feedback
              </Link>
            </div>
            <MobileNav />
          </div>
        </nav>
      </header>

      {/* ===== SECTION 1: HERO (gradient bg) ===== */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-24 sm:pt-28 sm:pb-32"
        style={{
          background: "linear-gradient(135deg, #FF4F8B 0%, #8A4DFF 50%, #3DA9FF 100%)",
        }}
      >
        {/* Floating emoji-style elements - responsive sizing & positioning */}
        <div className="absolute top-16 sm:top-20 left-[5%] sm:left-[10%] text-4xl sm:text-5xl md:text-6xl opacity-80 animate-float hidden xs:block">📷</div>
        <div className="absolute top-24 sm:top-32 right-[8%] sm:right-[15%] text-3xl sm:text-5xl opacity-70 animate-float animation-delay-200 hidden sm:block">🔒</div>
        <div className="absolute bottom-24 sm:bottom-40 left-[5%] sm:left-[8%] text-3xl sm:text-4xl opacity-60 animate-float animation-delay-300">💬</div>
        <div className="absolute top-1/3 right-[5%] sm:right-[10%] text-3xl sm:text-5xl opacity-75 animate-float animation-delay-100 hidden sm:block">🖼️</div>
        <div className="absolute bottom-1/3 left-[8%] sm:left-[12%] text-3xl sm:text-4xl opacity-65 animate-float animation-delay-400">✨</div>

        {/* Rounded placeholder "photos" - hidden on very small screens */}
        <div className="absolute top-20 sm:top-24 left-[2%] sm:left-[5%] w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm hidden sm:block" />
        <div className="absolute bottom-24 sm:bottom-32 right-[3%] sm:right-[8%] w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/25 backdrop-blur-sm hidden md:block" />
        <div className="absolute top-1/2 right-[5%] sm:right-[12%] w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/15 hidden lg:block" />

        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-lg animate-fade-in-up">
            <span className="block">real feedback</span>
            <span className="block mt-1 animate-fade-in-up animation-delay-100">real vibes</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto animate-fade-in-up animation-delay-200">
            Anonymous. Image-based. No cap — just drop a pic and spill the tea.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 sm:mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 animate-fade-in-up animation-delay-300"
          >
            Drop your feedback 🚀
          </Link>
        </div>
      </section>

      {/* ===== SECTION 2: Play / Q&A games (black bg) ===== */}
      <section id="play" className="relative bg-black py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="block">play feedback</span>
              <span className="block">games</span>
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-400 text-base sm:text-lg">screenshot feedback · roast me · rate this · 3 words</p>
          </AnimateOnScroll>

          {/* Speech bubbles - with hover animation */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              "What would you change about this?",
              "Rate this 1-10 🔥",
              "Roast it ( respectfully )",
              "One word to describe this",
              "Best part? Worst part?",
              "Would you use this?",
            ].map((text, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <div className="transition-transform duration-300 hover:scale-105 cursor-default">
                  <div
                    className="relative rounded-2xl bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                    style={{
                      transform: `rotate(${(i % 3 - 1) * 2}deg)`,
                    }}
                  >
                    <p className="text-gray-800 text-xs sm:text-sm font-medium">{text}</p>
                    <div
                      className="absolute -bottom-2 left-4 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 bg-white rotate-45"
                      style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}
                    />
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Floating emojis */}
          <div className="absolute top-24 sm:top-40 right-[3%] sm:right-[5%] text-4xl sm:text-6xl opacity-60 animate-float hidden sm:block">💜</div>
          <div className="absolute bottom-24 sm:bottom-40 left-[3%] sm:left-[5%] text-3xl sm:text-5xl opacity-50 animate-float animation-delay-200 hidden sm:block">📸</div>
        </div>
      </section>

      {/* ===== SECTION 3: Get to know (gradient bg) ===== */}
      <section
        id="how"
        className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6"
        style={{
          background: "linear-gradient(135deg, #FF4F8B 0%, #8A4DFF 50%, #3DA9FF 100%)",
        }}
      >
        <div className="absolute top-16 sm:top-20 left-[5%] sm:left-[10%] text-4xl sm:text-5xl opacity-60 animate-float">🔮</div>
        <div className="absolute bottom-16 sm:bottom-20 right-[5%] sm:right-[10%] text-4xl sm:text-5xl opacity-60 animate-float animation-delay-200">💬</div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
              get to know
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 mt-1 sm:mt-2 drop-shadow-lg">
              your audience
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/90">
              Screenshots, memes, design mockups — show don&apos;t tell. Anonymous feedback that actually helps.
            </p>
          </AnimateOnScroll>

          {/* Central "profile" placeholder */}
          <AnimateOnScroll delay={200}>
            <div className="mt-10 sm:mt-12 flex justify-center">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-white/25 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl transition-transform duration-300 hover:scale-110"
              >
                📷
              </div>
            </div>
          </AnimateOnScroll>

          {/* More speech bubbles */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {["Love it!", "Fix this part 👆", "So fire"].map((t, i) => (
              <AnimateOnScroll key={i} delay={300 + i * 80}>
                <div
                  className="rounded-2xl bg-white px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3"
                  style={{ transform: `rotate(${(i - 1) * 3}deg)` }}
                >
                  <p className="text-gray-800 text-sm font-medium">{t}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: Join (black bg) ===== */}
      <section className="relative bg-black py-20 sm:py-24 md:py-28 px-4 sm:px-6">
        <div className="absolute top-24 sm:top-32 left-[5%] sm:left-[8%] text-4xl sm:text-5xl opacity-50 animate-float">✨</div>
        <div className="absolute bottom-24 sm:bottom-32 right-[5%] sm:right-[8%] text-4xl sm:text-5xl opacity-50 animate-float animation-delay-200">🚀</div>

        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              join the vibe
            </h2>
            <p className="mt-4 sm:mt-6 text-gray-400 text-base sm:text-lg">
              No sign up. No stress. Just vibes.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 sm:mt-10 inline-flex items-center justify-center gap-2 rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{
                background: "linear-gradient(90deg, #FF4F8B, #8A4DFF, #3DA9FF)",
                boxShadow: "0 0 60px rgba(138, 77, 255, 0.5)",
              }}
            >
              Start now ✨
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-black py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-sm font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
            }}
          >
            Imagify
          </span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-400">
            <Link href="#how" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#play" className="hover:text-white transition-colors">Play</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Give feedback</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">imagify.me — anonymous image feedback</p>
      </footer>
    </div>
  );
}
