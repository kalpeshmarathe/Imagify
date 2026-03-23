"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Bell, Eye, Image as ImageIcon, X, Trash2, CheckCircle2, ChevronRight, CircleUser } from "lucide-react";
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
import { getSessionId } from "@/lib/session-utils";
import { listenForRealtimeMessages } from "@/lib/realtime-notifications";
import { ref, getDatabase, onValue } from "firebase/database";

export interface NotificationItem {
  id: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "anonymous_feedback" | "visit" | "owner_reply";
  imageId?: string;
  coolId?: string;
  feedbackImageUrl?: string;
  threadId?: string;
}

function formatTimeAgo(iso: string) {
  try {
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
  } catch {
    return "recently";
  }
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
  unreadCountOverride?: number;
  ownerName?: string;
}

import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

export function NotificationBell({ className, onGuestClick, unreadCountOverride, ownerName }: NotificationBellProps) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Use our unified unread hook
  const { unreadNotifications, loading: rtdbLoading } = useUnreadNotifications(user?.uid);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [modalMessages, setModalMessages] = useState<any[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine Firestore (permanent/history) + RTDB (instant unreads)
  const allNotifications = useMemo(() => {
    // We only show unreads in this bell list anyway
    const combined = [...notifications, ...unreadNotifications] as any[];
    const map = new Map<string, any>();

    combined.forEach(n => {
      const existing = map.get(n.id);
      // Keep the most recent or the unread one
      if (!existing || (!n.isRead && existing.isRead)) {
        map.set(n.id, n);
      }
    });

    return Array.from(map.values())
      .filter(n => !n.isRead) // Filter strictly for unread as requested
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, unreadNotifications]);

  const unreadCount = unreadCountOverride ?? allNotifications.length;
  const hasUnread = unreadCount > 0;

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
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-notifications", handleOpen);
    return () => window.removeEventListener("open-notifications", handleOpen);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const run = async () => {
      const sid = getSessionId();
      if (!db || (!user?.uid && !sid)) {
        setLoading(false);
        return;
      }
      try {
        await ensureFirestoreNetwork();
        const firestore = db;
        const q = user?.uid
          ? query(collection(firestore, "notifications"), where("recipientId", "==", user.uid), orderBy("createdAt", "desc"), limit(50))
          : query(collection(firestore, "notifications"), where("recipientSessionId", "==", sid), orderBy("createdAt", "desc"), limit(50));

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
                type: data.type === "visit" ? "visit" : data.type === "owner_reply" ? "owner_reply" : "anonymous_feedback",
                imageId: data.imageId,
                coolId: data.coolId || (data.type === "visit" ? "post" : "anonymous"),
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

  // Guest-specific notifications (Realtime Database)
  useEffect(() => {
    if (user?.uid) return;
    const sid = getSessionId();
    if (!sid) return;

    const bootstrap = async () => {
      const { getAllMessages } = await import("@/lib/realtime-notifications");
      let history = await getAllMessages(sid);

      // If of a specific profiles' page, only show those replies to guest
      if (ownerName) {
        history = history.filter((h: any) =>
          (h.coolId && h.coolId.toLowerCase() === ownerName.toLowerCase()) ||
          (h.ownerName && h.ownerName.toLowerCase() === ownerName.toLowerCase()) ||
          (!h.coolId && !h.ownerName) // Fallback for older messages
        );
      }

      if (history.length > 0) {
        setNotifications((prev) => {
          const combined = [...prev];
          history.forEach((h: any) => {
            if (!combined.find((n) => n.id === h.id)) {
              const mapped: NotificationItem = {
                id: h.id,
                recipientId: "guest",
                message: h.message,
                isRead: h.isRead === true || h.read === true,
                createdAt: h.createdAt,
                type: "owner_reply",
                threadId: h.threadId,
                feedbackImageUrl: h.imageUrl,
                coolId: h.coolId || h.ownerName || ownerName || profile?.coolId || "Admin",
              };
              combined.push(mapped);
            }
          });
          return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
        });
        setLoading(false);
      }
    };
    bootstrap();

    const unsubscribe = listenForRealtimeMessages(sid, (msg) => {
      // If on a specific owner page, ignore messages from other owners
      if (ownerName) {
        const fromOwner = (msg.coolId && msg.coolId.toLowerCase() === ownerName.toLowerCase()) ||
          (msg.ownerName && msg.ownerName.toLowerCase() === ownerName.toLowerCase());
        if (!fromOwner && (msg.coolId || msg.ownerName)) return;
      }

      const isRead = msg.isRead === true || msg.read === true;
      const coolId = msg.coolId || msg.ownerName || ownerName || profile?.coolId || "owner";

      setNotifications((prev) => {
        if (prev.find((n) => n.id === msg.id)) return prev;

        // SIDE EFFECT MUST BE OUTSIDE - But we only want to toast if it's NOT already in prev
        // Since we are outside here, we can't easily check prev.
        // However, onChildAdded for a new session usually doesn't have much history.
        return [
          {
            id: msg.id,
            recipientId: "guest",
            message: msg.message,
            isRead,
            createdAt: msg.createdAt,
            type: "owner_reply" as const,
            threadId: msg.threadId,
            feedbackImageUrl: msg.imageUrl,
            coolId: coolId || "Admin",
          },
          ...prev
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
      });

      if (!isRead) {
        toast.success(`📬 New vibe from @${coolId}: ${msg.message || "Sent an attachment"}`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, ownerName, toast, profile?.coolId]);

  // Legacy RTDB listener removed - now handled by useUnreadNotifications hook

  // Lock scroll when modal is open
  useEffect(() => {
    if (activeSessionId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeSessionId]);

  const handleToggle = () => setOpen(!open);

  const handleMarkAllRead = async () => {
    if (!user) {
      const sid = getSessionId();
      if (sid) {
        const unread = notifications.filter(n => !n.isRead);
        const { markMessageAsRead } = await import("@/lib/realtime-notifications");
        unread.forEach(n => markMessageAsRead(sid, n.id));
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      return;
    }
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0 || !db) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db!, "notifications", n.id), { isRead: true }));
      await batch.commit();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    // marking as read
    if (!n.isRead) {
      if (user && db) {
        try {
          // 1. Mark in Firestore
          await writeBatch(db).update(doc(db, "notifications", n.id), { isRead: true }).commit();
          // 2. Mark in RTDB for instant update
          const { markOwnerNotificationAsRead } = await import("@/lib/realtime-notifications");
          await markOwnerNotificationAsRead(user.uid, n.id);
        } catch (e) {
          console.warn("Mark read error:", e);
        }
      } else {
        const sid = getSessionId();
        if (sid) {
          const { markMessageAsRead } = await import("@/lib/realtime-notifications");
          await markMessageAsRead(sid, n.id);
        }
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      }
    }

    if (!user) {
      // If we have a custom guest click handler (like on the user's public profile), use it
      if (onGuestClick) {
        setOpen(false);
        onGuestClick();
        if (n.threadId) {
          router.push(`${window.location.pathname}?thread=${n.threadId}`, { scroll: false });
        }
        return;
      }

      // Fallback to quick inbox modal if no onGuestClick provided
      if (n.type === "owner_reply" || n.type === "anonymous_feedback") {
        const sid = getSessionId();
        if (sid) {
          setSelectedThreadId(n.threadId || null);
          setActiveSessionId(sid);
          setIsModalLoading(true);
          const { getAllMessages } = await import("@/lib/realtime-notifications");
          const msgs = await getAllMessages(sid);
          setModalMessages(msgs);
          setIsModalLoading(false);
          setOpen(false); // Close the bell dropdown
        }
        return;
      }
    }

    setOpen(false);
    if (n.threadId) router.push(`/inbox?thread=${n.threadId}`);
    else if (n.imageId) router.push(`/f?imageId=${n.imageId}`);
    else router.push("/inbox");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-3 rounded-2xl transition-all group active:scale-90 ${open
          ? "bg-white/10 text-white"
          : "bg-white/5 text-white/50 hover:text-white"
          }`}
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 blur-2xl transition-all duration-500 ${hasUnread ? "opacity-100 animate-pulse" : "opacity-0 invisible group-hover:visible group-hover:opacity-100"}`} />
        <Bell className={`relative z-10 w-5 h-5 transition-transform ${hasUnread ? "animate-[wiggle_1s_ease-in-out_infinite] text-pink-500" : "group-hover:rotate-12"}`} />

        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-pink-500 rounded-full border-2 border-[#0d0d12] flex items-center justify-center text-[7px] font-black text-white z-20 shadow-[0_0_15px_rgba(255,61,127,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[190] sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed sm:absolute right-4 left-4 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 sm:w-[350px] max-h-[80vh] sm:max-h-[500px] flex flex-col bg-[#121217]/98 border border-white/10 rounded-[28px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] z-[201] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right backdrop-blur-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  Messages
                  {!user && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/10 font-bold uppercase tracking-wider">Guest</span>}
                </h3>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} New message${unreadCount === 1 ? '' : 's'}` : 'Recent activity'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {hasUnread && (
                  <button onClick={handleMarkAllRead} className="p-2 rounded-xl hover:bg-white/5 text-pink-500 transition-all active:scale-95" title="Mark all read">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 active:scale-90">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="py-20 flex justify-center"><div className="w-6 h-6 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin" /></div>
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <Bell className="w-8 h-8 text-white/5" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Quiet for now</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {allNotifications.map((n, idx) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-[24px] transition-all text-left relative overflow-hidden group/item ${!n.isRead
                          ? "bg-white/[0.06] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/10"
                          : "opacity-40 hover:opacity-100 hover:bg-white/[0.02]"
                        }`}
                      style={{ transitionDelay: `${idx * 40}ms` }}
                    >
                      {/* Unread Accent Glow */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(255,61,127,0.5)]" />
                      )}

                      <div className="relative shrink-0 w-12 h-12">
                        <div className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden ${!n.isRead
                            ? "bg-gradient-to-br from-[#ff3d7f30] to-[#7c3aff30] border border-pink-500/30 scale-105"
                            : "bg-white/10 grayscale"
                          }`}>
                          {n.feedbackImageUrl ? (
                            <img src={n.feedbackImageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <CircleUser className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                        </div>

                        {!n.isRead && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 rounded-full border-2 border-[#121217] animate-pulse shadow-[0_0_10px_rgba(255,61,127,1)] z-20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest truncate ${!n.isRead ? "text-pink-400" : "text-white/60"}`}>
                            @{n.coolId}
                          </span>
                          {!n.isRead && (
                            <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-[8px] font-black text-white shrink-0 shadow-lg shadow-pink-500/20">NEW</span>
                          )}
                          <span className="text-[9px] font-bold text-white/20 truncate flex-shrink-0">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[13px] leading-tight line-clamp-2 transition-colors ${!n.isRead ? "text-white font-bold" : "text-white/60 font-semibold"}`}>
                          {n.message || (n.type === "visit" ? "Viewed your profile" : "Sent a reaction")}
                        </p>
                      </div>

                      {/* Hover Arrow */}
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {user ? (
              <Link
                href="/inbox"
                onClick={() => setOpen(false)}
                className="block w-full py-4 text-center bg-white/[0.02] border-t border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white">Enter Control Center</span>
              </Link>
            ) : (
              <div className="p-5 bg-white/[0.01] border-t border-white/5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] text-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                  Claim Your Orbit
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Inbox Modal */}
      {activeSessionId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveSessionId(null)} />
          <div className="relative w-full sm:max-w-lg bg-[#0d0d12] rounded-[32px] border border-white/10 shadow-[0_32px_120px_-20px_rgba(0,0,0,1)] flex flex-col h-auto max-h-[85vh] animate-in fade-in zoom-in-95 duration-250 translate-y-[300px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Conversation Preview</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Read-only history</p>
              </div>
              <button onClick={() => setActiveSessionId(null)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 transition-all">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content - Filtered by thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
              {isModalLoading ? (
                <div className="py-20 flex justify-center"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin" /></div>
              ) : modalMessages.filter(m => !selectedThreadId || m.threadId === selectedThreadId || m.feedbackId === selectedThreadId).map((msg, i) => {
                const isOwner = msg.from === "owner" || msg.senderId === "owner";
                const isMe = !isOwner;
                return (
                  <div key={i} className={`flex flex-col gap-1.5 ${isMe ? "items-end" : "items-start animate-in slide-in-from-left-4"}`}>
                    <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-[13px] sm:text-sm font-bold shadow-xl max-w-[92%] sm:max-w-[85%] ${isMe ? "bg-gradient-to-br from-pink-500 to-purple-600 rounded-br-none text-white" : "bg-white/5 border border-white/5 rounded-bl-none text-white/90"}`}>
                      {msg.imageUrl && <img src={msg.imageUrl} className="rounded-xl mb-3 max-h-48 w-full object-cover" alt="" />}
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-bold text-white/20 uppercase italic px-1">{formatTimeAgo(msg.createdAt)}</span>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-white/5 bg-white/[0.02]">
              {!user ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold text-white/40 text-center">Login to join the conversation and reply back.</p>
                  <Link
                    href="/login"
                    className="block w-full py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest text-center hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    onClick={() => setActiveSessionId(null)}
                  >
                    Login to Reply
                  </Link>
                </div>
              ) : (
                <Link
                  href="/inbox"
                  className="block w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all"
                  onClick={() => setActiveSessionId(null)}
                >
                  Go to Full Inbox
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) scale(1.1); }
          25% { transform: rotate(10deg) scale(1.2); }
          75% { transform: rotate(-10deg) scale(1.2); }
        }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
