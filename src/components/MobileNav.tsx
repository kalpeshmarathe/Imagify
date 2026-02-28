"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { X, ChevronRight, Menu } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinks = [
    { href: "#how", label: "How it works" },
    { href: "#play", label: "Play" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <div className="lg:hidden flex items-center justify-end w-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          open 
            ? "opacity-100 visible" 
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        
        <div 
          className={`absolute right-0 top-0 h-full w-[300px] bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-xl font-black tracking-tight text-white">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <nav className="p-4 bg-[#1a1a1a]">
            <div className="space-y-2 ">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl text-white hover:bg-white/10 transition-colors group"
                >
                  <span className="font-semibold">{link.label}</span>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-[var(--pink)] transition-colors" />
                </Link>
              ))}
            </div>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-6 block w-full text-center rounded-full px-6 py-4 font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
              }}
            >
              Give feedback
            </Link>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
