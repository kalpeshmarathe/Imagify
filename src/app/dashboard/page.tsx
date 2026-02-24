"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  query,
  where,
  getDocs,
  enableNetwork,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/image-upload";

const FEEDBACK_VISIBLE_LIMIT = 5;

function ShareLink({ imageId }: { imageId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/f/${imageId}` : "";
  return (
    <div className="mt-3 flex items-center gap-2">
      <p className="text-sm text-gray-500">Share:</p>
      <input
        type="text"
        readOnly
        value={url}
        className="flex-1 rounded-lg bg-black/50 px-3 py-2 text-xs text-cyan-400 border border-white/10"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20 transition-colors whitespace-nowrap"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

interface StoredImage {
  id: string;
  userId: string;
  coolId: string;
  imageUrl: string;
  createdAt: string;
}

interface Feedback {
  id: string;
  imageId: string;
  text: string;
  feedbackImageUrl?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [images, setImages] = useState<StoredImage[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback[]>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !profile?.coolId) router.replace("/create-id");
  }, [user, profile, loading, router]);

  const fetchImages = useCallback(async () => {
    if (!db || !user) return;
    try {
      const database = db;
      await enableNetwork(database);
      const q = query(
        collection(database, "images"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoredImage));
      // Sort by createdAt desc (Firestore may need index)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setImages(list);

      const feedbackMap: Record<string, Feedback[]> = {};
      for (const img of list) {
        const fbQuery = query(
          collection(database, "feedbacks"),
          where("imageId", "==", img.id)
        );
        const fbSnap = await getDocs(fbQuery);
        const list = (fbSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Feedback[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        feedbackMap[img.id] = list;
      }
      setFeedbacks(feedbackMap);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setLoadError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [user]);

  useEffect(() => {
    if (user && profile?.coolId) fetchImages();
  }, [user, profile, fetchImages]);

  const handleUploadFixed = async (file: File) => {
    if (!db || !user || !profile?.coolId) return;
    setUploadError("");
    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file.");
        setUploading(false);
        return;
      }

      const imageId = crypto.randomUUID();
      const url = await uploadImage(file, user.uid, imageId);

      await setDoc(doc(db, "images", imageId), {
        userId: user.uid,
        coolId: profile.coolId,
        imageUrl: url,
        createdAt: new Date().toISOString(),
      });

      await fetchImages();
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUploadFixed(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFixed(file);
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect is handled by useEffects; show spinner while navigating
  if (!user) return null;
  if (!profile?.coolId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 size-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--glow-purple)" }}
        />
      </div>

      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #FF4F8B, #8A4DFF, #3DA9FF)",
            }}
          >
            Imagify
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">@{profile.coolId}</span>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Your dashboard</h1>
        <p className="text-gray-400 mb-8">
          Upload images. Share the link. Get feedback. Top 5 visible, rest blurred.
        </p>
        {loadError && (
          <div className="mb-6 rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-300">
            {loadError}
            <button
              onClick={() => { setLoadError(null); fetchImages(); }}
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive
              ? "border-pink-500 bg-pink-500/10"
              : "border-white/20 bg-white/5 hover:border-white/40"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-xl mb-4"
              style={{ background: "rgba(79, 223, 255, 0.2)" }}
            >
              {uploading ? (
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="size-8 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                  />
                </svg>
              )}
            </div>
            <p className="font-medium text-white">
              {uploading ? "Compressing & uploading..." : "Drop image or click to upload"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Compressed for storage • Full quality on display
            </p>
          </label>
          {uploadError && (
            <p className="mt-4 text-sm text-red-400">{uploadError}</p>
          )}
        </div>

        {/* Images & feedbacks */}
        <div className="mt-12 space-y-10">
          {images.length === 0 && !uploading && (
            <p className="text-center text-gray-500 py-12">
              No images yet. Upload one to get started.
            </p>
          )}
          {images.map((img) => {
            const imgFeedbacks = feedbacks[img.id] || [];
            const visible = imgFeedbacks.slice(0, FEEDBACK_VISIBLE_LIMIT);
            const blurred = imgFeedbacks.slice(FEEDBACK_VISIBLE_LIMIT);

            return (
              <div
                key={img.id}
                className="rounded-2xl border border-white/10 bg-[#16182B] p-6"
              >
                <div className="relative rounded-xl overflow-hidden bg-black/50">
                  <img
                    src={img.imageUrl}
                    alt="Upload"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
                <ShareLink imageId={img.id} />

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Feedback ({imgFeedbacks.length})
                  </h3>
                  <div className="space-y-2">
                    {visible.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-lg bg-white/5 p-3 text-sm text-gray-200"
                      >
                        {fb.text}
                        {fb.feedbackImageUrl && (
                          <img
                            src={fb.feedbackImageUrl}
                            alt=""
                            className="mt-2 rounded max-h-24 object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {blurred.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-lg bg-white/5 p-3 text-sm blur-md select-none pointer-events-none"
                      >
                        {fb.text}
                      </div>
                    ))}
                  </div>
                  {blurred.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      +{blurred.length} more (blurred)
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
