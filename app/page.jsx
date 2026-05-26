"use client";

import dynamic from "next/dynamic";
import WindowsTaskbar from "./components/WindowsTaskbar";

// Ikon Instagram SVG
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// Ikon TikTok SVG
const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const PdfFlipBook = dynamic(() => import("./components/PdfFlipBook"), {
  ssr: false,
});

export default function Home() {
  const pdfUrl = "/omb2ubook.pdf";
  const fileName = "OMback2unites Programme Book";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Navbar dengan tiga logo */}
      <div className="sticky top-0 z-10 navbar-solid">
        <div className="container mx-auto px-4 py-1 flex justify-center items-center">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <img
              src="/uitm.png"
              alt="UiTM Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <img
              src="/event1.png"
              alt="Event Logo 1"
              className="h-12 md:h-14 w-auto object-contain"
            />
            <img
              src="/event2.png"
              alt="Event Logo 2"
              className="h-12 md:h-14 w-auto object-contain -ml-2 md:-ml-3"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="win-window flex flex-col h-full">
          <div className="win-titlebar">
            <span>📄 Programme Book Viewer</span>
            <div className="win-titlebar-buttons">
              <div className="win-titlebar-btn">—</div>
              <div className="win-titlebar-btn">□</div>
              <div className="win-titlebar-btn">✕</div>
            </div>
          </div>
          <div
            className="flex-1 p-4"
            style={{ backgroundColor: "var(--window-bg)" }}
          >
            <PdfFlipBook pdfUrl={pdfUrl} fileName={fileName} />
          </div>
        </div>
      </div>

      {/* Windows Taskbar - diletakkan sebelum footer */}
      <WindowsTaskbar />

      {/* Footer dengan pautan sosial media - gaya Windows retro */}
      <footer
        className="py-3 text-center"
        style={{
          backgroundColor: "var(--taskbar-bg)",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div className="flex justify-center items-center gap-6">
          <a
            href="https://www.instagram.com/de.cdcrew?igsh=MTkyZmR3Y3BqenFwcg=="
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              fontSize: "12px",
            }}
            title="Follow on Instagram"
          >
            <InstagramIcon /> Instagram
          </a>
          <a
            href="https://www.tiktok.com/@de.cdcrew?_r=1&_t=ZS-96ZhXk3VXoz"
            target="_blank"
            rel="noopener noreferrer"
            className="win-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              fontSize: "12px",
            }}
            title="Follow on TikTok"
          >
            <TikTokIcon /> TikTok
          </a>
        </div>
        <div
          className="text-xs mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          © 2026 AtlasFlux — OMback2unites.
        </div>
      </footer>
    </div>
  );
}
