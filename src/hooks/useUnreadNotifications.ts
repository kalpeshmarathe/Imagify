import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { getSessionId } from '@/lib/session-utils';

export interface NotificationItem {
  id: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "anonymous_feedback" | "visit" | "owner_reply";
  feedbackImageUrl?: string | null;
  coolId?: string;
  threadId?: string | null;
  isOwnerReply?: boolean;
}

const toIsoString = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && 'toDate' in val) return val.toDate().toISOString();
  return new Date().toISOString();
};

export function useUnreadNotifications(uid?: string | null) {
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    if (!uid && !sid) {
      setUnreadNotifications([]);
      setLoading(false);
      return;
    }

    const db = getDatabase();
    // Path: users/uid/notifications for owners OR sessions/sid/messages for guests
    const path = uid ? `users/${uid}/notifications` : `sessions/${sid}/messages`;
    const dbRef = ref(db, path);
    
    // Query for isRead === false
    const unreadQuery = query(dbRef, orderByChild('isRead'), equalTo(false));

    const unsubscribe = onValue(unreadQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setUnreadNotifications([]);
        setLoading(false);
        return;
      }

      const data = snapshot.val();
      const list: NotificationItem[] = Object.entries(data).map(([id, m]: [string, any]) => {
        return {
          id,
          recipientId: uid || sid || "",
          message: m.message || (m.from === "owner" ? "Sent a message" : "Sent a reaction"),
          isRead: false, // by definition of the query
          createdAt: toIsoString(m.createdAt),
          type: m.type || (m.from === "owner" ? "owner_reply" : "anonymous_feedback"),
          feedbackImageUrl: m.imageUrl || m.feedbackImageUrl || null,
          coolId: m.coolId || (uid ? "Visitor" : "Owner"),
          threadId: m.threadId || null,
          isOwnerReply: m.type === "owner_reply" || m.from === "owner"
        };
      });

      // Sort newest first
      const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUnreadNotifications(sorted);
      setLoading(false);
    }, (err) => {
      console.warn("[useUnreadNotifications] RTDB Listener fail:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { unreadNotifications, loading };
}
