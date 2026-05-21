"use client";

import { useState } from "react";
import StartMenu from "./StartMenu";

export default function WindowsTaskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleStartClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleMenuSelect = (itemId) => {
    // Handle menu selection (contoh: alert atau navigasi)
    alert(`${itemId} clicked - Functionality to be implemented`);
    // Anda boleh tambah navigasi atau modals di sini nanti
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
      <div>
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
