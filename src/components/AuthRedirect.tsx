"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Redirects logged-in users from /login to dashboard or create-id.
 * Uses window.location.replace for reliable redirect with static export.
 */
export function AuthRedirect() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!profile) return;

    if (pathname === "/login") {
      const target = profile.coolId ? "/dashboard" : "/create-id";
      console.log("[AuthRedirect] redirecting to", target, "pathname=", pathname);
      window.location.replace(target);
    }
  }, [user, profile, loading, pathname]);

  return null;
}
