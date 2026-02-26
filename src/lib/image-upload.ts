import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Post images (feed): higher quality for full display on feed.
 * Still optimized vs raw phone photos (often 5–10MB+).
 */
const POST_MAX_SIZE_MB = 1.5;
const POST_MAX_DIM = 2560;
const POST_QUALITY = 0.92;

/**
 * Feedback reactions: lighter compression (smaller thumbnails).
 */
const FEEDBACK_MAX_SIZE_MB = 0.8;
const FEEDBACK_MAX_DIM = 1200;
const FEEDBACK_QUALITY = 0.88;

export async function compressImage(
  file: File,
  preset: "post" | "feedback" = "post"
): Promise<File> {
  const isPost = preset === "post";
  const options = {
    maxSizeMB: isPost ? POST_MAX_SIZE_MB : FEEDBACK_MAX_SIZE_MB,
    maxWidthOrHeight: isPost ? POST_MAX_DIM : FEEDBACK_MAX_DIM,
    useWebWorker: true,
    initialQuality: isPost ? POST_QUALITY : FEEDBACK_QUALITY,
    fileType: "image/jpeg" as const,
  };
  return imageCompression(file, options);
}

export async function uploadImage(
  file: File,
  userId: string,
  imageId: string
): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not configured");

  const compressed = await compressImage(file, "post");
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `images/${userId}/${imageId}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}

/** Upload feedback image (anonymous) - stored in feedback_images/ */
export async function uploadFeedbackImage(
  file: File,
  feedbackId: string
): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not configured");

  const compressed = await compressImage(file, "feedback");
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `feedback_images/${feedbackId}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}
