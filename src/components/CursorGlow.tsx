"use client";

import { useEffect, useState, useRef } from "react";

const LERP = 0.085;
const OUTER_SIZE = 520;
const INNER_SIZE = 200;

export function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef({ x: -9999, y: -9999 });
  const currentRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      setPosition({ x: current.x, y: current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", handleMove);
    document.body.addEventListener("mouseleave", handleLeave);
    document.body.addEventListener("mouseenter", handleEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      document.body.removeEventListener("mouseleave", handleLeave);
      document.body.removeEventListener("mouseenter", handleEnter);
    };
  }, [mounted, isVisible]);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform transition-opacity duration-300"
      style={{ left: position.x, top: position.y, opacity: isVisible ? 1 : 0 }}
      aria-hidden
    >
      {/* Outer soft bloom */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: "50%",
          top: "50%",
          width: OUTER_SIZE,
          height: OUTER_SIZE,
          background: `
            radial-gradient(
              circle at center,
              rgba(255, 61, 127, 0.12) 0%,
              rgba(124, 58, 255, 0.07) 28%,
              rgba(0, 200, 255, 0.03) 50%,
              transparent 70%
            )
          `,
          filter: "blur(32px)",
        }}
      />
      {/* Inner brighter core */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: "50%",
          top: "50%",
          width: INNER_SIZE,
          height: INNER_SIZE,
          background: `
            radial-gradient(
              circle at center,
              rgba(255, 61, 127, 0.18) 0%,
              rgba(124, 58, 255, 0.06) 50%,
              transparent 70%
            )
          `,
          filter: "blur(16px)",
        }}
      />
    </div>
  );
}
