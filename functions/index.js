const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const functions = require("firebase-functions/v1");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

initializeApp();

const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://imagify-5f3d5.web.app",
  "https://imagify-5f3d5.firebaseapp.com",
  "https://picpop.me",
  "https://www.picpop.me",
];

/** Get client IP from callable request */
function getClientIp(req) {
  if (!req || !req.headers) return "unknown";
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
}

/**
 * When someone adds image feedback to a post, send a push notification to the post owner.
 * Uses 1st gen to avoid Eventarc setup (2nd gen needs Eventarc Service Agent permissions).
 */
exports.onFeedbackCreated = functions.firestore.document("feedbacks/{feedbackId}").onCreate(async (snap, context) => {
  const feedback = snap.data();
  const hasImage = !!feedback?.imageId;
  const hasRecipient = !!feedback?.recipientId;
  if (!hasImage && !hasRecipient) {
    console.warn("onFeedbackCreated: feedback missing imageId and recipientId");
    return;
  }

  const db = getFirestore();
  const feedbackId = context.params.feedbackId;

  let ownerUserId;
  let coolId = "someone";
  let imageIdForLink = feedback.imageId || null;

  if (hasRecipient) {
    ownerUserId = feedback.recipientId;
    const userSnap = await db.doc(`users/${ownerUserId}`).get();
    if (!userSnap.exists) return;
    coolId = userSnap.data()?.coolId || "someone";
  } else {
    const imageSnap = await db.doc(`images/${feedback.imageId}`).get();
    if (!imageSnap.exists) return;
    const imageData = imageSnap.data();
    ownerUserId = imageData?.userId;
    if (!ownerUserId) return;
    coolId = imageData?.coolId || imageSnap.data()?.coolId || "someone";
  }

  try {
    const userSnap = await db.doc(`users/${ownerUserId}`).get();
    if (!userSnap.exists) {
      console.warn("onFeedbackCreated: user not found", ownerUserId);
      return;
    }
    const userData = userSnap.data();
    coolId = userData?.coolId || coolId;
    const title = "New feedback";
    const body = hasRecipient ? `Someone sent you feedback @${coolId}` : `Someone reacted to your post @${coolId}`;

    // Always write to notifications (for inbox display), even if user has no FCM token
    await db.collection("notifications").add({
      recipientId: ownerUserId,
      message: body,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
      type: "anonymous_feedback",
      imageId: imageIdForLink,
      coolId,
      feedbackImageUrl: feedback.feedbackImageUrl || null,
      feedbackId,
    });

    // Send push only if user has FCM token
    const fcmToken = userData?.fcmToken;
    if (fcmToken) {
      const clickLink = imageIdForLink ? `/f?imageId=${imageIdForLink}` : "/inbox";
      const message = {
        token: fcmToken,
        notification: { title, body },
        data: {
          type: "feedback",
          imageId: imageIdForLink || "",
          feedbackId: String(feedbackId),
          title,
          body,
          link: clickLink,
        },
        webpush: {
          fcmOptions: { link: clickLink },
        },
      };
      const messaging = getMessaging();
      await messaging.send(message);
      console.log("Push sent to owner", ownerUserId);
    }
  } catch (err) {
    console.error("Push notification failed:", err);
  }
});

/**
 * When someone visits a feedback link, notify the post/link owner.
 * Supports both imageOwnerId (/f page) and recipientId (/u page).
 */
exports.onVisitCreated = functions.firestore.document("visits/{visitId}").onCreate(async (snap, context) => {
  const visit = snap.data();
  const ownerUserId = visit?.imageOwnerId || visit?.recipientId;
  if (!ownerUserId) {
    console.warn("onVisitCreated: visit missing imageOwnerId or recipientId");
    return;
  }

  const db = getFirestore();

  try {
    const userSnap = await db.doc(`users/${ownerUserId}`).get();
    if (!userSnap.exists) return;
    const userData = userSnap.data();
    const coolId = visit.coolId || userData?.coolId || "your link";
    const title = "Link viewed";
    const body = `Someone viewed your feedback link @${coolId}`;

    // Always write to notifications (for inbox display)
    await db.collection("notifications").add({
      recipientId: ownerUserId,
      message: body,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
      type: "visit",
      imageId: visit.imageId || null,
      coolId,
    });

    // Send push only if user has FCM token
    const fcmToken = userData?.fcmToken;
    if (fcmToken) {
      const clickLink = visit.imageId ? `/f?imageId=${visit.imageId}` : "/inbox";
      const message = {
        token: fcmToken,
        notification: { title, body },
        data: {
          type: "visit",
          imageId: String(visit.imageId || ""),
          title,
          body,
          link: clickLink,
        },
        webpush: {
          fcmOptions: { link: clickLink },
        },
      };
      const messaging = getMessaging();
      await messaging.send(message);
      console.log("Visit push sent to owner", ownerUserId);
    }
  } catch (err) {
    console.error("Visit push failed:", err);
  }
});

/**
 * Report feedback - blocks reporter IP and stores report.
 * Uses v2 onCall with cors for localhost support.
 */
exports.reportFeedback = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const { feedbackId, reason, otherReason } = request.data || {};
  if (!feedbackId || !reason) {
    throw new HttpsError("invalid-argument", "feedbackId and reason are required");
  }

  const ip = getClientIp(request.rawRequest);

  const db = getFirestore();
  try {
    await db.runTransaction(async (tx) => {
      const reportRef = db.collection("reports").doc();
      tx.set(reportRef, {
        feedbackId,
        reason,
        otherReason: reason === "Other" ? (otherReason || "") : null,
        reporterIp: ip,
        createdAt: new Date().toISOString(),
      });
      const ipKey = ip.replace(/[.:]/g, "_");
      tx.set(db.collection("blockedIps").doc(ipKey), {
        ip,
        reason: "Reported feedback",
        createdAt: new Date().toISOString(),
      });
    });
    return { success: true };
  } catch (err) {
    console.error("reportFeedback failed:", err);
    throw new HttpsError("internal", "Report failed");
  }
});

/**
 * Delete inbox feedback - only recipient can delete (feedback with recipientId).
 */
exports.deleteInboxFeedback = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const { feedbackId } = request.data || {};
  if (!feedbackId) {
    throw new HttpsError("invalid-argument", "feedbackId is required");
  }
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in to delete");
  }

  const db = getFirestore();
  const feedbackSnap = await db.doc(`feedbacks/${feedbackId}`).get();
  if (!feedbackSnap.exists) {
    throw new HttpsError("not-found", "Feedback not found");
  }
  const feedback = feedbackSnap.data();
  if (feedback?.recipientId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the recipient can delete this feedback");
  }

  await db.doc(`feedbacks/${feedbackId}`).delete();

  // Also delete/update related notification if exists
  const notifSnap = await db.collection("notifications")
    .where("feedbackId", "==", feedbackId)
    .limit(1)
    .get();
  notifSnap.docs.forEach((d) => d.ref.delete());

  return { success: true };
});

/**
 * Delete feedback - only image owner can delete.
 */
exports.deleteFeedback = onCall({ cors: CORS_ORIGINS }, async (request) => {
  const { feedbackId } = request.data || {};
  if (!feedbackId) {
    throw new HttpsError("invalid-argument", "feedbackId is required");
  }
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in to delete");
  }

  const db = getFirestore();
  const feedbackSnap = await db.doc(`feedbacks/${feedbackId}`).get();
  if (!feedbackSnap.exists) {
    throw new HttpsError("not-found", "Feedback not found");
  }
  const feedback = feedbackSnap.data();
  const imageId = feedback?.imageId;
  if (!imageId) {
    throw new HttpsError("internal", "Invalid feedback");
  }

  const imageSnap = await db.doc(`images/${imageId}`).get();
  if (!imageSnap.exists) {
    throw new HttpsError("not-found", "Image not found");
  }
  const image = imageSnap.data();
  if (image?.userId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Only the post owner can delete");
  }

  await db.doc(`feedbacks/${feedbackId}`).delete();
  return { success: true };
});

/**
 * Submit feedback - supports either imageId (reaction to post) or recipientId (inbox feedback).
 * Checks IP against blocked list, then adds to Firestore.
 */
exports.submitFeedback = onCall({ cors: CORS_ORIGINS }, async (request) => {
  try {
    const { imageId, parentId, feedbackImageUrl, recipientId } = request.data || {};
    if (!feedbackImageUrl || (typeof feedbackImageUrl !== "string") || feedbackImageUrl.length > 2048) {
      throw new HttpsError("invalid-argument", "Valid feedbackImageUrl is required");
    }

    const hasImage = !!imageId;
    const hasRecipient = !!recipientId;
    if (!hasImage && !hasRecipient) {
      throw new HttpsError("invalid-argument", "Either imageId or recipientId is required");
    }
    if (hasImage && hasRecipient) {
      throw new HttpsError("invalid-argument", "Provide imageId or recipientId, not both");
    }

    const ip = getClientIp(request.rawRequest);
    const ipKey = ip.replace(/[.:]/g, "_");

    const db = getFirestore();

    const blockedSnap = await db.doc(`blockedIps/${ipKey}`).get();
    if (blockedSnap.exists) {
      throw new HttpsError("permission-denied", "You cannot submit feedback. Your access has been restricted.");
    }

    if (hasImage) {
      const imageSnap = await db.doc(`images/${imageId}`).get();
      if (!imageSnap.exists) {
        throw new HttpsError("not-found", "Image not found. The link may have expired.");
      }
    } else {
      const userSnap = await db.doc(`users/${recipientId}`).get();
      if (!userSnap.exists) {
        throw new HttpsError("not-found", "User not found.");
      }
    }

    const feedbackData = {
      feedbackImageUrl,
      createdAt: new Date().toISOString(),
      submitterId: request.auth?.uid || null,
    };
    if (hasImage) {
      feedbackData.imageId = imageId;
      feedbackData.parentId = parentId || null;
    } else {
      feedbackData.recipientId = recipientId;
    }

    await db.collection("feedbacks").add(feedbackData);
    return { success: true };
  } catch (err) {
    if (err && err.code) {
      throw err;
    }
    console.error("submitFeedback error:", err);
    throw new HttpsError("internal", "Failed to post. Please try again.");
  }
});
