"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Camera, Check, X } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        :root { --pink: #FF3D7F; --purple: #7C3AFF; --blue: #00C8FF; --green: #00FF94; }
      `}</style>

      <header className="border-b border-[var(--border)]">
        <nav className="flex h-14 items-center justify-between px-4 max-w-2xl mx-auto">
          <Link href="/" className="text-lg font-black">
            picpop<span className="text-[var(--pink)]">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">Sign in</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-[var(--text-primary)]">Send feedback to @{coolId}</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">Drop an image — anonymous</p>
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

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="w-full rounded-2xl p-12 border-2 border-dashed border-[var(--pink)]/50 hover:border-[var(--pink)] transition-colors flex flex-col items-center justify-center gap-4 disabled:opacity-50"
          style={{ background: "rgba(255,61,127,0.05)" }}
        >
          <Camera className="w-16 h-16 text-[var(--pink)]" />
          <span className="font-bold text-[var(--text-primary)]">
            {submitting ? "Uploading..." : "Drop image or tap to send"}
          </span>
        </button>
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
