"use client";

import { useMapContext } from "../MapProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getAvatarUrl } from "@/hooks/useAuth";

export function ActiveCallHUD() {
  const {
    incomingCall,
    acceptCall,
    rejectCall,
    activeCallUserId,
    hangUp,
    activeUsers,
    isLocalMicMuted,
    toggleLocalMic,
  } = useMapContext();

  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-expand when a call becomes active or ringing
  useEffect(() => {
    if (incomingCall || activeCallUserId) {
      setIsExpanded(true);
    }
  }, [incomingCall, activeCallUserId]);

  useEffect(() => {
    let interval: any;
    if (activeCallUserId) {
      setDuration(0);
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCallUserId]);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeUser = activeUsers.find((u) => u.user_id === activeCallUserId);
  const displayName = activeUser?.username ? `@${activeUser.username}` : "User";

  const isRinging = !!incomingCall;
  const isActive = !!activeCallUserId;

  if (!isRinging && !isActive) return null;

  return (
    <div className="fixed top-[168px] right-4 z-[990] flex items-center justify-end gap-2 pointer-events-none">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full p-1.5 pl-3.5 pr-2.5 flex items-center gap-3 text-zinc-900"
          >
            {isRinging && incomingCall && (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={incomingCall.caller_avatar || getAvatarUrl(incomingCall.caller_username)}
                    alt="Caller"
                    className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black truncate max-w-[80px] leading-tight text-zinc-900">
                      @{incomingCall.caller_username}
                    </span>
                    <span className="text-[7px] font-bold text-zinc-400 leading-tight">
                      Calling...
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={rejectCall}
                    className="w-6 h-6 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Decline"
                  >
                    <PhoneOff size={10} />
                  </button>
                  <button
                    onClick={acceptCall}
                    className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    title="Accept"
                  >
                    <Phone size={10} />
                  </button>
                </div>
              </>
            )}

            {isActive && (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={toggleLocalMic}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isLocalMicMuted
                        ? "bg-rose-50 text-rose-500 border border-rose-200"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    }`}
                    title={isLocalMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isLocalMicMuted ? <MicOff size={10} /> : <Mic size={10} />}
                  </button>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black truncate max-w-[80px] leading-tight text-zinc-900">
                      {displayName}
                    </span>
                    <span className="text-[7px] font-bold text-zinc-500 leading-tight">
                      {isLocalMicMuted ? "Muted" : "Active"} · {formatDuration(duration)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={hangUp}
                  className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-[0_0_8px_rgba(220,38,38,0.3)] shrink-0"
                  title="Hang Up"
                >
                  <PhoneOff size={10} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full shadow-sm border transition-colors cursor-pointer ${
          isRinging
            ? "bg-white/95 border-zinc-200 text-emerald-500 hover:text-emerald-600"
            : isActive
            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]"
            : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900"
        }`}
        title={isExpanded ? "Collapse Controls" : "Expand Controls"}
      >
        {isRinging ? (
          <Phone size={18} className="animate-bounce" />
        ) : (
          <Phone size={18} className={isExpanded ? "" : "animate-pulse"} />
        )}
      </button>
    </div>
  );
}
