"use client";

import { useMapContext } from "../MapProvider";
import { Phone, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { playSound } from "@/lib/sounds";

export function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useMapContext();

  // Play a ringing sound periodically while call is incoming
  useEffect(() => {
    if (!incomingCall) return;
    
    // Play immediately
    playSound("ring");
    
    const interval = setInterval(() => {
      playSound("ring");
    }, 3000); // Ring every 3 seconds

    return () => clearInterval(interval);
  }, [incomingCall]);

  return (
    <AnimatePresence>
      {incomingCall && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          {/* Backdrop shadow click barrier */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={rejectCall}
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm overflow-hidden bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[32px] p-6 text-center shadow-2xl flex flex-col items-center gap-6 text-white"
          >
            {/* Pulsing visual container */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-emerald-500/20"
              />
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
                className="absolute inset-2 rounded-full bg-emerald-500/35"
              />
              <img
                src={incomingCall.caller_avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${incomingCall.caller_username}`}
                alt={incomingCall.caller_username}
                className="relative w-16 h-16 rounded-full border-2 border-emerald-500 bg-zinc-800 shadow-lg object-cover"
              />
            </div>

            {/* Caller Text */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-widest font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full mx-auto w-fit">
                Incoming Call
              </span>
              <h3 className="text-lg font-black mt-2 font-sans tracking-tight text-white">
                @{incomingCall.caller_username}
              </h3>
              <p className="text-xs text-zinc-400 font-medium font-sans">
                wants to start a voice call with you
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-8 w-full justify-center mt-2">
              {/* Decline Button */}
              <button
                onClick={rejectCall}
                className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:shadow-rose-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Decline call"
              >
                <PhoneOff size={22} className="rotate-90" />
              </button>

              {/* Accept Button */}
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Accept call"
              >
                <Phone size={24} className="animate-pulse" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
