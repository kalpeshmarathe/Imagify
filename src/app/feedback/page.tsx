"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function FeedbackPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile?.coolId) {
      router.replace("/create-id");
      return;
    }
    router.replace("/dashboard");
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
