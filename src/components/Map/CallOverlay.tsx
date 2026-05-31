"use client";

import React from "react";
import { useMapContext } from "./MapProvider";

export function CallOverlay() {
  const {
    incomingStreams,
    isSpeakerMuted,
  } = useMapContext();

  return (
    <div
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {Object.entries(incomingStreams).map(([userId, stream]) => (
        <audio
          key={userId}
          autoPlay
          playsInline
          muted={isSpeakerMuted}
          ref={(audio) => {
            if (audio) {
              if (audio.srcObject !== stream) {
                audio.srcObject = stream;
              }
              // Explicitly invoke play() to bypass aggressive mobile browser autoplay restrictions
              audio.play().catch((err) => {
                console.warn("[Norby CallOverlay] Autoplay blocked or failed:", err);
              });
            }
          }}
        />
      ))}
    </div>
  );
}
