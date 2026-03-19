// lib/realtime-notifications.ts
// Real-time WebSocket notifications + offline message count

import { getDatabase, ref, onValue, off, set, update, onChildAdded, get } from 'firebase/database';

interface PendingMessage {
  id: string;
  from: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
  threadId?: string;
}

// TIER 1: Real-time listener (client gets instant notifications while app is open)
export function listenForRealtimeMessages(
  sessionId: string,
  onMessageCallback: (msg: any) => void
): () => void {
  const db = getDatabase();
  const messagesRef = ref(db, `sessions/${sessionId}/messages`);
  let isFirstCall = true;



  return onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val();
    if (msg && msg.isOwnerReply === true) {
      onMessageCallback({
        id: snapshot.key,
        ...msg,
        isRead: msg.isRead || false
      });
    }
  });
}
// TIER 2: Get unread count (called when user returns after closing browser)
export async function getUnreadMessageCount(sessionId: string): Promise<number> {
  try {
    const db = getDatabase();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        off(ref(db, `sessions/${sessionId}/messages`));
        resolve(0);
      }, 5000);

      onValue(
        ref(db, `sessions/${sessionId}/messages`),
        (snapshot) => {
          clearTimeout(timeout);
          off(ref(db, `sessions/${sessionId}/messages`));

          if (!snapshot.exists()) {
            resolve(0);
            return;
          }

          const messages = snapshot.val();
          const unreadCount = Object.values(messages).filter((m: any) => m.read !== true).length;

          resolve(unreadCount);
        },
        (err) => {
          clearTimeout(timeout);
          console.error('[getUnreadMessageCount] Error:', err);
          resolve(0);
        }
      );
    });
  } catch (err) {
    console.error('[getUnreadMessageCount] Failed:', err);
    return 0;
  }
}

// Get all messages for display
export async function getAllMessages(sessionId: string): Promise<PendingMessage[]> {
  try {
    const db = getDatabase();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        off(ref(db, `sessions/${sessionId}/messages`));
        resolve([]);
      }, 5000);

      onValue(
        ref(db, `sessions/${sessionId}/messages`),
        (snapshot) => {
          clearTimeout(timeout);
          off(ref(db, `sessions/${sessionId}/messages`));

          if (!snapshot.exists()) {
            resolve([]);
            return;
          }

          const messages = snapshot.val();
          const result: PendingMessage[] = [];

          Object.entries(messages).forEach(([id, data]: any) => {
            result.push({
              id,
              from: data.from || 'owner',
              message: data.message || 'Sent an image/file',
              imageUrl: data.imageUrl,
              createdAt: data.createdAt,
              threadId: data.threadId,
            });
          });

          result.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          resolve(result);
        }
      );
    });
  } catch (err) {
    console.error('[getAllMessages] Failed:', err);
    return [];
  }
}

// Mark message as read
export async function markMessageAsRead(sessionId: string, messageId: string) {
  try {
    const db = getDatabase();
    await update(ref(db, `sessions/${sessionId}/messages/${messageId}`), {
      read: true,
      readAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[markMessageAsRead] Error:', err);
  }
}

// Create session when user first sends a message
export async function createSession(sessionId: string) {
  try {
    const db = getDatabase();

    await update(ref(db, `sessions/${sessionId}`), {
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[createSession] Error:', err);
  }
}

// Keep session alive (called periodically)
export async function keepSessionAlive(sessionId: string) {
  try {
    const db = getDatabase();
    await update(ref(db, `sessions/${sessionId}`), {
      lastActive: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[keepSessionAlive] Error:', err);
  }
}


export async function linkSessionToUser(
  sessionId: string,
  userId: string
): Promise<void> {
  try {
    const db = getDatabase();
    const sessionPath = `sessions/${sessionId}`;
    console.log(`[DEBUG] [Session] Updating RTDB session path: ${sessionPath}`);
    const sessionRef = ref(db, sessionPath);

    // Update session with user info
    await update(sessionRef, {
      linkedUserId: userId,
      linkedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    });

    // Create reverse mapping: user -> sessions
    const mappingPath = `users/${userId}/sessions/${sessionId}`;
    console.log(`[DEBUG] [Session] Creating RTDB user mapping path: ${mappingPath}`);
    const userSessionsRef = ref(db, mappingPath);
    await set(userSessionsRef, {
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
  } catch (err) {
    console.error("[Session] Error linking session to user:", err);
    throw err;
  }
}

export async function getUserSessions(userId: string): Promise<string[]> {
  try {
    const db = getDatabase();
    const userSessionsRef = ref(db, `users/${userId}/sessions`);
    const snapshot = await get(userSessionsRef);

    if (!snapshot.exists()) {
      console.log("[Session] No sessions found for user:", userId);
      return [];
    }

    const sessions = Object.keys(snapshot.val());
    console.log("[Session] Found sessions for user:", { userId, count: sessions.length });
    return sessions;
  } catch (err) {
    console.error("[Session] Error retrieving user sessions:", err);
    return [];
  }
}