"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSessionId } from "@/lib/session-utils";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, onValue, getDatabase } from "firebase/database";

export function useRealtimeActivity() {
  const { user, profile } = useAuth();
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    if (user?.uid) {
      // For Authenticated Users: Feed comes from the "feedbacks" collection
      const q = query(
        collection(db, "feedbacks"),
        where("recipientId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Rule: Only show visitor responses (filter out my own replies)
        setActivity(list.filter((m: any) => !m.isOwnerReply && m.from !== 'owner'));
      }, () => {
        /* ignore */
      });
      return () => unsub();
    } else {
      // For Non-Login Guests: Feed comes from their Session Messages in RTDB
      const sid = getSessionId();
      if (!sid) return;

      const dbRef = ref(getDatabase(), `sessions/${sid}/messages`);
      const unsub = onValue(dbRef, (snapshot) => {
        if (!snapshot.exists()) {
          setActivity([]);
          return;
        }
        const data = snapshot.val();
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        
        // Rule: Show only "Responses" (Replies from Owners to this Guest)
        // In RTDB, an owner reply has from === 'owner'
        const ownerReplies = list
          .filter((m: any) => m.from === 'owner')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
          
        setActivity(ownerReplies);
      });
      return () => unsub();
    }
  }, [user?.uid]);

  return { activity, coolId: profile?.coolId || "You" };
}
