"use client";
// Force Re-compile - Unified Notifications V4

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { Camera, X, Heart, Send, ChevronLeft, ChevronRight, ImageIcon, Paperclip, FileText, Bell, Link as LinkIcon, ShieldCheck, Share2, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, ensureFirestoreNetwork } from "@/lib/firebase";
import { getAppFunctions } from "@/lib/functions";
import { uploadFeedbackImage, uploadAttachment } from "@/lib/image-upload";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AiImagePrompts, openProvider, type AiImageProvider } from "@/components/AiImagePrompts";
import { ExploreImages } from "@/components/ExploreImages";
import { NotificationBell } from "@/components/NotificationBell";
import { ActivityTicker } from "@/components/ActivityTicker";
import { Navbar } from "@/components/Navbar";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { getErrorMessage } from "@/lib/error-utils";
import { TermsModal } from "@/components/TermsModal";
import {
  listenForRealtimeMessages,
  getUnreadMessageCount,
  createSession,
  keepSessionAlive,
  markMessageAsRead,
} from "@/lib/realtime-notifications";
import { getSessionId } from "@/lib/session-utils";
import { ref, onValue, getDatabase } from "firebase/database";
import { requestNotificationPermission, getIosPushHint, onForegroundMessage } from "@/lib/notifications";

const SIGN_IN_NUDGE_INTERVAL_MS = 20_000;

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface RecentChat {
  coolId: string;
  userId: string;
  threadId: string | null;
  lastImageUrl?: string;
  lastActive: string;
}

// Persist session ID in localStorage moved to @/lib/session-utils

function getRecentChats(): RecentChat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("picpop_recent_chats");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecentChat(coolId: string, userId: string, threadId: string | null, lastImageUrl?: string): RecentChat[] {
  if (typeof window === "undefined" || !coolId || !userId) return [];
  const recent = getRecentChats();
  const filtered = recent.filter(c => !(c.coolId === coolId && c.threadId === threadId));
  const newList = [{ coolId, userId, threadId, lastImageUrl, lastActive: new Date().toISOString() }, ...filtered].slice(0, 15);
  localStorage.setItem("picpop_recent_chats", JSON.stringify(newList));
  window.dispatchEvent(new Event("recent_chats_updated"));
  return newList;
}

const RESPONSE_PREVIEWS = [
  { src: "/images/response.png", bg: "linear-gradient(135deg,#FF3D7F,#7C3AFF)" },
  { src: "/images/response1.png", bg: "linear-gradient(135deg,#7C3AFF,#00C8FF)" },
  { src: "/images/response2.png", bg: "linear-gradient(135deg,#00C8FF,#FF3D7F)" },
  { src: "/images/response3.jpg", bg: "linear-gradient(135deg,#FF3D7F,#FFE500)" },
  { src: "/images/response4.jpg", bg: "linear-gradient(135deg,#00C8FF,#7C3AFF)" },
  { src: "/images/response5.png", bg: "linear-gradient(135deg,#00FF94,#00C8FF)" },
  { src: "/images/response6.png", bg: "linear-gradient(135deg,#7C3AFF,#FFE500)" },
];

function UserFeedbackContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [coolId, setCoolId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSignInNudge, setShowSignInNudge] = useState(false);
  const [pendingShare, setPendingShare] = useState<{ previewUrl: string; confirm: () => Promise<void> } | null>(null);

  // Chat state
  const [textMessage, setTextMessage] = useState("");

  const { unreadNotifications } = useUnreadNotifications(authUser?.uid);
  
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [myChatAnonId, setMyChatAnonId] = useState<string | null>(null);
  const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [notifStatus, setNotifStatus] = useState<"idle" | "loading" | "enabled" | "denied" | "unsupported">("idle");
  const unreadCount = chatHistory.filter((m) => !m.isRead && m.isOwnerReply).length;
  const toast = useToast();

  useEffect(() => {
    const sid = searchParams.get("sid");
    if (sid && typeof window !== "undefined") {
      localStorage.setItem("picpop_session_id", sid);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(Notification.permission === "granted" ? "enabled" : Notification.permission === "denied" ? "denied" : "idle");
    } else {
      setNotifStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    setRecentChats(getRecentChats());
    const handleUpdate = () => setRecentChats(getRecentChats());
    window.addEventListener("recent_chats_updated", handleUpdate);
    return () => window.removeEventListener("recent_chats_updated", handleUpdate);
  }, []);

  // Listen for foreground notifications
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let mounted = true;

    const setup = async () => {
      try {
        const cleanup = await onForegroundMessage((payload) => {
          if (!mounted) return;
          const title = payload.notification?.title || "New notification";
          const body = payload.notification?.body || "You have a new message.";
          toast.success(`${title}: ${body}`);
        });
        unsub = cleanup;
      } catch (err) {
        console.warn("Foreground notification setup failed:", err);
      }
    };

    setup();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, [toast]);

  // TIER 1: Setup real-time listener removed (handled by NotificationBell)

  // Handle mobile app resume - reconnect listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Session] App became visible, syncing session...");

        // Verify session is still available
        const sid = getSessionId();
        console.log("[Session] Current session after resume:", sid);
      }
    };

    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, []);

  // Debug info for mobile testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid = getSessionId();
      (window as any).picpopDebug = {
        sessionId: sid,
        userId: authUser?.uid,
        clearSession: () => {
          const { clearSessionId } = require("@/lib/session-utils");
          clearSessionId();
          console.log("[Debug] Session cleared");
          window.location.reload();
        },
      };
      console.log("[Debug] Available at: window.picpopDebug");
    }
  }, [authUser?.uid]);

  // TIER 2: Handle offline messages removed (handled by NotificationBell)

  const handleDismissNudge = () => {
    localStorage.setItem("signInNudgeDismissedAt", Date.now().toString());
    setShowSignInNudge(false);
  };

  // Scroll to bottom whenever chatHistory updates
  useEffect(() => {
    if (chatMode) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatMode]);

  const hasOwnerReply = chatHistory.some(m => m.isOwnerReply);
  const isGuest = !authUser;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Track visit
  useEffect(() => {
    if (!db || !userId || !coolId) return;
    if (authUser?.uid === userId) return;
    const firestore = db;
    const run = async () => {
      try {
        await ensureFirestoreNetwork();
        await addDoc(collection(firestore, "visits"), {
          recipientId: userId, coolId, type: "visit", createdAt: new Date().toISOString(),
        });
      } catch { /* ignore */ }
    };
    run();
  }, [userId, coolId, authUser?.uid]);

  // Sign-in nudge
  useEffect(() => {
    if (authLoading || authUser || !userId) return;
    const id = setInterval(() => {
      try {
        const dismissedAt = localStorage.getItem("signInNudgeDismissedAt");
        if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 10 * 60 * 1000) return;
      } catch { }
      setShowSignInNudge(true);
    }, SIGN_IN_NUDGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [authLoading, authUser, userId]);

  useEffect(() => {
    const fromPath = (pathname || "").replace(/^\/u\/?/, "").split("/")[0] || "";
    const fromQuery = searchParams.get("user") || "";
    const id = (fromPath || fromQuery).trim().toLowerCase();
    if (id) setCoolId(id);
    else if (!authLoading && !authUser) setLoading(false); 
  }, [pathname, searchParams, authLoading, authUser]);

  useEffect(() => {
    if (coolId && userId) document.title = `Chat with @${coolId} â€” PicPop`;
    return () => { document.title = "PicPop â€” Anonymous Image-Based Feedback"; };
  }, [coolId, userId]);

  useEffect(() => {
    if (!db || !coolId) return;
    
    const firestore = db;
    let mounted = true;
    setLoading(true);

    const run = async () => {
      try {
        await ensureFirestoreNetwork();
        const snap = await getDoc(doc(firestore, "usernames", coolId));
        if (mounted) {
          if (snap.exists()) {
            const uid = (snap.data() as { uid: string }).uid;
            setUserId(uid);
          } else {
            setUserId(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setUserId(null);
          setLoading(false);
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [coolId]);


  const handleInboxClick = () => {
    if (!authUser) {
      toast.info("Sign in to see who viewed your profile and read your messages!");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    } else {
      router.push("/inbox");
    }
  };

  const activeThreadRef = useRef<string | null>(null);

  // Load initial chat history from server (IP-based + Session-based), then set up real-time listener
  useEffect(() => {

    let unsubListeners: (() => void) | null = null;
    let cancelled = false;

    const threadParam = searchParams.get("thread");

    // Only reset if we are switching to a DIFFERENT thread
    if (activeThreadRef.current !== threadParam) {
      setChatHistory([]);
      activeThreadRef.current = threadParam;
    }

    const init = async () => {
      if (!userId) return;
      try {
        const fns = getAppFunctions();
        if (!fns || !db) return;
        const sid = getSessionId();
        const getHistory = httpsCallable<{ recipientId: string; sessionId: string | null; threadId?: string | null }, { anonymousId: string; items: any[] }>(
          fns, "getAnonymousChatHistory"
        );
        const result = await getHistory({ recipientId: userId!, sessionId: sid, threadId: threadParam });
        if (cancelled) return;

        const anonId = result.data.anonymousId || sid;
        setMyChatAnonId(anonId);

        if (result.data.items && result.data.items.length > 0) {
          setChatHistory(result.data.items);
          if (threadParam) {
            setChatMode(true);
            const sid = getSessionId();
            if (sid) {
               import("@/lib/realtime-notifications").then(({ markMessageAsRead }) => {
                 result.data.items.filter(i => i.isOwnerReply && !i.isRead).forEach(msg => markMessageAsRead(sid, msg.id));
               });
            }
          }
          const lastWithImg = [...result.data.items].reverse().find(i => i.feedbackImageUrl || i.attachmentUrl);
          const updatedArr = saveRecentChat(coolId, userId!, threadParam, lastWithImg?.feedbackImageUrl || lastWithImg?.attachmentUrl);
          setRecentChats(updatedArr);
        }

        const currentSessionId = getSessionId();

        // 1. Listen for standard visitor thread (IP-based)
        const qVisitorThread = query(
          collection(db, "feedbacks"),
          where("recipientId", "==", userId!),
          where(threadParam ? "threadId" : "visitorId", "==", threadParam || anonId)
        );        // 2. Listen for session-specific targeted replies (for shared IPs)
        const qSessionThread = query(
          collection(db, "feedbacks"),
          where("recipientId", "==", userId),
          where(threadParam ? "threadId" : "sessionId", "==", threadParam || currentSessionId)
        );

        const processSnap = (snap: any) => {
          const newItems = snap.docs
            .filter((d: any) => d.data().deleted !== true)
            .map((d: any) => ({ id: d.id, ...d.data() } as any));

          setChatHistory(prev => {
            const map = new Map(prev.map(i => [i.id, i]));
            let changed = false;
            for (const item of newItems) {
              const existing = map.get(item.id);
              if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
                map.set(item.id, item);
                changed = true;

                // MARK AS READ: If we are in chat mode and it's a new owner reply
                if (chatMode && item.isOwnerReply && !item.isRead) {
                    const currentSid = getSessionId();
                    if (currentSid) {
                        import("@/lib/realtime-notifications").then(({ markMessageAsRead }) => {
                            markMessageAsRead(currentSid, item.id);
                        });
                    }
                }
              }
            }
            if (!changed) return prev;
            return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });

          if (newItems.length > 0) {
            // Only automatically enter chat mode if a specific thread is being viewed
            if (threadParam) setChatMode(true);
            const lastWithImg = [...newItems].reverse().find(i => i.feedbackImageUrl || i.attachmentUrl);
            const updated = saveRecentChat(coolId, userId, threadParam, lastWithImg?.feedbackImageUrl || lastWithImg?.attachmentUrl);
            setRecentChats(updated);
          }
        };

        const unsubVisitor = onSnapshot(qVisitorThread, processSnap);
        const unsubSession = onSnapshot(qSessionThread, processSnap);

        unsubListeners = () => {
          unsubVisitor();
          unsubSession();
        };

        if (authUser?.uid) {
          const qSentToOwner = query(
            collection(db, "feedbacks"),
            where("recipientId", "==", userId!),
            where("submitterId", "==", authUser.uid),
            ...(threadParam ? [where("threadId", "==", threadParam)] : [])
          );
          const unsubSent = onSnapshot(qSentToOwner, processSnap);

          const qRepliesFromOwner = query(
            collection(db, "feedbacks"),
            where("recipientId", "==", authUser.uid),
            where("submitterId", "==", userId!),
            ...(threadParam ? [where("threadId", "==", threadParam)] : []),
            limit(100)
          );
          const unsubReplies = onSnapshot(qRepliesFromOwner, processSnap);

          const baseUnsub = unsubListeners;
          unsubListeners = () => {
            if (baseUnsub) baseUnsub();
            unsubSent();
            unsubReplies();
          };
        }
      } catch (err) {
        // silently ignore â€” new user with no history is fine
      }
    };

    init();
    return () => {
      cancelled = true;
      if (unsubListeners) unsubListeners();
    };
  }, [userId, coolId, authUser?.uid, searchParams.toString()]);

  const sendTextMessage = useCallback(async (msg: string) => {
    if (!userId || (!msg.trim() && !pendingFile)) return;
    const text = msg.trim();
    const fileToUpload = pendingFile;
    setTextMessage("");
    setPendingFile(null);

    const isAttachment = !!fileToUpload;
    const threadId = searchParams.get("thread") || (chatMode ? (chatHistory[chatHistory.length - 1]?.threadId || chatHistory[chatHistory.length - 1]?.id) : null);

    // OPTIMISTIC UPDATE: Add to UI immediately for speed feel
    const optimisticId = "opt_" + Math.random().toString(36).substring(2, 9);
    const urlToUse = fileToUpload ? URL.createObjectURL(fileToUpload) : "";
    const optimisticMsg = {
      id: optimisticId,
      message: text,
      createdAt: new Date().toISOString(),
      anonymousId: myChatAnonId,
      isOwnerReply: false,
      attachmentUrl: urlToUse || undefined,
      attachmentName: fileToUpload?.name || undefined,
      threadId: threadId || undefined,
      isFirstSender: !threadId,
    };
    setChatHistory(prev => [...prev, optimisticMsg]);
    checkChatModeOrSuccess();

    try {
      let attachmentUrl = null;
      let attachmentName = null;

      if (fileToUpload) {
        setSubmitting(true);
        const fileId = "att_" + Math.random().toString(36).substring(2, 9);
        attachmentUrl = await uploadAttachment(fileToUpload, fileId);
        attachmentName = fileToUpload.name;
      }

      const fns = getAppFunctions();
      if (!fns) throw new Error("Firebase not configured");
      const sessionId = getSessionId();


      const submitFeedback = httpsCallable<{
        recipientId: string;
        message: string;
        sessionId: string | null;
        attachmentUrl?: string | null;
        attachmentName?: string | null;
        threadId?: string | null;
      }, { success: boolean; anonymousId?: string }>(
        fns, "submitFeedback"
      );

      const result = await submitFeedback({
        recipientId: userId!,
        message: text,
        sessionId,
        attachmentUrl,
        attachmentName,
        threadId: threadId as string | null
      }) as any;

      if (result.data.anonymousId && !myChatAnonId) setMyChatAnonId(result.data.anonymousId);

      setRecentChats(saveRecentChat(coolId, userId!, result.data.threadId || threadId, attachmentUrl || urlToUse));

      setSubmitted(true);
      toast.success("Reaction sent! You can send another.");
      setTimeout(() => setSubmitted(false), 3000);

      // Cleanup optimist after successful sync
      setTimeout(() => {
        setChatHistory(prev => prev.filter(m => m.id !== optimisticId));
        if (urlToUse) URL.revokeObjectURL(urlToUse);
      }, 4000);
    } catch (err: unknown) {
      // Rollback optimistic update on error
      setChatHistory(prev => prev.filter(m => m.id !== optimisticId));
      setTextMessage(text); // Restore text
      if (fileToUpload) setPendingFile(fileToUpload);
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [userId, myChatAnonId, toast, coolId, pendingFile, chatMode, chatHistory, searchParams]);

  const doFileUpload = async (file: File) => {
    if (!userId || !db) return;
    setSubmitting(true);
    try {
      await ensureFirestoreNetwork();
      const feedbackId = crypto.randomUUID();

      const threadId = null; // Forces brand-new thread for every image upload
      let optimisticId = "";
      if (authUser) {
        optimisticId = "opt_" + Math.random().toString(36).substring(2, 9);
        const urlToUse = file ? URL.createObjectURL(file) : "";
        setChatHistory(prev => [...prev, {
          id: optimisticId,
          feedbackImageUrl: urlToUse,
          createdAt: new Date().toISOString(),
          anonymousId: myChatAnonId,
          isOwnerReply: false,
          submitterId: authUser.uid,
          threadId: threadId || undefined
        }]);
      }

      const url = await uploadFeedbackImage(file, feedbackId);

      const fns = getAppFunctions();
      if (!fns) throw new Error("Firebase not configured");
      const sessionId = getSessionId();
      const submitFeedback = httpsCallable<{ recipientId: string; feedbackImageUrl: string; sessionId: string | null; threadId?: string | null }, { success: boolean; anonymousId?: string }>(
        fns, "submitFeedback"
      );
      const result = await submitFeedback({
        recipientId: userId!,
        feedbackImageUrl: url,
        sessionId,
        threadId: null // Force brand-new thread server-side
      }) as any;


      if (authUser && optimisticId) {
        setTimeout(() => setChatHistory(prev => prev.filter(m => m.id !== optimisticId)), 4000);
      }
      if (result.data.anonymousId && !myChatAnonId) setMyChatAnonId(result.data.anonymousId);

      setRecentChats(saveRecentChat(coolId, userId!, result.data.threadId, url));

      setSubmitted(true);
      toast.success("Reaction sent! You can send another.");
      setTimeout(() => setSubmitted(false), 3000);

      checkChatModeOrSuccess();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const checkChatModeOrSuccess = () => {
    if (!authUser) {
      setShowGuestSuccessModal(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId || !db) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image."); return; }
    const previewUrl = URL.createObjectURL(file);
    setPendingShare({
      previewUrl,
      confirm: async () => { URL.revokeObjectURL(previewUrl); setPendingShare(null); await doFileUpload(file); },
    });
  };

  const handleShare = (msg?: string, url?: string) => {
    const shareUrl = url || window.location.href;
    const shareText = msg || `Check out this feedback on PicPop!`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "PicPop", text: shareText, url: shareUrl }).catch(() => { });
    } else if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  const handleSharedSelect = async (item: { id: string; feedbackImageUrl: string }) => {
    if (!userId || !db) return;
    setSubmitting(true);
    try {
      await ensureFirestoreNetwork();
      const threadId = null; // Image sharing always starts a new thread
      let optimisticId = "";
      if (authUser) {
        optimisticId = "opt_" + Math.random().toString(36).substring(2, 9);
        setChatHistory(prev => [...prev, {
          id: optimisticId,
          feedbackImageUrl: item.feedbackImageUrl,
          createdAt: new Date().toISOString(),
          anonymousId: myChatAnonId,
          isOwnerReply: false,
          submitterId: authUser.uid,
          threadId: threadId || undefined
        }]);
      }

      const fns = getAppFunctions();
      if (!fns) throw new Error("Firebase not configured");
      const sessionId = getSessionId();
      const submit = httpsCallable<{ recipientId: string; feedbackImageUrl: string; sessionId: string | null; threadId?: string | null }, { success: boolean; anonymousId?: string }>(fns, "submitFeedback");
      const result = await submit({
        recipientId: userId!,
        feedbackImageUrl: item.feedbackImageUrl,
        sessionId,
        threadId: null // New thread for shared select
      }) as any;
      if (result.data.anonymousId && !myChatAnonId) setMyChatAnonId(result.data.anonymousId);

      setRecentChats(saveRecentChat(coolId, userId!, result.data.threadId, item.feedbackImageUrl));

      setSubmitted(true);
      toast.success("Reaction sent! You can send another.");
      setTimeout(() => setSubmitted(false), 3000);

      checkChatModeOrSuccess();
    } catch (err: unknown) {
      const m = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to send.";
      toast.error(m);
    } finally { setSubmitting(false); }
  };

  const handleMemeSelect = async (meme: { id: string; url: string }) => {
    if (!userId || !db) return;
    setSubmitting(true);
    try {
      await ensureFirestoreNetwork();
      const threadId = null; // Memes always start a new thread
      let optimisticId = "";
      if (authUser) {
        optimisticId = "opt_" + Math.random().toString(36).substring(2, 9);
        setChatHistory(prev => [...prev, {
          id: optimisticId,
          feedbackImageUrl: meme.url,
          createdAt: new Date().toISOString(),
          anonymousId: myChatAnonId,
          isOwnerReply: false,
          submitterId: authUser.uid,
          threadId: threadId || undefined
        }]);
      }

      const fns = getAppFunctions();
      if (!fns) throw new Error("Firebase not configured");
      const sessionId = getSessionId();
      const submit = httpsCallable<{ imageUrl: string; recipientId: string; sessionId: string | null; threadId?: string | null }, { success: boolean; anonymousId?: string }>(fns, "submitFeedbackFromImgflip");
      const result = await submit({
        imageUrl: meme.url,
        recipientId: userId!,
        sessionId,
        threadId: null // New thread for meme
      }) as any;
      if (result.data.anonymousId && !myChatAnonId) setMyChatAnonId(result.data.anonymousId);

      setRecentChats(saveRecentChat(coolId, userId!, result.data.threadId, meme.url));

      setSubmitted(true);
      toast.success("Reaction sent! You can send another.");
      setTimeout(() => setSubmitted(false), 3000);

      checkChatModeOrSuccess();
    } catch (err: unknown) {
      const m = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to send.";
      toast.error(m);
    } finally { setSubmitting(false); }
  };

  const showShareConfirm = (previewUrl: string, confirm: () => Promise<void>) => setPendingShare({ previewUrl, confirm });
  const handleSharedSelectWithConfirm = async (item: { id: string; feedbackImageUrl: string }) => {
    showShareConfirm(item.feedbackImageUrl, () => { setPendingShare(null); return handleSharedSelect(item); });
  };

  const handleGetMagicLink = () => {
    const sid = getSessionId();
    if (!sid) return;
    const url = `${window.location.origin}${pathname}?sid=${sid}`;
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Magic link copied! Save this to return to this chat later.");
      });
    } else {
      toast.error("Clipboard not supported");
    }
  };

  const handleEnablePushNotifications = async () => {
    const iosHint = getIosPushHint();
    if (iosHint) {
      toast.error(iosHint);
      return;
    }
    setNotifStatus("loading");
    try {
      const token = await requestNotificationPermission();
      if (token) {
        const { saveFcmToken } = await import("@/lib/notifications");
        const sid = getSessionId();
        await saveFcmToken(authUser?.uid || null, token, sid);
        setNotifStatus("enabled");
        toast.success("Notifications enabled!");
      } else {
        setNotifStatus(Notification.permission === "denied" ? "denied" : "idle");
        if (Notification.permission === "denied") {
          toast.error("Notifications blocked. Please enable them in your browser settings.");
        }
      }
    } catch (err) {
      setNotifStatus("idle");
      toast.error("Failed to enable notifications.");
    }
  };

  const openAiImageWithPrompt = (prompt: string, provider: AiImageProvider) => {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(prompt).then(() => {
        toast.success(`Copied! Opening ${provider === "chatgpt" ? "ChatGPT" : "Gemini"}...`);
      });
    } else {
      toast.success(`Opening ${provider === "chatgpt" ? "ChatGPT" : "Gemini"}...`);
    }
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent));
    openProvider(prompt, provider, isMobile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--pink)", borderRightColor: "var(--purple)" }} />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.2em] text-center">User not found</p>
        <p className="text-white/40 text-sm mt-2 text-center">The link @{coolId || "someone"} shared might be incorrect.</p>
        <Link href="/" className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all">Back to home</Link>
      </div>
    );
  }

  const renderChatModal = () => {
    if (!chatMode) return null;

    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full h-full sm:h-[85vh] sm:max-w-2xl sm:rounded-[40px] bg-[var(--bg-primary)] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        <style>{`
            .chat-scroll::-webkit-scrollbar { width: 4px; }
            .chat-scroll::-webkit-scrollbar-track { background: transparent; }
            .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
            @keyframes msg-in { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .msg-in { animation: msg-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
          `}</style>

        {/* Modal Header */}
        <div className="flex shrink-0 h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setChatMode(false);
                router.replace(window.location.pathname);
              }}
              className="p-2 -ml-2 rounded-2xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
              <div>
                <p className="text-base font-black text-white leading-tight">
                  {authUser?.uid === userId ? "Guest" : `@${coolId}`}
                </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                  {authUser ? "Verified" : "Anonymous"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!authUser && (
              <button
                type="button"
                onClick={() => setShowGuestSuccessModal(true)}
                className={`p-2.5 rounded-2xl transition-all active:scale-95 ${notifStatus === "enabled" ? "text-[var(--green)] bg-green-500/10" : "text-[var(--text-muted)] hover:bg-white/5 backdrop-blur-sm"}`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
            )}
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg animate-bounce">
                {unreadCount} NEW
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-scroll px-4 sm:px-6 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/10">
                <Heart className="w-10 h-10 text-white/20" />
              </div>
              <p className="font-black text-xl text-white">No messages yet</p>
              <p className="text-sm text-[var(--text-muted)] font-bold mt-2 max-w-[200px]">Send an image or message to start the conversation.</p>
            </div>
          ) : (
            chatHistory
              .filter(item => !(item.targetUid && item.targetUid !== authUser?.uid && item.submitterId !== authUser?.uid))
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((msg, idx) => {
                const isOwnerReply = msg.isOwnerReply === true || msg.from === 'owner';
                const isVisitor = authUser?.uid !== userId;
                const isMe = isVisitor ? !isOwnerReply : isOwnerReply;

                return (
                  <div key={msg.id || idx} className={`flex flex-col gap-1.5 msg-in ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-end gap-2 sm:gap-3 max-w-[92%] sm:max-w-[85%] ${isMe ? "flex-row-reverse" : ""}`}>
                      {/* Avatar / Icon */}
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-xl ${isMe
                        ? "bg-gradient-to-br from-pink-500 to-purple-600 rotate-3"
                        : "bg-gradient-to-br from-blue-500 to-purple-500 -rotate-3"
                        }`}>
                        {(() => {
                          const label = isMe ? "ME" : (isOwnerReply ? `@${coolId}` : "GUEST");
                          if (!isMe) console.log(`[ChatDebug] Msg: FirstSender=${msg.isFirstSender}, IsOwnerReply=${isOwnerReply}, Label=${label}`);
                          return label;
                        })()}
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-[22px] sm:rounded-3xl p-3 sm:p-4 shadow-sm relative group/bubble ${isMe
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm border border-white/5"
                        }`}
                        style={isMe
                          ? { background: "linear-gradient(135deg, var(--pink), var(--purple))" }
                          : { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>

                        {msg.feedbackImageUrl && (
                          <div className="relative group/img mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={msg.feedbackImageUrl} alt="reaction" className="rounded-2xl w-full max-h-[350px] object-contain shadow-lg" />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShare("Check out this reaction on PicPop!", msg.feedbackImageUrl); }}
                              className="absolute top-2 right-2 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[var(--pink)] flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.4)] z-10"
                            >
                              <Share2 className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                            </button>
                          </div>
                        )}

                        {msg.attachmentUrl && (
                          <div className="mb-2">
                            {msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                <img src={msg.attachmentUrl} alt="attachment" className="rounded-2xl w-full max-h-[200px] object-contain bg-black/10" />
                              </a>
                            ) : (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-[var(--blue)]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[var(--blue)]" /></div>
                                <div className="min-w-0 pr-2">
                                  <p className="text-[11px] font-black text-white truncate">{msg.attachmentName || 'Doc'}</p>
                                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Download</p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}

                        {msg.message && (
                          <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] text-white/30 ${isMe ? "mr-12" : "ml-12"}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-xl mx-auto flex items-end gap-3">
            {/* Attachment Button */}
            <input ref={docInputRef} type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) setPendingFile(file); }} className="hidden" />
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={submitting}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-30"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input wrapper */}
            <div className="flex-1 relative">
              {isGuest ? (
                !hasOwnerReply ? (
                  <div className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 bg-white/5 rounded-2xl border border-white/5">
                    Waiting for @{coolId} to reply...
                  </div>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl text-xs uppercase tracking-widest"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                  >
                    Login to reply <Heart className="w-4 h-4 fill-white" />
                  </Link>
                )
              ) : (
                <div className="relative flex items-end gap-3">
                  <textarea
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTextMessage(textMessage); }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 max-h-32 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-[var(--pink)] transition-all resize-none placeholder:text-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => sendTextMessage(textMessage)}
                    disabled={(!textMessage.trim() && !pendingFile) || submitting}
                    className="p-4 rounded-2xl text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

return (
  <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden" style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}>
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        :root { --pink: #FF3D7F; --purple: #7C3AFF; --blue: #00C8FF; --green: #00FF94; --yellow: #FFE500; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 40px rgba(255,61,127,0.25)} 50%{box-shadow:0 0 60px rgba(255,61,127,0.45)} }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .preview-scroll::-webkit-scrollbar { display: none; }
        .preview-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15]" style={{ background: "var(--purple)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.12]" style={{ background: "var(--pink)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-[0.08]" style={{ background: "var(--blue)" }} />
    </div>

    <Navbar />

    <ActivityTicker items={unreadNotifications as any} coolId={coolId} />

    <main className="relative max-w-2xl mx-auto px-4 py-8 pb-32">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
          style={{ background: "rgba(255,61,127,0.1)", border: "1px solid rgba(255,61,127,0.2)", color: "var(--pink)" }}>
          <Heart className="w-3.5 h-3.5 fill-[var(--pink)]" /> anonymous messages only
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.9] tracking-tight mb-4">
          react to <span className="text-[var(--pink)]">@{coolId}</span>
        </h1>
        <p className="text-base text-[var(--text-muted)] font-bold max-w-sm mx-auto leading-relaxed">
          Drop an image or share a reaction. Your identity is 100% protected. No sign-up required.
        </p>
      </div>

      {/* Primary CTA: Huge Camera Button */}
      <div className="relative mb-16 px-2">
        <div className="absolute -inset-4 bg-gradient-to-r from-[var(--pink)] via-[var(--purple)] to-[var(--blue)] rounded-[40px] opacity-20 blur-2xl animate-pulse" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-[32px] bg-[var(--bg-card)] border-2 border-white/5 flex flex-col items-center justify-center gap-6 transition-all hover:scale-[1.02] hover:border-[var(--pink)]/50 group active:scale-[0.98] relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--pink)]/10 group-hover:border-[var(--pink)]/20 transition-all duration-500 rotate-3 group-hover:rotate-0">
            <Camera className="w-10 h-10 sm:w-14 h-14 text-[var(--pink)] transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white mb-2">{submitting ? "UPLOADING..." : "TAP TO SEND"}</span>
            <span className="block text-xs font-black uppercase tracking-[0.2em] text-white/30">screenshot Â· selfie Â· meme</span>
          </div>
        </button>
      </div>


      {/* Recent Chats Section - Modernized */}
      {recentChats.length > 0 && (
        <div className="mb-16 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">your history</p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-6 justify-center">
            {recentChats.map((chat) => (
              <button
                key={`${chat.coolId}-${chat.threadId}`}
                onClick={() => {
                  if (chat.threadId) {
                    router.push(`${window.location.pathname}?thread=${chat.threadId}`);
                  }
                }}
                className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--pink)] group-hover:bg-[var(--pink)]/10 shadow-xl relative">
                  {chat.lastImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chat.lastImageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="text-xl font-black text-white/20 group-hover:text-[var(--pink)]">
                      {chat.coolId.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {chat.threadId && <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[var(--green)] rounded-full border-2 border-[#000] shadow-sm" />}
                </div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                  {chat.coolId}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections: Explore */}
      <div className="space-y-20">
        <ExploreImages onSubmitShared={handleSharedSelectWithConfirm} disabled={submitting} />
      </div>

      {/* Unified Chat Modal Render */}
      {renderChatModal()}

      {/* Global Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-[var(--pink)] animate-spin" />
            <p className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Delivering Message...</p>
          </div>
        </div>
      )}

      {/* Sign-in nudge modal */}
      {showSignInNudge && !authUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={handleDismissNudge}>
          <div className="rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4" style={{ background: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={handleDismissNudge} className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-white/10"><X className="w-4 h-4" /></button>
            <p className="font-black text-lg">Get notified of replies!</p>
            <p className="text-sm text-[var(--text-muted)]">Sign in to see when @{coolId} replies to you.</p>
            <Link
              href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`}
              className="w-full py-3 rounded-xl font-bold text-white text-center block"
              style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginRequiredPopup && !authUser && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setShowLoginRequiredPopup(false)}>
          <div className="bg-[#0a0a0a] rounded-[32px] p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative border border-white/10"
            style={{ boxShadow: "0 0 100px -20px rgba(255, 61, 127, 0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowLoginRequiredPopup(false)} className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative group"
              style={{ background: "linear-gradient(135deg, rgba(255,61,127,0.2), rgba(124,58,255,0.2))", border: "2px solid rgba(255,61,127,0.3)" }}>
              <ShieldCheck className="w-10 h-10 text-[var(--pink)] relative z-10" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">Continue Conversation</h3>
            <p className="text-sm text-[var(--text-muted)] mb-8 font-semibold">
              To continue chat login plz. This keeps your anonymous thread safe and accessible only to you.
            </p>

            <div className="flex flex-col w-full gap-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`}
                className="w-full py-4 rounded-2xl font-black text-white text-center shadow-xl hover:scale-[1.02] transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
              >
                Continue with Google
              </Link>
              <button
                onClick={() => setShowLoginRequiredPopup(false)}
                className="w-full py-4 rounded-2xl font-bold text-[var(--text-muted)] text-sm hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview confirm */}
      {pendingShare && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5" style={{ background: "var(--bg-card)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingShare.previewUrl} alt="preview" className="w-full rounded-xl max-h-60 object-contain" />
            <p className="font-bold text-center">Send this to @{coolId}?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { URL.revokeObjectURL(pendingShare.previewUrl); setPendingShare(null); }}
                className="flex-1 py-3 rounded-xl font-bold border border-[var(--border)]">Cancel</button>
              <button type="button" onClick={pendingShare.confirm} disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))", boxShadow: "0 4px 20px rgba(255,61,127,0.3)" }}>
                {submitting ? "Sending..." : "Yes, send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload loader */}
      {submitting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full animate-spin" style={{ border: "4px solid transparent", borderTopColor: "var(--pink)", borderRightColor: "var(--purple)" }} />
            <p className="font-bold text-white">Uploading...</p>
          </div>
        </div>
      )}




      <p className="mt-8 text-center text-sm text-[var(--text-muted)] font-semibold flex items-center justify-center gap-2">
        <ImageIcon className="w-4 h-4 text-[var(--pink)]" /> Send one. @{coolId} will appreciate it.
      </p>

      {/* Success Modal (Ultra-Premium Redesign) */}
      {(showGuestSuccessModal || (submitted && !authUser)) && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-[40px]" />

          {/* Epic Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--pink)]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--purple)]/10 blur-[120px] rounded-full animate-pulse delay-700" />
          
          <div className="bg-[#0f0f15]/80 rounded-[48px] p-8 sm:p-10 pb-12 sm:pb-14 w-full max-w-sm flex flex-col items-center text-center shadow-[0_32px_120px_-20px_rgba(255,61,127,0.4)] relative border border-white/10 max-h-[92vh] overflow-y-auto no-scrollbar backdrop-blur-3xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 transform-gpu">
            
            {/* Top Close Button */}
            <button 
              onClick={() => { setShowGuestSuccessModal(false); setChatMode(false); setSubmitted(false); }}
              className="absolute top-6 right-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all active:scale-90 z-[30]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success Celebration Header */}
            <div className="relative mb-10 pt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] blur-[40px] opacity-30 rounded-full animate-pulse scale-150" />
              <div className="w-28 h-28 rounded-[40px] flex items-center justify-center relative group overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,61,127,0.2), rgba(124,58,255,0.2))",
                  border: "2px solid rgba(255,255,255,0.1)",
                  boxShadow: "inset 0 0 40px rgba(255,255,255,0.05)"
                }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1500" />
                <div className="relative z-10 w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-in zoom-in duration-500 delay-300">
                  <CheckCircle2 className="w-10 h-10 text-[var(--pink)]" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-12">
              <h3 className="text-4xl font-black text-white tracking-tight leading-none italic uppercase">Sent Successfully!</h3>
              <p className="text-[10px] font-black text-[var(--pink)] uppercase tracking-[0.5em] opacity-80 flex items-center justify-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink)] animate-ping" />
                Delivered to @{coolId}
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="flex flex-col w-full gap-4 mb-10">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center mb-1">Boost Your Experience</p>

              <button
                onClick={handleEnablePushNotifications}
                disabled={notifStatus === "loading" || notifStatus === "enabled"}
                className="w-full p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-5 transition-all hover:bg-white/[0.06] hover:scale-[1.02] group active:scale-[0.98]"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${notifStatus === "enabled" ? "bg-green-500/20 text-green-400 rotate-12" : "bg-white/5 text-[var(--pink)] group-hover:scale-110"}`}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-black text-white group-hover:text-[var(--pink)] transition-colors">Notify Me</p>
                  <p className="text-[10px] text-white/40 font-bold">Alert on @{coolId}'s reply</p>
                </div>
              </button>

              {!authUser && (
                <Link
                  href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`}
                  className="w-full p-4 rounded-3xl bg-gradient-to-br from-[var(--pink)]/10 via-transparent to-[var(--purple)]/10 border border-white/10 flex items-center gap-5 transition-all hover:from-[var(--pink)]/20 hover:scale-[1.02] group active:scale-[0.98] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] opacity-0 group-hover:opacity-5 transition-opacity" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--pink)] to-[var(--purple)] text-white group-hover:rotate-6 transition-all flex items-center justify-center shadow-xl">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-black text-white group-hover:text-[var(--pink)] transition-colors">Join PicPop</p>
                    <p className="text-[9px] text-[var(--pink)] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </p>
                  </div>
                </Link>
              )}

              <button
                onClick={() => handleShare()}
                className="w-full p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-5 transition-all hover:bg-white/[0.06] hover:scale-[1.02] group active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-blue-400 group-hover:scale-110 flex items-center justify-center transition-all">
                  <Share2 className="w-6 h-6" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">Tell Friends</p>
                  <p className="text-[10px] text-white/40 font-bold">Invite others to react</p>
                </div>
              </button>
            </div>

            {/* Bottom Primary Action */}
            <button
              onClick={() => {
                setShowGuestSuccessModal(false);
                setChatMode(false);
                setSubmitted(false);
              }}
              className="w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] text-white relative overflow-hidden group/cta flex items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                boxShadow: "0 20px 40px -10px rgba(255,61,127,0.5)"
              }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/cta:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">Keep Exploring</span>
              <ChevronRight className="w-4 h-4 relative z-10 transition-transform group-hover/cta:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Icon for Landing Page */}
      <NotificationBell
        className="fixed bottom-6 right-6 z-[100]"
        onGuestClick={() => setChatMode(true)}
        ownerName={coolId}
      />

    </main>
    </div>
  );
}

export default function UserFeedbackClient() {
  const { user, profile, loading } = useAuth();
  const [showTerms, setShowTerms] = useState(() => {
    if (typeof window !== "undefined") {
      const universal = localStorage.getItem("picpop_legal_v1") === "true";
      if (universal) return false;
    }
    return false;
  });

  useEffect(() => {
    // 1. FAST CHECK: If this device has accepted terms, don't show the modal
    if (typeof window !== "undefined") {
      const universal = localStorage.getItem("picpop_legal_v1") === "true";
      const userSpecific = user?.uid ? localStorage.getItem(`picpop_terms_accepted_${user.uid}`) === "true" : false;

      if (universal || userSpecific) {
        setShowTerms(false);
        return;
      }
    }

    // 2. BACKUP CHECK: If profile is loaded, check Firestore status
    if (!loading && user && profile && profile.coolId) {
      const isAcceptedInStore = profile.termsAccepted && profile.privacyAccepted;
      if (!isAcceptedInStore) {
        setShowTerms(true);
      } else {
        setShowTerms(false);
      }
    } else if (!loading && !user) {
      // 3. GUEST CHECK: Prompt if on this device haven't accepted yet
      const universal = typeof window !== "undefined" ? localStorage.getItem("picpop_legal_v1") === "true" : false;
      if (!universal) {
        setShowTerms(true);
      }
    }
  }, [user, profile, loading]);

  return (
    <div className="relative">
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--pink)" }} />
        </div>
      }>
        <UserFeedbackContent />
      </Suspense>
      <TermsModal
        isOpen={showTerms}
        onAccept={() => setShowTerms(false)}
      />
    </div>
  );
}
