"use client";

import dynamic from "next/dynamic";
import WindowsTaskbar from "./components/WindowsTaskbar";

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
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

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
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
  loading: () => (
    <div
      className="flex items-center justify-center h-full"
      style={{ color: "var(--text-secondary)", fontSize: "11px" }}
    >
      Loading viewer...
    </div>
  ),
});

export default function Home() {
  const pdfUrl = "/programbook-compressed.pdf";
  const fileName = "OMback2unite Program Book";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--desktop-bg)" }}
    >
      {/* ── Logo navbar (event branding strip) ── */}
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

      {/* ── Desktop area ── */}
      <div className="flex-1 p-2 md:p-3" style={{ minHeight: 0 }}>
        {/* Window frame */}
        <div className="win-window flex flex-col" style={{ height: "100%" }}>
          {/* Title bar */}
          <div className="win-titlebar">
            <div className="win-titlebar-label">
              <span style={{ fontSize: "13px", lineHeight: 1 }}>📄</span>
              <span>{fileName} — De'CDcrew</span>
            </div>
            <div className="win-titlebar-buttons">
              <div className="win-titlebar-btn" title="Minimize">
                <span
                  style={{
                    display: "block",
                    width: "8px",
                    height: "2px",
                    backgroundColor: "var(--button-text)",
                    marginTop: "6px",
                  }}
                />
              </div>
              <div className="win-titlebar-btn" title="Maximize">
                <span
                  style={{
                    display: "block",
                    width: "8px",
                    height: "7px",
                    border: "1.5px solid var(--button-text)",
                    borderTop: "3px solid var(--button-text)",
                  }}
                />
              </div>
              <div
                className="win-titlebar-btn close"
                title="Close"
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ✕
              </div>
            </div>
          </div>

          {/* Menu bar */}
          <div className="win-menubar">
            <span className="win-menuitem">File</span>
            <span className="win-menuitem">View</span>
            <span className="win-menuitem">Navigate</span>
            <span className="win-menuitem">Help</span>
          </div>

          {/* Inset content area */}
          <div
            className="win-inset flex-1 m-1"
            style={{ overflow: "hidden", minHeight: 0 }}
          >
            <PdfFlipBook pdfUrl={pdfUrl} fileName={fileName} />
          </div>

          {/* Status bar */}
          <div className="win-statusbar">
            <div className="win-statusbar-panel">
              <span style={{ marginRight: "3px" }}>📖</span>
              Ready
            </div>
            <div className="win-statusbar-panel" style={{ flex: 1 }}>
              {fileName}
            </div>

            {/* Social links in status bar */}
            <a
              href="https://www.instagram.com/de.cdcrew?igsh=MTkyZmR3Y3BqenFwcg=="
              target="_blank"
              rel="noopener noreferrer"
              className="win-statusbar-panel"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                cursor: "pointer",
                gap: "4px",
              }}
              title="Follow on Instagram"
            >
              <InstagramIcon /> Instagram
            </a>

            <a
              href="https://www.tiktok.com/@de.cdcrew?_r=1&_t=ZS-96ZhXk3VXoz"
              target="_blank"
              rel="noopener noreferrer"
              className="win-statusbar-panel"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                cursor: "pointer",
                gap: "4px",
              }}
              title="Follow on TikTok"
            >
              <TikTokIcon /> TikTok
            </a>

            {/* Resize grip dots */}
            <div className="win-statusbar-grip">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    background:
                      i >= 3
                        ? i >= 6
                          ? "var(--border-hi)"
                          : "var(--border-light)"
                        : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* /win-window */}
      </div>

      {/* ── Windows 2000 Taskbar ── */}
      <WindowsTaskbar />
    </div>
  );
}
