"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, isConfigured, signInWithGoogle, signInWithFacebook, signInWithYahoo } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && profile?.coolId) {
      router.replace("/dashboard");
    } else if (user && !profile?.coolId) {
      router.replace("/create-id");
    }
  }, [user, profile, loading, router]);

  const handleSignIn = async (fn: () => Promise<void>, provider: string) => {
    try {
      await fn();
    } catch (err) {
      console.error(`${provider} sign-in failed:`, err);
      alert(`Sign-in failed. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #FF4F8B 0%, #8A4DFF 50%, #3DA9FF 100%)",
      }}
    >
      <div className="absolute top-16 left-[10%] text-4xl opacity-60 animate-float">🔐</div>
      <div className="absolute bottom-24 right-[10%] text-4xl opacity-60 animate-float animation-delay-200">✨</div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-block mb-8 text-lg font-bold bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, #fff, rgba(255,255,255,0.9))",
          }}
        >
          ← Imagify
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Get started
        </h1>
        <p className="text-white/90 mb-8">
          Sign in with your favorite account. No passwords needed.
        </p>

        {!isConfigured && (
          <div className="mb-6 rounded-xl bg-amber-500/20 border border-amber-500/50 px-4 py-3 text-sm text-amber-200">
            Add Firebase config to <code className="bg-black/30 px-1 rounded">.env.local</code> — see <code className="bg-black/30 px-1 rounded">.env.example</code>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSignIn(signInWithGoogle, "Google")}
            disabled={!isConfigured}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-gray-800 font-semibold transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleSignIn(signInWithFacebook, "Facebook")}
            disabled={!isConfigured}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-6 py-4 text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={() => handleSignIn(signInWithYahoo, "Yahoo")}
            disabled={!isConfigured}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#6001D2] px-6 py-4 text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Continue with Yahoo
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-white/80">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
