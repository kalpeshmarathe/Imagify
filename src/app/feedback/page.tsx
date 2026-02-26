"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function FeedbackPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const id = setTimeout(() => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!profile?.coolId) {
        router.replace("/create-id");
        return;
      }
      router.replace("/dashboard");
    }, 0);
    return () => clearTimeout(id);
  }, [user, profile, loading, router]);

  return null;
}
