"use client";

import { useState } from "react";

export default function ThemeToggle() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="win-btn"
        style={{ fontSize: "11px", padding: "2px 10px" }}
      >
        ℹ️ Info
      </button>
      {showInfo && (
        <div
          className="absolute right-0 mt-2 w-64 p-2 win-window"
          style={{ backgroundColor: "var(--window-bg)", zIndex: 50 }}
        >
          <p className="text-xs">
            Theme: Windows 2004 Retro
            <br />
            Colors: Dark Brown & Butter Yellow
          </p>
        </div>
      )}
    </div>
  );
}
