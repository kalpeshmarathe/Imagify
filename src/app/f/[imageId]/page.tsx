"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  enableNetwork,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeedbackOnImagePage() {
  const params = useParams();
  const imageId = params.imageId as string;
  const [image, setImage] = useState<{ imageUrl: string; coolId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!db || !imageId) {
      setLoading(false);
      return;
    }
    const database = db;
    const load = async () => {
      try {
        await enableNetwork(database);
        const snap = await getDoc(doc(database, "images", imageId));
        if (snap.exists()) {
          setImage(snap.data() as { imageUrl: string; coolId: string });
        } else {
          setImage(null);
        }
      } catch {
        setImage(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [imageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !text.trim() || !imageId) return;
    setSubmitting(true);
    try {
      const database = db;
      if (!database) return;
      await enableNetwork(database);
      await addDoc(collection(database, "feedbacks"), {
        imageId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
            }}
          >
            Imagify
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {!image ? (
          <div className="text-center py-16">
            <p className="text-gray-400">Image not found or link invalid.</p>
            <Link href="/" className="mt-4 inline-block text-cyan-400 hover:underline">
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Leave feedback</h1>
            <p className="text-gray-400 mb-6">Anonymous feedback for @{image.coolId}</p>

            <div className="rounded-xl overflow-hidden mb-8 bg-black/50">
              <img
                src={image.imageUrl}
                alt=""
                className="w-full h-auto max-h-80 object-contain"
              />
            </div>

            {submitted ? (
              <div className="rounded-xl bg-green-500/20 border border-green-500/50 p-6 text-center">
                <p className="text-green-400 font-medium">Thanks for the feedback!</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-cyan-400 hover:underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What do you think?"
                  className="w-full rounded-xl bg-[#16182B] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  rows={3}
                  required
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !text.trim()}
                  className="mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
                  style={{
                    background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
                  }}
                >
                  {submitting ? "Sending..." : "Send feedback"}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
