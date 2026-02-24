"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, setDoc, enableNetwork } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COOL_ID_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function CreateIdPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [coolId, setCoolId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && profile?.coolId) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  const checkAvailability = async (id: string): Promise<boolean> => {
    if (!db) return false;
    const ref = doc(db, "usernames", id.toLowerCase());
    const snap = await getDoc(ref);
    return !snap.exists();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = coolId.trim();
    if (!trimmed) {
      setError("Pick something cool!");
      return;
    }

    if (!COOL_ID_REGEX.test(trimmed)) {
      setError("3–20 characters. Letters, numbers, underscores only.");
      return;
    }

    const lower = trimmed.toLowerCase();
    setSubmitting(true);

    try {
      if (db) await enableNetwork(db);
      const available = await checkAvailability(lower);
      if (!available) {
        setError(`"${trimmed}" is taken. Try another?`);
        setSubmitting(false);
        return;
      }

      if (!db || !user) {
        setError("Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const usernameRef = doc(db, "usernames", lower);

      await Promise.all([
        setDoc(userRef, { coolId: trimmed }, { merge: true }),
        setDoc(usernameRef, { uid: user.uid }),
      ]);

      await refreshProfile();
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Couldn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const suggestions = [
    "shadow_fox",
    "neon_dream",
    "pixel_vibes",
    "cool_cactus",
    "starry_nite",
    "glitch_king",
    "aura_flow",
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #0E0F1A 0%, #16182B 50%, #1F2240 100%)",
      }}
    >
      <div className="absolute top-20 left-[8%] text-4xl opacity-50 animate-float">✨</div>
      <div className="absolute bottom-24 right-[8%] text-4xl opacity-50 animate-float animation-delay-200">🔥</div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-lg font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
            }}
          >
            Imagify
          </Link>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Create your cool ID
        </h1>
        <p className="text-gray-400 mb-6">
          Choose a unique handle. 3–20 characters. Letters, numbers, underscores.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={coolId}
              onChange={(e) => {
                setCoolId(e.target.value);
                setError("");
              }}
              placeholder="e.g. neon_dream"
              className="w-full rounded-xl bg-[#1F2240] border border-white/10 px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A4DFF] focus:border-transparent"
              maxLength={20}
              autoFocus
              autoComplete="off"
              disabled={submitting}
            />
            <p className="mt-2 text-xs text-gray-500">{coolId.length}/20</p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-4 text-base font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
            }}
          >
            {submitting ? "Creating..." : "Claim my ID 🚀"}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-2">Need ideas?</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setCoolId(s);
                  setError("");
                }}
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
