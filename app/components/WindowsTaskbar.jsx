"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import StartMenu from "./StartMenu";

/* ── Live clock ── */
function SysClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontFamily: "var(--font-win)",
        fontSize: "11px",
        minWidth: "60px",
        textAlign: "center",
      }}
    >
      {time}
    </span>
  );
}

export default function WindowsTaskbar() {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsMusicPlaying((p) => !p);
  }, [isMusicPlaying]);

  const handleMenuSelect = useCallback((id) => {
    const msgs = {
      members: "Members list — coming soon.",
      tentatives: "Program schedule — coming soon.",
      layout: "Layout view — coming soon.",
      about: "De'CDcrew | OMback2unite 2026\nPowered by AtlasFlux.",
      shutdown: "Thank you for attending! 🎉",
    };
    alert(msgs[id] ?? `${id} — coming soon.`);
  }, []);

  return (
    <div className="win-taskbar" style={{ position: "relative" }}>
      {/* ── Start button ── */}
      <button
        className="win-start-btn"
        onClick={() => setIsStartOpen((o) => !o)}
        style={{ fontWeight: "bold" }}
      >
        {/* Mini Windows-flag style icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <rect x="0" y="0" width="6" height="6" fill="#c0392b" />
          <rect x="8" y="0" width="6" height="6" fill="#27ae60" />
          <rect x="0" y="8" width="6" height="6" fill="#2980b9" />
          <rect x="8" y="8" width="6" height="6" fill="#f39c12" />
        </svg>
        <span style={{ fontStyle: "italic" }}>Start</span>
      </button>

      {/* Separator after Start */}
      <div className="win-sep-v" />

      {/* ── Quick Launch strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1px",
          marginRight: "4px",
        }}
      >
        <QuickBtn title="Show Desktop" emoji="🖥️" onClick={() => {}} />
        <QuickBtn title="Program Book" emoji="📄" onClick={() => {}} />
      </div>

      <div className="win-sep-v" />

      {/* ── Active window button ── */}
      <div className="win-taskbar-window">
        <span style={{ fontSize: "13px" }}>📄</span>
        <span>OMback2unite — Program Book</span>
      </div>

      {/* ── System Tray ── */}
      <div className="win-systray">
        {/* Music toggle */}
        <button
          onClick={toggleMusic}
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
            fontFamily: "var(--font-win)",
            fontSize: "14px",
            padding: "0 2px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isMusicPlaying ? "🔊" : "🔇"}
        </button>

        <div
          style={{
            width: "1px",
            height: "14px",
            backgroundColor: "var(--border-dark)",
            flexShrink: 0,
          }}
        />

        <SysClock />
      </div>

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onSelect={handleMenuSelect}
      />
    </div>
  );
}

/* Small quick-launch icon button */
function QuickBtn({ title, emoji, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none",
        border: "1px solid transparent",
        cursor: "pointer",
        padding: "2px 4px",
        fontSize: "14px",
        lineHeight: 1,
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        color: "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-light)";
        e.currentTarget.style.backgroundColor = "var(--button-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {emoji}
    </button>
  );
}
