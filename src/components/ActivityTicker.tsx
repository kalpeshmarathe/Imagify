"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronRight } from "lucide-react";

interface ActivityItem {
  id: string;
  message?: string;
  feedbackImageUrl?: string;
  createdAt: string;
  isOwnerReply?: boolean;
  from?: string;
  anonymousId?: string;
}

interface ActivityTickerProps {
  items: ActivityItem[];
  coolId: string;
}

const formatTime = (iso: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ""; }
};

export function ActivityTicker({ items, coolId }: ActivityTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const openNotifications = () => {
    window.dispatchEvent(new Event("open-notifications"));
  };

  // Cycle through the last 4 unread messages every 4 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(items.length, 4));
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const currentItems = [...items].reverse().slice(0, 4);
  const totalCount = items.length;

  return (
    <div className="sticky top-20 z-[40] w-full px-4 py-1 pointer-events-none flex justify-center text-center">
      <button
        onClick={openNotifications}
        className="max-w-[320px] sm:max-w-[360px] w-full h-[50px] pointer-events-auto overflow-hidden bg-[#0d0d12]/90 backdrop-blur-3xl border border-white/10 rounded-full hover:bg-white/[0.1] hover:border-pink-500/20 hover:scale-[1.02] transition-all text-left group/ticker active:scale-[0.98] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.8)] relative"
      >
        <div className="px-4 h-full relative flex items-center gap-3">
          {/* Unread Badge / Status */}
          <div className="shrink-0 relative">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
               <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            </div>
            {totalCount > 1 && (
               <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-pink-500 text-[8px] font-black text-white shadow-lg">
                 {totalCount}
               </span>
            )}
          </div>

          <div className="flex-1 min-w-0 relative h-9 overflow-hidden">
            {currentItems.map((msg, i) => {
              const isActive = i === activeIndex;
              const isOwner = msg.isOwnerReply === true || msg.from === 'owner';
              const ownerLabel = (msg as any).coolId || (msg as any).ownerName || coolId;
              const senderDisplay = isOwner ? `@${ownerLabel}` : (msg.anonymousId?.substring(0, 6).toUpperCase() || "GUEST");

              return (
                <div 
                  key={msg.id || i} 
                  className={`absolute inset-0 flex items-center gap-3 transition-all duration-700 transform ${
                    isActive ? "translate-y-0 opacity-100" : i < activeIndex ? "-translate-y-10 opacity-0" : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 border border-white/5 ${isOwner ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-white/10'}`}>
                    {msg.feedbackImageUrl ? (
                      <img src={msg.feedbackImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-white uppercase">{senderDisplay[0]}</span>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider truncate max-w-[120px] ${isOwner ? "text-pink-400" : "text-blue-400"}`}>
                        {senderDisplay}
                      </span>
                      <span className="text-[8px] font-bold text-white/20">{formatTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-[12px] font-bold text-white/50 truncate max-w-[160px] group-hover/ticker:text-white transition-colors">
                      {msg.message || "Reaction sent"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center gap-2 pl-2 border-l border-white/5">
            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover/ticker:translate-x-1 transition-all" />
          </div>
        </div>
      </button>
    </div>
  );
}
