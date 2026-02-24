"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#how", label: "How it works" },
    { href: "#play", label: "Play" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`lg:hidden fixed inset-0 top-14 bg-black/95 backdrop-blur-xl z-30 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <nav
          className="flex flex-col items-center justify-center gap-8 pt-20"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-2xl font-medium text-white hover:text-pink-400 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full px-8 py-4 text-lg font-semibold text-white"
            style={{
              background: "linear-gradient(90deg, #FF4F8B, #8A4DFF)",
            }}
          >
            Give feedback
          </Link>
        </nav>
      </div>
    </>
  );
}
