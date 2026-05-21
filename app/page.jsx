"use client";

import dynamic from "next/dynamic";
import WindowsTaskbar from "./components/WindowsTaskbar";

const PdfFlipBook = dynamic(() => import("./components/PdfFlipBook"), {
  ssr: false,
});

export default function Home() {
  const pdfUrl = "/obm247.pdf";
  const fileName = "OMback2unites Programme Book";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Navbar tanpa toggle */}
      <div className="sticky top-0 z-10 navbar-solid">
        <div className="container mx-auto px-4 py-1 flex justify-center items-center">
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

      <WindowsTaskbar />
    </div>
  );
}
