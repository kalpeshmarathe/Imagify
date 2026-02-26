"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Camera, Check, X, Heart, Sparkles } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, ensureFirestoreNetwork } from "@/lib/firebase";
import { uploadFeedbackImage } from "@/lib/image-upload";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

const SIGN_IN_NUDGE_INTERVAL_MS = 20_000;

function UserFeedbackContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const [coolId, setCoolId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSignInNudge, setShowSignInNudge] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Track visit when someone views the feedback page (not when owner views own link)
  useEffect(() => {
    if (!db || !userId || !coolId) return;
    if (authUser?.uid === userId) return; // Don't track when owner views own link
    const firestore = db;
    const run = async () => {
      try {
        await ensureFirestoreNetwork();
        await addDoc(collection(firestore, "visits"), {
          recipientId: userId,
          coolId,
          type: "visit",
          createdAt: new Date().toISOString(),
        });
      } catch {
        /* ignore visit tracking */
      }
    };
    run();
  }, [userId, coolId, authUser?.uid]);

  // Show sign-in nudge every 20 sec when user is not logged in
  useEffect(() => {
    if (authLoading || authUser || !userId) return;
    const id = setInterval(() => setShowSignInNudge(true), SIGN_IN_NUDGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [authLoading, authUser, userId]);

  useEffect(() => {
    const fromPath = (pathname || "").replace(/^\/u\/?/, "").split("/")[0] || "";
    const fromQuery = searchParams.get("user") || "";
    const id = (fromPath || fromQuery).trim().toLowerCase();
    setCoolId(id);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!db || !coolId) {
      setLoading(false);
      return;
    }
    const firestore = db;
    let mounted = true;
    const run = async () => {
      try {
        await ensureFirestoreNetwork();
        const usernameRef = doc(firestore, "usernames", coolId);
        const snap = await getDoc(usernameRef);
        if (mounted && snap.exists()) {
          setUserId((snap.data() as { uid: string }).uid);
        } else {
          setUserId(null);
        }
      } catch {
        if (mounted) setUserId(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [coolId]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId || !db) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }
    setSubmitting(true);
    try {
      await ensureFirestoreNetwork();
      const feedbackId = crypto.randomUUID();
      const url = await uploadFeedbackImage(file, feedbackId);

      const { httpsCallable } = await import("firebase/functions");
      const { getAppFunctions } = await import("@/lib/functions");
      const functions = getAppFunctions();
      if (!functions) throw new Error("Firebase not configured");

      const submitFeedback = httpsCallable<
        { recipientId: string; feedbackImageUrl: string },
        { success: boolean }
      >(functions, "submitFeedback");

      await submitFeedback({
        recipientId: userId,
        feedbackImageUrl: url,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to send.";
      if (msg.includes("restricted") || msg.includes("cannot submit")) {
        setSubmitted(true);
      } else {
        console.error(err);
        toast.error("Failed to send. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--pink)", borderRightColor: "var(--purple)" }}
        />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4">
        <p className="text-[var(--text-muted)] font-semibold text-center">User @{coolId || "?"} not found.</p>
        <Link href="/" className="mt-4 text-[var(--pink)] hover:underline font-bold">Back to home</Link>
      </div>
    );
  }

  const RESPONSE_PREVIEWS = [
    { src: "/images/response.png", label: "for you", bg: "linear-gradient(135deg,#FF3D7F,#7C3AFF)" },
    { src: "/images/response1.png", label: "love it", bg: "linear-gradient(135deg,#7C3AFF,#00C8FF)" },
    { src: "/images/response2.png", label: "vibes", bg: "linear-gradient(135deg,#00C8FF,#FF3D7F)" },
    { src: "/images/response3.jpg", label: "princess", bg: "linear-gradient(135deg,#FF3D7F,#FFE500)" },
    { src: "/images/response4.jpg", label: "chalak", bg: "linear-gradient(135deg,#00C8FF,#7C3AFF)" },
    { src: "/images/response5.png", label: "adventure", bg: "linear-gradient(135deg,#00FF94,#00C8FF)" },
    { src: "/images/response6.png", label: "explorer", bg: "linear-gradient(135deg,#7C3AFF,#FFE500)" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden" style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        :root { --pink: #FF3D7F; --purple: #7C3AFF; --blue: #00C8FF; --green: #00FF94; --yellow: #FFE500; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float { animation: float 4s ease-in-out infinite; }
        .preview-scroll::-webkit-scrollbar { display: none; }
        .preview-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Soft gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-[0.12]" style={{ background: "var(--purple)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[80px] opacity-[0.1]" style={{ background: "var(--pink)" }} />
      </div>

      <header className="relative navbar-glass border-b border-[var(--border)]">
        <nav className="flex h-14 items-center justify-between px-4 max-w-2xl mx-auto">
          <Link href="/" className="text-lg font-black tracking-tight">
            picpop<span className="text-[var(--pink)]">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Sign in</Link>
          </div>
        </nav>
      </header>

      <main className="relative max-w-xl mx-auto px-4 py-10 sm:py-14">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(255,61,127,0.1)", border: "1px solid rgba(255,61,127,0.2)" }}>
            <Heart className="w-3.5 h-3.5 text-[var(--pink)]" /> 100% anonymous
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Send feedback to <span className="text-[var(--pink)]">@{coolId}</span></h1>
          <p className="text-sm text-[var(--text-muted)] mt-2 font-semibold">Drop an image — real reactions, no names</p>
        </div>

        {/* Image reaction preview strip */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] mb-4 text-center">Reactions like these</p>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 preview-scroll">
            {RESPONSE_PREVIEWS.map((r, i) => (
              <div key={i} className="flex-shrink-0 group cursor-default">
                <div className="p-[2px] rounded-xl" style={{ background: r.bg }}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.src} alt={r.label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold text-center mt-1 text-[var(--text-muted)] truncate max-w-[3.5rem]">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {showSignInNudge && !authUser && !submitted && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowSignInNudge(false)}
          >
            <div
              className="relative max-w-sm w-full rounded-2xl p-6 text-center border border-[var(--border)]"
              style={{ background: "var(--bg-card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowSignInNudge(false)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-[var(--text-primary)] mb-2">Get your own link</h2>
              <p className="text-sm text-[var(--text-primary)] font-semibold mb-2">
                You&apos;re sending feedback to @{coolId}. Want the same? Get honest reactions on your photos — no awkward asks.
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-5">
                Your link. Share anywhere. Friends react anonymously. Takes 10 seconds.
              </p>
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl font-black text-white text-center"
                style={{
                  background: "linear-gradient(135deg, var(--pink), var(--purple))",
                  boxShadow: "0 4px 20px rgba(255,61,127,0.3)",
                }}
              >
                Sign in to get my link →
              </Link>
              <button
                type="button"
                onClick={() => setShowSignInNudge(false)}
                className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
            onClick={() => setSubmitted(false)}
          >
            <div
              className="relative max-w-sm w-full rounded-2xl p-6 text-center border border-[var(--border)]"
              style={{ background: "var(--bg-card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)]"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "rgba(0,255,148,0.2)" }}>
                <Check className="w-8 h-8 text-[var(--green)]" />
              </div>
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">Thank you!</h2>
              <p className="text-sm text-[var(--text-primary)] font-semibold mb-2">
                You just gave @{coolId} honest feedback. Imagine getting that for your own photos — no awkward asks.
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Your own link. Share on Instagram, WhatsApp, anywhere. Friends send reactions anonymously — they never have to sign up. You get an inbox full of real feedback.
              </p>
              <p className="text-xs font-bold text-[var(--pink)] mb-5">
                Takes 10 seconds.
              </p>
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl font-black text-white text-center"
                style={{
                  background: "linear-gradient(135deg, var(--pink), var(--purple))",
                  boxShadow: "0 4px 20px rgba(255,61,127,0.3)",
                }}
              >
                Get my free link →
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                I&apos;ll pass for now
              </button>
            </div>
          </div>
        )}

        {/* Upload zone — gradient border like home page cards */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <div
          className="p-[3px] rounded-2xl transition-all duration-300 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--pink), var(--purple), var(--blue))",
            boxShadow: "0 8px 32px rgba(255,61,127,0.2)",
          }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="w-full rounded-[14px] p-10 sm:p-12 flex flex-col items-center justify-center gap-4 disabled:opacity-50 transition-opacity relative overflow-hidden"
            style={{ background: "var(--bg-card)" }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center float"
              style={{
                background: "linear-gradient(135deg, rgba(255,61,127,0.12), rgba(124,58,255,0.12))",
                border: "2px dashed rgba(255,61,127,0.35)",
              }}
            >
              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--pink)]" />
            </div>
            <div className="text-center">
              <span className="font-black text-[var(--text-primary)] block text-lg">
                {submitting ? "Uploading..." : "Drop image or tap to send"}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold mt-1 block">Screenshot, selfie, meme — anything works</span>
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--pink)]" /> No sign up. No limits. Just vibes.
        </p>
      </main>
    </div>
  );
}

export default function UserFeedbackClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--pink)" }} />
        </div>
      }
    >
      <UserFeedbackContent />
    </Suspense>
  );
}
