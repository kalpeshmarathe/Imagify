"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  requestNotificationPermission,
  saveFcmToken,
  clearFcmToken,
  onForegroundMessage,
} from "@/lib/notifications";

interface NotificationEnableProps {
  userId: string;
}

export function NotificationEnable({ userId }: NotificationEnableProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "enabled" | "denied" | "unsupported">("idle");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    setStatus(perm === "granted" ? "enabled" : perm === "denied" ? "denied" : "idle");
  }, []);

  // Re-save FCM token when user already has permission (token can change/expire)
  useEffect(() => {
    if (status !== "enabled" || !userId) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      try {
        const token = await requestNotificationPermission();
        if (token && !cancelled) await saveFcmToken(userId, token);
      } catch {
        /* ignore */
      }
    };
    run();
    return () => { cancelled = true; };
  }, [userId, status]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    onForegroundMessage((payload) => {
      const body = payload.notification?.body ?? payload.data?.body;
      const title = payload.notification?.title ?? payload.data?.title;
      if (body || title) {
        setToast(body || title || "New reaction on your post");
        setTimeout(() => setToast(null), 4000);
      }
    }).then((fn) => { unsub = fn; });
    return () => unsub?.();
  }, []);

  const handleEnable = async () => {
    if (status === "enabled" || status === "unsupported") return;
    setStatus("loading");
    try {
      const token = await requestNotificationPermission();
      if (token) {
        await saveFcmToken(userId, token);
        setStatus("enabled");
      } else {
        setStatus(Notification.permission === "denied" ? "denied" : "idle");
      }
    } catch (err) {
      console.error("Notification enable failed:", err);
      setStatus("idle");
    }
  };

  if (status === "unsupported") return null;

  return (
    <div className="relative">
      {toast && (
        <div
          className="fixed bottom-6 left-4 right-4 max-w-[400px] mx-auto z-[100] rounded-xl px-4 py-3 text-sm font-bold shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--pink), var(--purple))",
            color: "#fff",
          }}
        >
          <span className="inline-flex items-center gap-2"><Bell className="w-4 h-4 shrink-0" /> {toast}</span>
        </div>
      )}
      {status === "enabled" ? (
        <span className="text-xs font-bold text-[var(--green)] flex items-center gap-1">
          <Bell className="w-3.5 h-3.5 shrink-0" /> on
        </span>
      ) : status === "denied" ? (
        <span className="text-xs font-bold text-white/40">notifications blocked</span>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={status === "loading"}
          className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 disabled:opacity-50"
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          {status === "loading" ? "..." : "enable"}
        </button>
      )}
    </div>
  );
}
