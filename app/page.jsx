"use client";

import dynamic from "next/dynamic";
import ThemeToggle from "./components/ThemeToggle";
import WindowsTaskbar from "./components/WindowsTaskbar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const PdfFlipBook = dynamic(() => import("./components/PdfFlipBook"), {
  ssr: false,
});

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pdfUrl = "/obm247.pdf";
  const fileName = "OBM247 Programme Book";

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isRetro = theme === "retro";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Navbar - solid, logo tengah, toggle kanan */}
      <nav
        className="sticky top-0 z-10 w-full"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "2px solid var(--border-light)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left spacer untuk balance */}
          <div className="w-10"></div>

          {/* Logo di tengah */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <img
              src="/uitm.png"
              alt="UiTM Logo"
              className="h-10 md:h-12 w-auto object-contain"
              style={{ maxHeight: "50px" }}
            />
            <img
              src="/event.png"
              alt="Event Logo"
              className="h-20 md:h-26 w-auto object-contain"
            />
          </div>

          {/* Toggle di kanan */}
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 p-4">
        <div
          className={
            isRetro ? "win-window flex flex-col h-full" : "flex flex-col h-full"
          }
        >
          {isRetro && (
            <div className="win-titlebar">
              <span>📄 Programme Book Viewer</span>
              <div className="win-titlebar-buttons">
                <div className="win-titlebar-btn">—</div>
                <div className="win-titlebar-btn">□</div>
                <div className="win-titlebar-btn">✕</div>
              </div>
            </div>
          )}
          <div
            className="flex-1 p-4"
            style={{
              backgroundColor: isRetro
                ? "var(--window-bg)"
                : "var(--bg-primary)",
            }}
          >
            <PdfFlipBook pdfUrl={pdfUrl} fileName={fileName} />
          </div>
        </div>
      </div>

      {isRetro && <WindowsTaskbar />}
    </div>
  );
}
