// lib/session-utils.ts
// Shared session ID logic for guests

const STORAGE_KEY = "picpop_session_id_v2";

export function getSessionId() {
  if (typeof window === "undefined") return null;

  // Try localStorage first
  let sid = localStorage.getItem(STORAGE_KEY);

  if (sid) {

    return sid;
  }

  // Fallback: Check sessionStorage
  sid = sessionStorage.getItem(STORAGE_KEY);

  if (sid) {

    try {
      localStorage.setItem(STORAGE_KEY, sid);

    } catch (e) {
      console.warn("[DEBUG] [Session] Could not sync to localStorage:", e);
    }
    return sid;
  }

  // Generate new session ID
  sid = generateUniqueSessionId();

  try {
    localStorage.setItem(STORAGE_KEY, sid);

  } catch (e) {
    console.warn("[DEBUG] [Session] localStorage not available, using sessionStorage only");
    sessionStorage.setItem(STORAGE_KEY, sid);

  }

  return sid;
}

function generateUniqueSessionId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `ss_${timestamp}_${randomPart}${randomPart2}`;
}

export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

  } catch (e) {
    console.warn("[Session] Could not clear session:", e);
  }
}