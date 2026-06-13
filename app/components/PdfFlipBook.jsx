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
  const [loadProgress, setLoadProgress] = useState(0);
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
      setLoadProgress(0);

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const total = pdf.numPages;
        const items = [];

        // 1. RENDER HALAMAN PERTAMA DULU (Instant Feedback)
        const firstPage = await pdf.getPage(1);
        const vp1 = firstPage.getViewport({ scale: 1.5 }); // Scale 1.5 cukup HD & 2x lebih laju dari 2.0
        const canvas1 = document.createElement("canvas");
        canvas1.width = vp1.width;
        canvas1.height = vp1.height;
        await firstPage.render({
          canvasContext: canvas1.getContext("2d"),
          viewport: vp1,
        }).promise;

        items.push({
          img: canvas1.toDataURL("image/jpeg", 0.85), // JPEG 85% jauh lebih ringan dari PNG default
          width: vp1.width,
          height: vp1.height,
          pageNumber: 1,
        });

        setPagesData([...items]); // Tunjuk halaman 1 serta-merta
        setLoadProgress(Math.round((1 / total) * 100));

        // 2. RENDER BAKI HALAMAN DI BACKGROUND (Non-blocking loop)
        for (let i = 2; i <= total; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;

          items.push({
            img: canvas.toDataURL("image/jpeg", 0.85),
            width: viewport.width,
            height: viewport.height,
            pageNumber: i,
          });

          // Update progress setiap 2 halaman supaya UI tak freeze & user nampak progress
          if (i % 2 === 0 || i === total) {
            setPagesData([...items]);
            setLoadProgress(Math.round((i / total) * 100));

            // Beri "nafas" pada browser main thread supaya UI boleh respond
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }

        setPagesData(items);
      } catch (err) {
        console.error("PDF Load Error:", err);
        setError("Gagal memuatkan fail PDF. Sila semak sambungan atau fail.");
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
    }, 850);
  }, [currentPage]);

  const goNext = useCallback(() => {
    if (isFlippingRef.current || !flipBookRef.current) return;
    if (currentPage >= totalPages - 1) {
      setShowLastPageMsg(true);
      setTimeout(() => setShowLastPageMsg(false), 2000);
      return;
    }
    isFlippingRef.current = true;
    flipBookRef.current.pageFlip().flipNext();
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 850);
  }, [currentPage, totalPages]);

  const onPageChange = (e) => {
    setCurrentPage(e.data);
    if (!isMuted) {
      const audio = new Audio("/page-flip.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 850);
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
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
          flipBookRef.current.pageFlip().update();
        }
      }, 200);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // --- LOADING SCREEN DENGAN PROGRESS BAR (Gaya Windows 2000) ---
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 space-y-4 win-window"
        style={{ minWidth: "300px", margin: "auto" }}
      >
        <div className="w-full bg-[var(--bg-primary)] win-sunken p-1">
          <div
            className="h-4 transition-all duration-300"
            style={{
              width: `${loadProgress}%`,
              backgroundColor: "var(--border-light)",
            }}
          ></div>
        </div>
        <p className="text-xs font-bold text-[var(--text-primary)] tracking-wide animate-pulse">
          Loading Programme Book... {loadProgress}%
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 win-window">
        <p className="text-red-400 font-bold text-sm mb-4">⚠️ {error}</p>
        <button className="win-btn" onClick={() => window.location.reload()}>
          Cuba Semula
        </button>
      </div>
    );
  }

  const baseWidth = pagesData[0]?.width || 500;
  const baseHeight = pagesData[0]?.height || 700;
  const ratio = baseWidth / baseHeight;

  let viewportHeight = isFullscreen ? window.innerHeight * 0.85 : 560;
  if (isMobile) viewportHeight = isFullscreen ? window.innerHeight * 0.75 : 440;

  const bookWidth = viewportHeight * ratio;
  const bookHeight = viewportHeight;
  const stableKey = `flip-${isMobile}-${isFullscreen}`;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full transition-all duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div
        className="w-full flex justify-center items-center p-1"
        style={{ flex: 1, minHeight: 0, position: "relative" }}
      >
        <div className="win-sunken p-1 bg-[var(--flipbook-bg)] w-full max-w-5xl flex justify-center items-center overflow-hidden">
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
              showCover={true}
              startZIndex={10}
              autoSize={false}
              maxShadowOpacity={0.4}
              mobileScrollSupport={true}
              clickEventForward={true}
              swipeDistance={30}
              showPageCorners={true}
              onFlip={onPageChange}
              className="shadow-2xl"
              style={{ background: "transparent" }}
            >
              {pagesData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: "white" }}
                >
                  <img
                    src={item.img}
                    alt={`Page ${item.pageNumber}`}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-gray-500 bg-white/80 px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
                    {item.pageNumber}
                  </span>
                </div>
              ))}
            </HTMLFlipBook>
          )}
        </div>

        {showLastPageMsg && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 text-center win-window"
            style={{ minWidth: "220px" }}
          >
            <p
              className="font-bold text-sm mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              📖 This is the last page
            </p>
            <button
              className="win-btn mx-auto text-xs"
              onClick={() => setShowLastPageMsg(false)}
            >
              OK
            </button>
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2 p-2 mt-2 w-full max-w-4xl win-window"
        style={{ borderTop: "none" }}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="win-btn"
          title={isMuted ? "Enable Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div className="w-px h-6 bg-[var(--border-dark)] mx-1 opacity-50"></div>

        <button
          onClick={goPrev}
          className="win-btn"
          disabled={currentPage === 0}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <div
          className="win-sunken px-3 py-1.5 flex items-center justify-center min-w-[100px]"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <span
            className="text-xs font-mono font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {currentPage + 1} / {totalPages}
          </span>
        </div>

        <button
          onClick={goNext}
          className="win-btn"
          disabled={currentPage >= totalPages - 1}
        >
          Next <ChevronRight size={16} />
        </button>

        <div className="w-px h-6 bg-[var(--border-dark)] mx-1 opacity-50"></div>

        <button
          onClick={toggleFullscreen}
          className="win-btn"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}
