"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Eye, Image as ImageIcon, X, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, ensureFirestoreNetwork } from "@/lib/firebase";
import {
  requestNotificationPermission,
  saveFcmToken,
} from "@/lib/notifications";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";

export interface NotificationItem {
  id: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "anonymous_feedback" | "visit";
  imageId?: string;
  coolId?: string;
  feedbackImageUrl?: string;
  threadId?: string;
}

function formatTimeAgo(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

interface NotificationBellProps {
  className?: string;
  onGuestClick?: () => void;
}

export function NotificationBell({ className, onGuestClick }: NotificationBellProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"idle" | "loading" | "enabled" | "denied" | "unsupported">("idle");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(
        Notification.permission === "granted" ? "enabled" : Notification.permission === "denied" ? "denied" : "idle"
      );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!db || !user?.uid) {
      setLoading(false);
      setNotifications([]);
      return;
    }
    const firestore = db;
    let unsub: (() => void) | undefined;
    const run = async () => {
      try {
        await ensureFirestoreNetwork();
        const q = query(
          collection(firestore, "notifications"),
          where("recipientId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        unsub = onSnapshot(
          q,
          (snap) => {
            const list: NotificationItem[] = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                recipientId: data.recipientId || "",
                message: data.message || "",
                isRead: data.isRead === true,
                createdAt: toIsoString(data.createdAt),
                type: data.type === "visit" ? "visit" : "anonymous_feedback",
                imageId: data.imageId,
                coolId: data.coolId || "post",
                feedbackImageUrl: data.feedbackImageUrl,
                threadId: data.threadId,
              };
            });
            setNotifications(list);
            setLoading(false);
          },
          (err) => {
            setLoading(false);
            if (err?.code !== "failed-precondition") console.warn("Notifications listener:", err);
          }
        );
      } catch {
        setNotifications([]);
        setLoading(false);
      }
    };
    run();
    return () => unsub?.();
  }, [user?.uid]);

  const handleToggle = () => {
    if (!user) {
      if (onGuestClick) {
        onGuestClick();
      } else {
        toast.info("Log in to see who's visiting your profile!");
        router.push("/login");
      }
      return;
    }
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0 || !db) return;
    const database = db;
    try {
      const batch = writeBatch(database);
      unread.forEach((n) => {
        batch.update(doc(database, "notifications", n.id), { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0 || !db) return;
    if (!confirm("Clear all notifications?")) return;
    const database = db;
    try {
      const batch = writeBatch(database);
      notifications.forEach((n) => {
        batch.delete(doc(database, "notifications", n.id));
      });
      await batch.commit();
      toast.success("Notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    setOpen(false);
    if (!n.isRead && db) {
      const database = db;
      try {
        await writeBatch(database).update(doc(database, "notifications", n.id), { isRead: true }).commit();
      } catch {}
    }
    if (n.threadId) {
      router.push(`/inbox?thread=${n.threadId}`);
    } else if (n.imageId) {
      router.push(`/f?imageId=${n.imageId}`);
    } else {
      router.push("/inbox");
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all group"
      >
        <Bell className={`w-5 h-5 transition-transform group-active:scale-90 ${hasUnread ? "animate-swing" : ""}`} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--pink)] rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-[320px] sm:w-[380px] max-h-[500px] flex flex-col bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">Vibrations</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Recent Activity</p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <button onClick={handleMarkAllRead} className="p-2 rounded-xl hover:bg-white/5 text-[var(--pink)] transition-colors" title="Mark all read">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-colors" title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--pink)] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 px-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 opacity-20">
                  <Bell className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white/40">Silence is golden.</p>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">No new vibes right now</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex items-start gap-4 px-6 py-4 transition-all text-left group/item relative ${
                      !n.isRead ? "bg-[var(--pink)]/[0.03] hover:bg-[var(--pink)]/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[var(--pink)] shadow-[0_0_10px_var(--pink)]" />}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300"
                      style={{
                        background:
                          n.type === "visit"
                            ? "linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,200,255,0.05))"
                            : "linear-gradient(135deg, rgba(255,61,127,0.2), rgba(124,58,255,0.15))",
                        border: n.type === "visit" ? "1px solid rgba(0,200,255,0.2)" : "1px solid rgba(255,61,127,0.2)",
                      }}
                    >
                      {n.type === "visit" ? (
                        <Eye className="w-5 h-5 text-[var(--blue)]" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[var(--pink)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-black tracking-tight leading-snug mb-0.5 ${!n.isRead ? "text-white" : "text-white/60"}`}>
                        {n.type === "visit" ? "Someone's peeking at your profile" : "A new vibe was just dropped"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-[var(--pink)] uppercase tracking-widest opacity-60">
                          @{n.coolId}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href="/inbox"
            onClick={() => setOpen(false)}
            className="block w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[var(--pink)] hover:bg-white/[0.02] transition-all border-t border-white/5"
          >
            View Full Inbox
          </Link>
        </div>
      )}

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-12deg); }
          60% { transform: rotate(8deg); }
          80% { transform: rotate(-4deg); }
        }
        .animate-swing { animation: swing 1s ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
