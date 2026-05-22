"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HTMLFlipBook from "@marvellousptc/react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export default function PdfFlipBook({ pdfUrl, fileName }) {
  const [pagesData, setPagesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLastPageMsg, setShowLastPageMsg] = useState(false);

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const isFlippingRef = useRef(false);
  const totalPages = pagesData.length;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!pdfUrl) return;
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const items = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          items.push({
            img: canvas.toDataURL(),
            width: viewport.width,
            height: viewport.height,
            pageNumber: i,
          });
        }
        setPagesData(items);
      } catch (err) {
        setError("Failed to load PDF.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [pdfUrl]);

  const goPrev = useCallback(() => {
    if (isFlippingRef.current || !flipBookRef.current) return;
    if (currentPage === 0) return;
    isFlippingRef.current = true;
    flipBookRef.current.pageFlip().flipPrev();
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 900);
  }, [currentPage]);

  const goNext = useCallback(() => {
    if (isFlippingRef.current || !flipBookRef.current) return;
    if (currentPage === totalPages - 1) {
      setShowLastPageMsg(true);
      setTimeout(() => setShowLastPageMsg(false), 2000);
      return;
    }
    isFlippingRef.current = true;
    flipBookRef.current.pageFlip().flipNext();
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 900);
  }, [currentPage, totalPages]);

  const onPageChange = (e) => {
    setCurrentPage(e.data);
    if (!isMuted) {
      const audio = new Audio("/page-flip.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 900);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {}
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isLoading)
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-primary)" }}>
        Loading Programme Book...
      </div>
    );
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  const baseWidth = pagesData[0]?.width || 500;
  const baseHeight = pagesData[0]?.height || 700;
  const ratio = baseWidth / baseHeight;
  let viewportHeight = isFullscreen ? window.innerHeight * 0.85 : 560;
  if (isMobile) viewportHeight = isFullscreen ? window.innerHeight * 0.75 : 440;
  const bookWidth = viewportHeight * ratio;
  const bookHeight = viewportHeight;
  const stableKey = `flip-${isMobile}-${isFullscreen}`;

  // Warna latar untuk halaman: putih tulen supaya belakang kelihatan kosong
  const pageBgColor = "white";

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div
        className="w-full flex justify-center"
        style={{ flex: 1, minHeight: 0, position: "relative" }}
      >
        {pagesData.length > 0 && (
          <HTMLFlipBook
            key={stableKey}
            ref={flipBookRef}
            width={bookWidth}
            height={bookHeight}
            size="fixed"
            drawShadow={true}
            flippingTime={850}
            usePortrait={isMobile}
            singlePage={isMobile}
            showCover={false}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.35}
            mobileScrollSupport={true}
            clickEventForward={true}
            swipeDistance={25}
            showPageCorners={true}
            onFlip={onPageChange}
            className="mx-auto"
          >
            {pagesData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center relative"
                style={{ backgroundColor: pageBgColor }}
              >
                <img
                  src={item.img}
                  alt={`Page ${item.pageNumber}`}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-1 left-1 text-[9px] text-gray-600 bg-white/70 px-1">
                  {item.pageNumber}
                </span>
              </div>
            ))}
          </HTMLFlipBook>
        )}

        {showLastPageMsg && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 text-center"
            style={{
              backgroundColor: "var(--window-bg)",
              border: "2px solid var(--border-light)",
              borderTopColor: "var(--border-light)",
              borderLeftColor: "var(--border-light)",
              borderRightColor: "var(--border-dark)",
              borderBottomColor: "var(--border-dark)",
              boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
              minWidth: "200px",
            }}
          >
            <p
              style={{
                color: "var(--text-primary)",
                margin: 0,
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              📖 This is the last page
            </p>
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2 p-2 mt-2"
        style={{
          backgroundColor: "var(--button-face)",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="win-btn"
          title={isMuted ? "Enable Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button onClick={goPrev} className="win-btn">
          <ChevronLeft size={16} /> Prev
        </button>
        <span
          className="text-sm font-mono px-2 py-1 rounded"
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          {currentPage + 1} / {totalPages}
        </span>
        <button onClick={goNext} className="win-btn">
          Next <ChevronRight size={16} />
        </button>
        <button onClick={toggleFullscreen} className="win-btn">
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}
