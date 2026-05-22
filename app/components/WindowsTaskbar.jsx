"use client";

import { useState, useRef, useEffect } from "react";
import StartMenu from "./StartMenu";

export default function WindowsTaskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Inisialisasi audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5; // Volume 50%
    }
  }, []);

  const handleStartClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleMenuSelect = (itemId) => {
    alert(`${itemId} clicked - Functionality to be implemented`);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="win-taskbar" style={{ position: "relative" }}>
      <div className="win-start-btn" onClick={handleStartClick}>
        <span>🪟 Start</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Butang muzik */}
        <button
          onClick={toggleMusic}
          className="win-btn"
          style={{ padding: "2px 8px", fontSize: "14px" }}
          title={isMusicPlaying ? "Mute Music" : "Play Music"}
        >
          {isMusicPlaying ? "🔊 Music On" : "🔇 Music Off"}
        </button>
        <span>OMback2unites | {getCurrentTime()}</span>
      </div>
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onSelect={handleMenuSelect}
      />
    </div>
  );
}
