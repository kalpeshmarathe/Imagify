"use client";

import { useEffect, useState, useRef, useMemo, Fragment } from "react";
import Link from "next/link";
import { Bell, Eye, Image as ImageIcon, X, MoreVertical, Trash2, Flag, MessageSquare, Send, Paperclip, FileText, CheckCircle2, Share2, AlertCircle, ChevronLeft, Heart, CircleUser } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  writeBatch,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db, ensureFirestoreNetwork } from "@/lib/firebase";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getAppFunctions } from "@/lib/functions";
import {
  requestNotificationPermission,
  saveFcmToken,
  clearFcmToken,
  getIosPushHint,
  onForegroundMessage,
} from "@/lib/notifications";
import { uploadAttachment } from "@/lib/image-upload";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Navbar } from "@/components/Navbar";
import { FeedbackShareModal } from "@/components/FeedbackShareModal";
import { ReportFeedbackModal } from "@/components/ReportFeedbackModal";
import { TermsModal } from "@/components/TermsModal";
import { getErrorMessage } from "@/lib/error-utils";

function formatTimeAgo(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "recently";

    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 0) return "just now";
    if (diff > 126227808000) return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

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
  try {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
      return new Date().toISOString();
    }
    if (val && typeof val === "object" && "toDate" in val) {
      const timestamp = val as { toDate: () => Date };
      if (typeof timestamp.toDate === "function") {
        const d = timestamp.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) {
          return d.toISOString();
        }
      }
    }
  } catch {
    /* ignore */
  }
  return new Date().toISOString();
}

interface NotifItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "anonymous_feedback" | "visit" | "owner_reply";
  imageId?: string;
  coolId?: string;
  feedbackImageUrl?: string;
  feedbackMessage?: string;
  feedbackId?: string;
  anonymousId?: string;
  submitterId?: string;
  submitterIp?: string;
  sessionId?: string;
  isOwnerReply?: boolean;
  targetUid?: string;
  visitorId?: string;
  recipientId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  threadId?: string;
  status?: "feedback_only" | "awaiting_reply" | "active_chat";
  mode?: "one_way" | "two_way";
  hasReply?: boolean;
  senderCanReply?: boolean;
  receiverCanReply?: boolean;
  isAnonymousToRecipient?: boolean;
  isFirstSender?: boolean;
}

function canUserSeeProfile(item: NotifItem, currentUid: string | undefined) {
  if (!currentUid) return false;
  // If I sent it, I know who I am
  if (item.submitterId === currentUid) return true;
  // If it's one-way anonymous and I'm the recipient, I can't see the sender
  if (item.isAnonymousToRecipient && item.recipientId === currentUid) return false;
  // If it's an owner reply and I'm the recipient (visitor), I can see the owner
  if (item.isOwnerReply && item.recipientId === currentUid) return true;
  return true;
}

interface GroupedItem {
  id: string;
  itemType: "feedback" | "visit";
  threadType: "inbox" | "sent";
  threadPartnerId: string;
  items: (NotifItem & { itemType: "feedback" | "visit" })[];
  createdAt: string;
  latestItem: NotifItem & { itemType: "feedback" | "visit" };
  sharedImageUrl?: string;
  status?: "feedback_only" | "active_chat";
  feedbackId?: string;
}

const isMountedRef = { current: true };

export default function InboxPage() {
  const { user, profile, loading } = useAuth();
  const uid = user?.uid;
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<NotifItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [notifStatus, setNotifStatus] = useState<"idle" | "loading" | "enabled" | "denied" | "unsupported">("idle");
  const [selectedGroup, setSelectedGroup] = useState<GroupedItem | null>(null);
  const [feedbackDocId, setFeedbackDocId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [profileCache, setProfileCache] = useState<Record<string, string>>({});
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTerms, setShowTerms] = useState(() => {
    if (typeof window !== "undefined") {
      const universal = localStorage.getItem("picpop_legal_v1") === "true";
      if (universal) return false;
    }
    return false;
  });

  const optionsRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number>(0);
  // ✅ FIX: Prevent double send
  const isSendingRef = useRef(false);
  // ✅ FIX: Track optimistic messages
  const optimisticMessagesRef = useRef<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(
        Notification.permission === "granted" ? "enabled" : Notification.permission === "denied" ? "denied" : "idle"
      );
    } else {
      setNotifStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    if (!db || !user?.uid) {
      setLoadingData(false);
      return;
    }
    const firestore = db;
    const uid = user.uid;
    let unsubN: (() => void) | undefined;
    let unsubF: (() => void) | undefined;

    const run = async () => {
      try {
        await ensureFirestoreNetwork();

        if (!isMountedRef.current) return;

        unsubN = onSnapshot(
          query(
            collection(firestore, "notifications"),
            where("recipientId", "==", uid),
            orderBy("createdAt", "desc"),
            limit(100)
          ),
          (snap) => {
            if (!isMountedRef.current) return;

            try {
              setNotifications(
                snap.docs.map((d) => {
                  const data = d.data();
                  return {
                    id: d.id,
                    message: data.message || "",
                    isRead: data.isRead === true,
                    createdAt: toIsoString(data.createdAt),
                    type: data.type === "visit" ? "visit" : "anonymous_feedback",
                    imageId: data.imageId,
                    coolId: data.coolId || (data.type === "visit" ? "post" : "anonymous"),
                    feedbackImageUrl: data.feedbackImageUrl,
                    feedbackMessage: data.feedbackMessage,
                    feedbackId: data.feedbackId,
                    anonymousId: data.anonymousId,
                    submitterId: data.submitterId,
                    submitterIp: data.submitterIp,
                    sessionId: data.sessionId,
                    isOwnerReply: data.isOwnerReply === true,
                    recipientId: data.recipientId,
                    visitorId: data.visitorId,
                    targetUid: data.targetUid,
                    threadId: data.threadId,
                    status: data.status,
                    mode: data.mode,
                    hasReply: data.hasReply,
                    senderCanReply: data.senderCanReply,
                    receiverCanReply: data.receiverCanReply,
                    isAnonymousToRecipient: data.isAnonymousToRecipient === true,
                    isFirstSender: data.isFirstSender,
                  };
                })
              );
            } catch {
              setError("Failed to load notifications");
            }
          },
          (err) => {
            if (!isMountedRef.current) return;
            setLoadingData(false);

            if (err?.code === "permission-denied") {
              setError("Access denied. Check your permissions.");
            } else if (err?.code === "unavailable") {
              setError("Database service temporarily unavailable.");
            } else if (err?.code !== "failed-precondition") {
              setError("Failed to load notifications");
            }
          }
        );

        const processFeedbacksList = (snap: any) => {
          if (!isMountedRef.current) return;

          const items = snap.docs
            .filter((d: any) => d.data().deleted !== true)
            .map((d: any) => {
              const data = d.data();
              return {
                id: d.id,
                message: "New feedback",
                isRead: false,
                createdAt: toIsoString(data.createdAt),
                type: "anonymous_feedback" as const,
                feedbackImageUrl: data.feedbackImageUrl,
                feedbackMessage: data.message || data.feedbackMessage,
                anonymousId: data.anonymousId,
                attachmentUrl: data.attachmentUrl,
                attachmentName: data.attachmentName,
                submitterId: data.submitterId,
                submitterIp: data.submitterIp,
                sessionId: data.sessionId,
                isOwnerReply: data.isOwnerReply === true,
                recipientId: data.recipientId,
                visitorId: data.visitorId,
                targetUid: data.targetUid,
                threadId: data.threadId,
                coolId: "",
                status: data.status,
                mode: data.mode,
                hasReply: data.hasReply,
                senderCanReply: data.senderCanReply,
                receiverCanReply: data.receiverCanReply,
                isAnonymousToRecipient: data.isAnonymousToRecipient === true,
                isFirstSender: data.isFirstSender,
              };
            });

          setFeedbacks((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            let changed = false;
            for (const item of items) {
              const existing = map.get(item.id);
              if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
                // ✅ FIX: Remove optimistic message once real one arrives
                if (!item.id.startsWith("opt_")) {
                  for (const [k, v] of map.entries()) {
                    if (k.startsWith("opt_") && v.feedbackMessage === item.feedbackMessage && optimisticMessagesRef.current.has(k)) {
                      map.delete(k);
                      optimisticMessagesRef.current.delete(k);
                      changed = true;
                    }
                  }
                }
                map.set(item.id, item);
                changed = true;
              }
            }
            if (!changed) return prev;
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        };

        unsubF = onSnapshot(
          query(
            collection(firestore, "feedbacks"),
            where("recipientId", "==", uid),
            orderBy("createdAt", "desc"),
            limit(100)
          ),
          processFeedbacksList,
          (_err) => {
            if (!isMountedRef.current) return;
          }
        );

        const unsubFSent = onSnapshot(
          query(
            collection(firestore, "feedbacks"),
            where("submitterId", "==", uid),
            orderBy("createdAt", "desc"),
            limit(100)
          ),
          processFeedbacksList,
          (_err) => {
            if (!isMountedRef.current) return;
          }
        );

        const originalUnsubF = unsubF;
        unsubF = () => {
          originalUnsubF?.();
          unsubFSent?.();
        };
      } catch {
        if (!isMountedRef.current) return;
        setNotifications([]);
        setFeedbacks([]);
        setError("Failed to connect to database");
      } finally {
        if (isMountedRef.current) {
          setLoadingData(false);
        }
      }
    };

    run();
    return () => {
      unsubN?.();
      if (typeof unsubF === "function") unsubF();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const universal = localStorage.getItem("picpop_legal_v1") === "true";
      const userSpecific = user?.uid
        ? localStorage.getItem(`picpop_terms_accepted_${user.uid}`) === "true"
        : false;
      if (universal || userSpecific) {
        setShowTerms(false);
        return;
      }
    }

    if (!loading && user && profile && profile.coolId) {
      const isAcceptedInStore = profile.termsAccepted && profile.privacyAccepted;
      if (!isAcceptedInStore) {
        setShowTerms(true);
      } else {
        setShowTerms(false);
      }
    }
  }, [user, profile, loading]);

  const handleEnableNotifications = async () => {
    if (notifStatus === "enabled" || notifStatus === "unsupported") return;
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const iosHint = getIosPushHint();
    if (iosHint) {
      toast.error(iosHint);
      return;
    }
    setNotifStatus("loading");
    try {
      const token = await requestNotificationPermission();
      if (!isMountedRef.current) return;

      if (token && user) {
        await saveFcmToken(user.uid, token);
        if (isMountedRef.current) {
          setNotifStatus("enabled");
          toast.success("Notifications enabled");
        }
      } else {
        const perm = typeof Notification !== "undefined" ? Notification.permission : "denied";
        if (isMountedRef.current) {
          setNotifStatus(perm === "denied" ? "denied" : "idle");
          if (perm === "denied") toast.error("Notifications blocked by browser.");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setNotifStatus("idle");
        toast.error(getErrorMessage(err));
      }
    }
  };

  const handleShare = (text?: string, url?: string) => {
    const shareText = text || "Check this out on PicPop!";
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    if (navigator.share) {
      navigator.share({ title: "PicPop", text: shareText, url: shareUrl }).catch(() => { });
    } else if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  const handleDisableNotifications = async () => {
    if (notifStatus !== "enabled" || !user) return;
    setNotifStatus("loading");
    try {
      await clearFcmToken(user.uid);
      if (isMountedRef.current) {
        setNotifStatus("idle");
        toast.success("Notifications disabled");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setNotifStatus("enabled");
        toast.error("Could not disable notifications");
      }
    }
  };

  const latestFeedbackId = selectedGroup ? selectedGroup.latestItem.feedbackId || selectedGroup.latestItem.id : null;

  useEffect(() => {
    if (!selectedGroup || !latestFeedbackId) return;
    setReplyText("");
    viewStartTime.current = Date.now();

    const logView = async () => {
      try {
        const functions = getAppFunctions();
        if (functions) {
          await httpsCallable(functions, "logFeedbackActivity")({
            feedbackId: latestFeedbackId,
            type: "view",
          });
        }
      } catch (err) {
        /* ignore */
      }
    };
    logView();

    return () => {
      const timeSpent = Date.now() - viewStartTime.current;
      if (timeSpent > 500) {
        const logTime = async () => {
          try {
            const functions = getAppFunctions();
            if (functions) {
              await httpsCallable(functions, "logFeedbackActivity")({
                feedbackId: latestFeedbackId,
                type: "time",
                timeSpent,
              });
            }
          } catch (err) {
            /* ignore */
          }
        };
        logTime();
      }
    };
  }, [selectedGroup, latestFeedbackId]);

  useEffect(() => {
    if (!selectedGroup || !db || !user?.uid) return;

    const threadId = selectedGroup.items.find((i) => i.threadId)?.threadId;
    if (!threadId) return;

    const firestore = db;
    const q = query(
      collection(firestore, "feedbacks"),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!isMountedRef.current) return;

      const items = snap.docs
        .filter((d) => d.data().deleted !== true)
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            message: "New feedback",
            isRead: false,
            createdAt: toIsoString(data.createdAt),
            type: "anonymous_feedback" as const,
            feedbackImageUrl: data.feedbackImageUrl,
            feedbackMessage: data.message || data.feedbackMessage,
            anonymousId: data.anonymousId,
            attachmentUrl: data.attachmentUrl,
            attachmentName: data.attachmentName,
            submitterId: data.submitterId,
            submitterIp: data.submitterIp,
            sessionId: data.sessionId,
            isOwnerReply: data.isOwnerReply === true,
            recipientId: data.recipientId,
            visitorId: data.visitorId,
            targetUid: data.targetUid,
            threadId: data.threadId,
            coolId: "",
            status: data.status,
            mode: data.mode,
            hasReply: data.hasReply,
            senderCanReply: data.senderCanReply,
            receiverCanReply: data.receiverCanReply,
            isAnonymousToRecipient: data.isAnonymousToRecipient === true,
            isFirstSender: data.isFirstSender,
          };
        });

      setFeedbacks((prev) => {
        const map = new Map(prev.map((i) => [i.id, i]));
        let changed = false;
        for (const item of items) {
          const existing = map.get(item.id);
          if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
            // ✅ FIX: Remove optimistic message once real one arrives
            if (!item.id.startsWith("opt_")) {
              for (const [k, v] of map.entries()) {
                if (k.startsWith("opt_") && v.feedbackMessage === item.feedbackMessage && optimisticMessagesRef.current.has(k)) {
                  map.delete(k);
                  optimisticMessagesRef.current.delete(k);
                  changed = true;
                }
              }
            }
            map.set(item.id, item);
            changed = true;
          }
        }
        if (!changed) return prev;
        return Array.from(map.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });

    return () => unsub();
  }, [selectedGroup, user?.uid]);

  const handleSelectItem = async (group: GroupedItem) => {
    if (group.itemType !== "visit") {
      setSelectedGroup(group);
      const docId = group.latestItem.feedbackId || group.latestItem.id;
      setFeedbackDocId(docId);
    }

    const unreadIds = group.items
      .filter((i) => !i.isRead)
      .map((i) => {
        const linked = notifications.find((n) => n.id === i.id || n.feedbackId === i.id);
        return linked?.id;
      })
      .filter((id): id is string => !!id);

    const firestore = db;
    if (unreadIds.length > 0 && firestore) {
      try {
        const batch = writeBatch(firestore);
        unreadIds.forEach((id) => {
          batch.update(doc(firestore, "notifications", id), { isRead: true });
        });
        await batch.commit();

        // 2. Mark in RTDB for instant update across tabs
        if (user?.uid) {
          const { markOwnerNotificationAsRead } = await import("@/lib/realtime-notifications");
          for (const id of unreadIds) {
            // notifications list usually has many items, but we only have ID
            // The ID in Firestore 'notifications' is the same as in RTDB 'users/uid/notifications'
            // because the functions use feedbackId or a generated ID consistently.
            // Actually, the RTDB key is usually the feedbackId.
            const item = notifications.find(n => n.id === id);
            const rtdbKey = item?.feedbackId || id;
            await markOwnerNotificationAsRead(user.uid, rtdbKey);
          }
        }
      } catch {
        /* ignore */
      }
    }
  };

  const handleDelete = async () => {
    if (!feedbackDocId || !user || !selectedGroup) return;
    setOptionsOpen(false);
    setDeleting(true);
    try {
      const functions = getAppFunctions();
      if (!functions) throw new Error("Firebase not configured");
      const deleteInboxFeedback = httpsCallable<{ feedbackId: string }, { success: boolean }>(
        functions,
        "deleteInboxFeedback"
      );

      for (const item of selectedGroup.items) {
        const id = item.feedbackId || item.id;
        if (id) {
          try {
            await deleteInboxFeedback({ feedbackId: id });
          } catch (e) {
            /* ignore individual failures */
          }
        }
      }
      setSelectedGroup(null);
      toast.success("Chat deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // ✅ CORRECTED: Proper one-way messaging logic
  const handleSendReply = async () => {
    // ✅ FIX: Prevent double send
    if (isSendingRef.current) return;

    if (!selectedGroup || !user) return;
    if (!replyText.trim() && !pendingFile) return;

    const items = selectedGroup.items;

    // ✅ CORRECT: Only sender waits for owner's reply
    const hasReplyFromOwner = items.some((i) => i.isOwnerReply === true);
    const amOriginalSender = items.some((i) => !i.isOwnerReply && i.submitterId === uid);

    if (amOriginalSender && !hasReplyFromOwner) {
      toast.error("Waiting for their reply to start chatting");
      return;
    }

    const text = replyText.trim();
    const fileToUpload = pendingFile;
    const isImageFile = fileToUpload?.type.startsWith("image/") ?? false;

    const originalMessage =
      items.find((i) => !i.isOwnerReply && i.submitterId !== uid) ??
      items.find((i) => !i.isOwnerReply) ??
      items.find((i) => i.submitterId !== uid) ??
      items[0];

    const partnerSubmitterId =
      originalMessage?.submitterId && originalMessage.submitterId !== uid
        ? originalMessage.submitterId
        : null;
    const visitorId = items.find((i) => i.visitorId)?.visitorId ?? null;
    const anonymousId = items.find((i) => i.anonymousId)?.anonymousId ?? visitorId ?? null;
    const sessionId = items.find((i) => i.sessionId)?.sessionId ?? null;

    const routingId = partnerSubmitterId ?? anonymousId ?? sessionId;
    if (!routingId) {
      toast.error("Cannot reply to this message");
      return;
    }

    // ✅ FIX: Set flag to prevent concurrent sends
    isSendingRef.current = true;

    let attachmentUrl = null;
    let attachmentName = null;

    if (fileToUpload) {
      setUploadingFile(true);
      try {
        const fileId = "att_" + Math.random().toString(36).substring(2, 9);
        attachmentUrl = await uploadAttachment(fileToUpload, fileId);
        attachmentName = fileToUpload.name;
      } catch (err) {
        toast.error("Failed to upload file");
        setUploadingFile(false);
        isSendingRef.current = false;
        return;
      } finally {
        setUploadingFile(false);
      }
    }

    setReplyText("");
    setPendingFile(null);

    const optId = "opt_" + Math.random().toString(36).substring(2, 9);
    const optItem: NotifItem = {
      id: optId,
      message: text || (isImageFile ? "Sent an image" : attachmentUrl ? "Sent a file" : ""),
      feedbackMessage: text || undefined,
      feedbackImageUrl: isImageFile && attachmentUrl ? attachmentUrl : undefined,
      attachmentUrl: !isImageFile && attachmentUrl ? attachmentUrl : undefined,
      attachmentName: !isImageFile && attachmentName ? attachmentName : undefined,
      createdAt: new Date().toISOString(),
      isRead: true,
      type: "anonymous_feedback",
      isOwnerReply: true,
      submitterId: uid,
      recipientId: partnerSubmitterId ?? anonymousId ?? sessionId ?? uid,
      visitorId: visitorId ?? undefined,
      targetUid: partnerSubmitterId ?? undefined,
      sessionId: sessionId ?? undefined,
      coolId: "",
      threadId:
        items.find((i) => i.id || i.feedbackId)?.id ||
        items[0].id,
      isFirstSender: false,
    };

    // ✅ FIX: Track optimistic message
    optimisticMessagesRef.current.add(optId);

    setFeedbacks((prev) => [...prev, optItem]);
    setSendingReply(true);

    try {
      const functions = getAppFunctions();
      if (!functions) throw new Error("Firebase not configured");

      const threadId =
        items.find((i) => i.threadId)?.threadId ||
        items.find((i) => i.feedbackId)?.feedbackId ||
        items[0].id;


      const submitOwnerReply = httpsCallable<
        {
          message: string;
          anonymousId: string;
          targetUid: string | null;
          sessionId: string | null;
          feedbackImageUrl?: string | null;
          attachmentUrl?: string | null;
          attachmentName?: string | null;
          threadId: string;
        },
        { success: boolean }
      >(functions, "submitOwnerReply");

      await submitOwnerReply({
        message: text,
        anonymousId: partnerSubmitterId ? "" : anonymousId ?? "",
        targetUid: partnerSubmitterId,
        sessionId: sessionId,
        feedbackImageUrl: isImageFile && attachmentUrl ? attachmentUrl : null,
        attachmentUrl: !isImageFile && attachmentUrl ? attachmentUrl : null,
        attachmentName: !isImageFile && attachmentName ? attachmentName : null,
        threadId: threadId,
      });
    } catch (err) {
      // ✅ FIX: Remove optimistic message on error
      setFeedbacks((prev) => prev.filter((f) => f.id !== optId));
      optimisticMessagesRef.current.delete(optId);
      setReplyText(text);
      toast.error(getErrorMessage(err));
    } finally {
      setSendingReply(false);
      // ✅ FIX: Clear sending flag
      isSendingRef.current = false;
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    const firestore = db;
    if (unread.length === 0 || !firestore) return;
    try {
      const batch = writeBatch(firestore);
      for (const n of unread) {
        batch.update(doc(firestore, "notifications", n.id), { isRead: true });
      }
      await batch.commit();
      toast.success("Marked all as read");
    } catch {
      toast.error("Could not mark as read");
    }
  };

  const getConversationKey = (item: any): string => {
    if (item.itemType === "visit") return "all-visits";

    const feedbackId = item.feedbackId || item.id;

    if (item.threadId && item.threadId !== feedbackId) {
      return `thread_${item.threadId}`;
    }

    return `feedback_${feedbackId}`;
  };

  const getStablePartnerId = (baseId: string, item: any): string => {
    if (baseId === "self-chat") return "self-chat";
    if (baseId === "unknown") return "unknown";
    return item.visitorId || item.sessionId || item.anonymousId || baseId;
  };

  const mergedFeedbackItems: NotifItem[] = [];
  const seenKeys = new Set<string>();

  for (const f of feedbacks) {
    seenKeys.add(f.id);
    mergedFeedbackItems.push(f);
  }
  for (const n of notifications) {
    if (n.type === "visit") continue;
    const key = n.feedbackId || n.id;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      mergedFeedbackItems.push(n);
    }
  }

  const feedbackItems = mergedFeedbackItems.map((i) => ({
    ...i,
    itemType: "feedback" as const,
  }));
  const visitItems = notifications
    .filter((n) => n.type === "visit")
    .map((i) => ({ ...i, itemType: "visit" as const }));

  const allItems = [...feedbackItems, ...visitItems]
    .map((item) => {
      const notif = notifications.find((n) => n.feedbackId === item.id || n.id === item.id);
      return { ...item, isRead: notif ? notif.isRead : true };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      } catch {
        /* ignore */
      }
    };

    setup();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, [toast]);

  useEffect(() => {
    const ids = new Set<string>();
    allItems.forEach((item) => {
      const pid =
        // Alice (Sender) sees Bob (Recipient)
        (item.submitterId === uid && !item.isOwnerReply && item.recipientId && item.recipientId !== uid)
          ? item.recipientId
          : // If we are recipient and it's NOT anonymous, we can see the sender
          (item.recipientId === uid && canUserSeeProfile(item, uid) && item.submitterId && item.submitterId !== uid)
            ? item.submitterId
            : null;
      if (pid && !profileCache[pid] && !resolvingIds.has(pid)) ids.add(pid);
    });

    if (ids.size === 0 || !db) return;

    const resolve = async () => {
      const toFetch = Array.from(ids);
      setResolvingIds((prev) => {
        const n = new Set(prev);
        toFetch.forEach((id) => n.add(id));
        return n;
      });

      const newCache = { ...profileCache };
      const firestore = db;
      if (!firestore) return;

      // Batch queries in chunks of 30 (Firestore limit)
      const chunks: string[][] = [];
      for (let i = 0; i < toFetch.length; i += 30) {
        chunks.push(toFetch.slice(i, i + 30));
      }

      for (const chunk of chunks) {
        try {
          const q = query(collection(firestore, "usernames"), where("uid", "in", chunk));
          const snap = await getDocs(q);
          snap.docs.forEach(doc => {
            const data = doc.data();
            if (data.uid) newCache[data.uid] = doc.id;
          });
          // Fallback for any that didn't resolve
          chunk.forEach(id => {
            if (!newCache[id]) newCache[id] = id.slice(0, 8);
          });
        } catch {
          /* ignore */
        }
      }
      setProfileCache(newCache);
    };
    resolve();
  }, [allItems, uid, profileCache, resolvingIds]);

  const groupedItems = useMemo(() => {
    const groupedMap = new Map<string, NotifItem[]>();
    for (const item of allItems) {
      const gKey = getConversationKey(item);
      if (!groupedMap.has(gKey)) groupedMap.set(gKey, []);
      groupedMap.get(gKey)!.push(item);
    }

    return Array.from(groupedMap.entries())
      .map(([groupId, items]): GroupedItem => {
        // Sort items in this thread by time ASC to find the original message
        const sorted = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const first = sorted[0];
        const latest = sorted[sorted.length - 1];

        const isOwnerOfThread = first.recipientId === uid;
        const threadType = isOwnerOfThread ? "inbox" : "sent";

        // Partner is the one who ISN'T me in the first message
        const threadPartnerId = isOwnerOfThread
          ? (first.submitterId || first.anonymousId || groupId)
          : (first.recipientId || groupId);

        const hasReply = sorted.some(i => i.isOwnerReply);
        const isInitialSender = !first.isOwnerReply && first.submitterId === uid;



        return {
          id: groupId,
          itemType: first.itemType,
          threadType,
          threadPartnerId,
          items: sorted,
          createdAt: latest.createdAt,
          latestItem: latest,
          status: isInitialSender && !hasReply ? "feedback_only" : "active_chat",
          feedbackId: first.feedbackId || first.id,
          sharedImageUrl: sorted.find(i => i.feedbackImageUrl)?.feedbackImageUrl
        };
      })
      .filter((group) => group.itemType === "feedback")
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active_chat" ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allItems, uid]);

  const activeGroup = selectedGroup
    ? groupedItems.find((g) => g.id === selectedGroup.id) ?? selectedGroup
    : null;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (activeGroup) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGroup?.items.length]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--pink)" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-[var(--text-muted)] font-semibold mb-2">Someone shared a response with you</p>
          <p className="text-xs text-[var(--text-muted)] opacity-70 mb-6">Sign in to view your inbox and chat</p>
          <Link href="/login" className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:shadow-lg transition-all">
            Sign in to view
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--pink)]/30 relative overflow-x-hidden">
      <style>{`:root { --pink: #FF3D7F; --purple: #7C3AFF; --blue: #00C8FF; --green: #00FF94; }`}</style>
      <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[var(--pink)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[var(--purple)]/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />
      <div className="h-20" />

      <main className="max-w-[620px] mx-auto px-4 py-10">
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Inbox
          </h1>
          <div className="w-2 h-2 rounded-full bg-[var(--pink)] shadow-[0_0_10px_var(--pink)]" />
        </div>

        {error && (
          <div className="p-4 rounded-xl mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 underline hover:text-red-300">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col gap-3 p-5 rounded-2xl bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20">
                  <Bell className="w-5 h-5 text-[var(--pink)]" />
                </div>
                <div className="flex flex-col">
                  <p className="font-black text-sm tracking-tight">Push Notifications</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">
                    Never miss a secret reply
                  </p>
                </div>
              </div>
              {notifStatus === "unsupported" ? (
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] opacity-50">
                  Not Supported
                </span>
              ) : (
                <button
                  onClick={() =>
                    notifStatus === "enabled"
                      ? handleDisableNotifications()
                      : handleEnableNotifications()
                  }
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 ${notifStatus === "enabled"
                    ? "bg-[var(--pink)] shadow-[0_0_15px_rgba(255,61,127,0.3)]"
                    : "bg-white/10"
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm ${notifStatus === "enabled" ? "translate-x-6" : "translate-x-0"
                      }`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">
            Messages
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--pink)] hover:text-white transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loadingData ? (
            <div className="py-24 text-center">
              <div
                className="w-10 h-10 rounded-full border-4 border-white/5 border-t-[var(--pink)] animate-spin mx-auto"
              />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Loading vibes...</p>
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-white/20" />
              </div>
              <p className="font-black text-xl text-white">No vibes yet</p>
              <p className="text-sm text-[var(--text-muted)] font-bold mt-2">Your inbox is waiting for its first reaction.</p>
              <Link href="/dashboard" className="mt-8 inline-block px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all">
                Share Link
              </Link>
            </div>
          ) : (
            <>
              {groupedItems.map((item) => (
                <Fragment key={item.id}>
                  {item.itemType === "visit" ? (
                    <div
                      className={`w-full p-5 rounded-[32px] border transition-all group relative overflow-hidden backdrop-blur-xl ${item.items.some((i) => !i.isRead)
                        ? "border-[var(--blue)]/30 bg-white/[0.04] shadow-[0_8px_32px_rgba(0,200,255,0.1)]"
                        : "border-white/5 bg-white/[0.01] opacity-60"
                        }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20 shadow-xl">
                          <Eye className="w-6 h-6 text-[var(--blue)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[11px] text-white/90 uppercase tracking-widest flex items-center gap-2">
                            Link viewed
                            {item.items.length > 1 && <span className="text-[var(--blue)] mx-1">× {item.items.length}</span>}
                            {item.items.some((i) => !i.isRead) && (
                              <span className="w-2 h-2 rounded-full bg-[var(--blue)] shadow-[0_0_10px_var(--blue)] animate-pulse" />
                            )}
                          </p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">
                            {formatTimeAgo(item.createdAt)} · {item.latestItem.coolId || "Global Link"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className={`w-full text-left p-2 pr-6 rounded-[32px] border transition-all group relative overflow-hidden backdrop-blur-3xl ${item.items.some((i) => !i.isRead)
                        ? "border-[var(--pink)]/40 bg-white/[0.08] shadow-[0_12px_40px_rgba(255,61,127,0.15)]"
                        : "border-white/5 bg-white/[0.02] opacity-80 hover:opacity-100 hover:bg-white/[0.04]"
                        }`}
                    >
                      <div className="flex gap-5 items-center relative z-10">
                        <div className="w-20 h-20 rounded-[24px] overflow-hidden shrink-0 bg-black/40 flex items-center justify-center relative border border-white/10 shadow-2xl transition-all group-hover:scale-105 duration-500">
                          {(() => {
                            const imageUrl =
                              item.sharedImageUrl ||
                              item.items.find((i) => i.feedbackImageUrl)?.feedbackImageUrl;
                            if (imageUrl)
                              return (
                                <img
                                  src={imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                  onError={() => setImageErrors((prev) => new Set(prev).add(item.id))}
                                />
                              );
                            return (
                              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center">
                                <MessageSquare className="w-10 h-10 text-white/50" />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {item.status === "feedback_only" ? (
                                <div className="flex items-center gap-1.5 bg-[var(--pink)]/10 border border-[var(--pink)]/20 px-3 py-1 rounded-full">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--pink)] animate-pulse" />
                                  <span className="text-[9px] font-black text-[var(--pink)] uppercase tracking-widest">
                                    NEW VIBE
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                  {item.threadType === "sent" ? "Verified" : (item.latestItem.isAnonymousToRecipient ? "Anonymous" : "Public")}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>

                          <p className={`font-black tracking-tight text-white/90 leading-tight ${item.items.some(i => !i.isRead) ? "text-lg" : "text-base opacity-70"}`}>
                            {(() => {
                              const last = item.latestItem;
                              const isMe = last.submitterId === uid;
                              if (last.feedbackMessage) return last.feedbackMessage;
                              if (last.attachmentUrl)
                                return isMe ? "You sent a file" : "Sent a file";
                              if (last.feedbackImageUrl)
                                return isMe ? "You sent an image" : "Sent an image";
                              return "No caption provided";
                            })()}
                          </p>

                          <div className="flex items-center justify-between gap-3 mt-1">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                              {item.threadType === "sent" && item.threadPartnerId !== "unknown" && profileCache[item.threadPartnerId]
                                ? `@${profileCache[item.threadPartnerId]}`
                                : (item.threadType === "sent" ? "OWNER" : (item.latestItem.isAnonymousToRecipient ? "GUEST" : "USER"))}
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              {item.items.length} {item.items.length === 1 ? 'msg' : 'msgs'}
                            </span>
                            {item.items.some((i) => !i.isRead) && (
                              <span className="w-3 h-3 rounded-full bg-[var(--pink)] shadow-[0_0_15px_var(--pink)] animate-pulse border-2 border-black" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}
                </Fragment>
              ))}
            </>
          )}
        </div>
      </main>

      {activeGroup && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="w-full h-full sm:h-[85vh] sm:max-w-2xl sm:rounded-[40px] bg-[var(--bg-primary)] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .chat-scroll::-webkit-scrollbar { width: 4px; }
              .chat-scroll::-webkit-scrollbar-track { background: transparent; }
              .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
              @keyframes msg-in { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
              .msg-in { animation: msg-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            `}</style>

            <div className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 -ml-2 rounded-2xl hover:bg-white/10 text-white/50 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <p className="text-base font-black text-white leading-tight">
                    {/* If I am the recipient and it IS anonymous, show Anonymous Fan immediately */}
                    {activeGroup.threadType === "sent"
                      ? (profileCache[activeGroup.threadPartnerId]
                        ? `@${profileCache[activeGroup.threadPartnerId]}`
                        : "Owner")
                      : (activeGroup.latestItem.isAnonymousToRecipient ? "Guest" : "Public User")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">
                      {activeGroup.threadType === "sent" ? "Sending" : "Receiving"} Vibe
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center gap-2" ref={optionsRef}>
                <button
                  onClick={() => setOptionsOpen(!optionsOpen)}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all shadow-xl"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {optionsOpen && (
                  <div className="absolute right-0 top-full mt-2 py-2 min-w-[160px] rounded-2xl border border-white/10 bg-[#151515] shadow-2xl z-20 animate-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Chat
                    </button>
                    <button
                      onClick={() => { setReportModalOpen(true); setOptionsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-white/40 hover:bg-white/5 transition-colors"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scroll px-6 py-8 flex flex-col gap-6">
              {activeGroup.items
                .slice()
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((chatItem, idx, arr) => {
                  const isMe =
                    // Case 1: Direct submitterId match (standard logged-in users)
                    chatItem.submitterId === uid ||
                    // Case 2: Owner replies are always "me" if I'm the owner
                    (chatItem.isOwnerReply && chatItem.submitterId === uid) ||
                    // Case 3: Optimistic messages (sent by me, awaiting server confirmation)
                    (uid && optimisticMessagesRef.current.has(chatItem.id)) ||
                    // ✅ CRITICAL FIX: Handle null submitterId from non-logged-in users
                    // If no submitterId, not an owner reply, but threadType is "sent",
                    // it means we (the logged-in user) sent this as an anonymous/guest
                    (!chatItem.submitterId && !chatItem.isOwnerReply && activeGroup?.threadType === "sent") ||
                    // Also handle messages sent TO a specific user (they have targetUid set)
                    (!chatItem.submitterId && chatItem.targetUid && chatItem.targetUid !== uid && !chatItem.isOwnerReply);

                  if (idx > 0 && arr[idx - 1].id === chatItem.id) return null;

                  return (
                    <div key={chatItem.id || idx} className={`flex flex-col gap-2 msg-in ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-xs font-black text-white shadow-xl ${isMe
                          ? "bg-gradient-to-br from-pink-500 to-purple-600 rotate-3"
                          : "bg-white/10 -rotate-3 border border-white/5"
                          }`}>
                          {(() => {
                            if (isMe) return "ME";
                            return <CircleUser className="w-5 h-5" />;
                          })()}
                        </div>
                        <div
                          className={`rounded-3xl p-4 shadow-2xl relative group/bubble ${isMe ? "rounded-br-sm text-white" : "rounded-bl-sm border border-white/5"
                            } ${!isMe && chatItem.isRead ? "opacity-90 transition-opacity" : "opacity-100"}`}
                          style={isMe
                            ? { background: "linear-gradient(135deg, var(--pink), var(--purple))" }
                            : { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
                        >
                          {(chatItem.feedbackImageUrl || (idx === 0 && activeGroup.sharedImageUrl)) && (
                            <div className="relative group/img mb-2">
                              <img
                                src={chatItem.feedbackImageUrl || activeGroup.sharedImageUrl}
                                className="rounded-2xl w-full max-h-[350px] object-contain shadow-lg"
                                onClick={() => { setFeedbackDocId(chatItem.feedbackId || chatItem.id); setShareModalOpen(true); }}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShare("Reaction on PicPop!", chatItem.feedbackImageUrl || activeGroup.sharedImageUrl); }}
                                className="absolute top-2 right-2 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[var(--pink)] flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.4)] z-10"
                              >
                                <Share2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                              </button>
                            </div>
                          )}
                          {chatItem.attachmentUrl && (
                            <div className="mb-2">
                              <a href={chatItem.attachmentUrl} target="_blank" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-inner"><FileText className="w-5 h-5 text-blue-400" /></div>
                                <div className="min-w-0 pr-2">
                                  <p className="text-[11px] font-black text-white truncate">{chatItem.attachmentName || "Document"}</p>
                                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Download</p>
                                </div>
                              </a>
                            </div>
                          )}
                          {chatItem.feedbackMessage && (
                            <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{chatItem.feedbackMessage}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-[0.1em] text-white/20 ${isMe ? "mr-12" : "ml-12"}`}>
                        {formatTimeAgo(chatItem.createdAt)}
                      </span>
                    </div>
                  );
                })}
              <div ref={chatEndRef} />
            </div>

            {activeGroup.status === "feedback_only" && activeGroup.threadType === "sent" && (
              <div className="mx-6 mb-4 p-5 rounded-[28px] bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-xl animate-pulse">
                <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest text-center">
                  💭 Waiting for owner to reply before you can continue chatting
                </p>
              </div>
            )}

            <div className="p-4 sm:p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="max-w-xl mx-auto flex flex-col gap-3">
                {pendingFile && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-400" /></div>
                    <p className="flex-1 text-[11px] font-bold text-white/60 truncate">{pendingFile.name}</p>
                    <button onClick={() => setPendingFile(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="flex items-end gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setPendingFile(e.target.files?.[0] || null)} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingReply}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-30 shadow-lg"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendReply())}
                    placeholder="Type a response..."
                    className="flex-1 max-h-32 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--pink)] transition-all resize-none placeholder:text-white/20"
                    rows={1}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={(!replyText.trim() && !pendingFile) || sendingReply}
                    className="p-4 rounded-2xl text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
                  >
                    {sendingReply ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FeedbackShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        singleFeedback={{
          feedbackImageUrl:
            activeGroup?.items.find((i) => (i.feedbackId || i.id) === feedbackDocId)
              ?.feedbackImageUrl || "",
        }}
        feedbackId={feedbackDocId}
        allData={{
          imageUrl:
            activeGroup?.items.find((i) => (i.feedbackId || i.id) === feedbackDocId)
              ?.feedbackImageUrl || "",
          coolId: profile?.coolId ?? "picpop",
          feedbackImageUrls: [],
        }}
        shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/u/${profile?.coolId ?? "picpop"
          }`}
        userFeedbackLink={`${typeof window !== "undefined" ? window.location.origin : ""}/u/${profile?.coolId ?? "picpop"
          }`}
      />
      <TermsModal isOpen={showTerms} onAccept={() => setShowTerms(false)} />
      <ReportFeedbackModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        feedbackId={feedbackDocId || ""}
        onReportSuccess={() => {
          toast.success("Reported");
          setSelectedGroup(null);
        }}
        onReportError={(m) => toast.error(m)}
      />
    </div>
  );
}