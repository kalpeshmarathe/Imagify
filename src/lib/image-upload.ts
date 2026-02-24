import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const COMPRESSION_QUALITY = 0.85;
const MAX_SIZE_MB = 0.5;

/**
 * Compresses image for storage (smaller file size) while preserving quality for display.
 * Stored file is displayed at full resolution on frontend - no re-compression.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: Math.max(MAX_WIDTH, MAX_HEIGHT),
    useWebWorker: true,
    initialQuality: COMPRESSION_QUALITY,
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

  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `images/${userId}/${imageId}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}
