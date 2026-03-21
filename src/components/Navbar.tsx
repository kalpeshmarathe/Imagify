"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, LayoutDashboard, Inbox, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useToast } from "@/lib/toast-context";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
      window.location.replace("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="navbar-glass sticky top-0 z-50 border-b border-white/5 bg-[var(--bg-primary)]/80 backdrop-blur-md">
      <nav className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-300 shrink-0">
          <img src="/logo.svg" alt="picpop" className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <NotificationBell ownerName={profile?.coolId || ""} />

          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all max-w-[150px] sm:max-w-none"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--pink)] to-[var(--purple)] flex items-center justify-center text-[10px] text-white shrink-0">
                  {profile.coolId?.slice(0, 2).toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="truncate hidden sm:inline">@{profile.coolId}</span>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div 
                  className="absolute right-0 top-full mt-2 py-2 w-48 rounded-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <Link 
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/inbox"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Inbox className="w-4 h-4" />
                    Inbox
                  </Link>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-[var(--text-muted)] hover:text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
             <Link href="/login" className="text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white active:scale-95">Join Now</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
