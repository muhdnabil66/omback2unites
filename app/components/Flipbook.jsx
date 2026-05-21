"use client";

import { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PdfFlipBook({ pdfUrl }) {
  const [pagesData, setPagesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const pageIndexRef = useRef(0); // Membantu jejak halaman masa-nyata tanpa delay rendering

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
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
        const totalPages = pdf.numPages;
        const items = [];

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Render resolusi tinggi HD

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport })
            .promise;

          items.push({
            img: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height,
            pageNumber: i,
          });
        }

        setPagesData(items);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Gagal memuatkan paparan digital. Sila cuba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Butang Navigasi - Berfungsi penuh tanpa ralat rujukan hancur
  const goPrev = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const goNext = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const onPageChange = (e) => {
    setCurrentPage(e.data);
    pageIndexRef.current = e.data;

    if (!isMuted) {
      const audio = new Audio("/page-flip.mp3");
      audio.play().catch(() => {});
    }
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
      }, 150);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[11px] text-zinc-400 font-mono tracking-widest uppercase animate-pulse">
          Menyediakan Buku Program VIP...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 text-red-500 text-xs font-medium">
        {error}
      </div>
    );
  }

  // Pengiraan saiz responsif AnyFlip yang mengekalkan aspect ratio
  const baseWidth = pagesData[0]?.width || 450;
  const baseHeight = pagesData[0]?.height || 600;
  const ratio = baseWidth / baseHeight;

  let computedHeight = isFullscreen ? window.innerHeight * 0.76 : 560;
  if (isMobile) computedHeight = isFullscreen ? window.innerHeight * 0.65 : 420;
  const computedWidth = computedHeight * ratio;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center w-full select-none transition-all duration-300 ${
        isFullscreen
          ? "bg-zinc-950 p-6 fixed inset-0 z-50 h-screen justify-between"
          : "relative"
      }`}
    >
      {/* KAWASAN UTAMA: CSS Grid/Flex dikunci supaya kulit depan boleh bergerak ke tengah dengan smooth */}
      <div
        className={`w-full flex justify-center items-center overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "h-[82vh]"
            : "py-12 bg-zinc-50/40 dark:bg-zinc-900/10 rounded-t-2xl border border-zinc-200/50 dark:border-zinc-800/30"
        }`}
      >
        {pagesData.length > 0 && (
          <div className="anyflip-stage-wrapper flex items-center justify-center">
            <HTMLFlipBook
              ref={flipBookRef}
              width={computedWidth}
              height={computedHeight}
              size="stretch" // Membolehkan animasi saiz dinamik AnyFlip berjalan lancar
              minWidth={240}
              maxWidth={800}
              minHeight={360}
              maxHeight={1000}
              drawShadow={true}
              flippingTime={900} // Kelajuan selakan kertas realistik bermutu tinggi
              usePortrait={isMobile}
              showCover={true} // WAJIB TRUE supaya kulit hadapan/belakang automatik duduk di tengah grid
              startZIndex={0}
              autoSize={true}
              maxShadowOpacity={0.25}
              // Keupayaan penuh Interaksi Mobile (Leret, Sentuh Bucu, & Butang)
              mobileScrollSupport={true}
              clickEventForward={true}
              swipeDistance={20}
              showPageCorners={true}
              onFlip={onPageChange}
              className="anyflip-book-engine"
            >
              {pagesData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 flex items-center justify-center relative shadow-inner overflow-hidden border-zinc-100 dark:border-zinc-800/20"
                >
                  <img
                    src={item.img}
                    alt={`Halaman ${item.pageNumber}`}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                  <span
                    className={`absolute bottom-3 text-[9px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 ${
                      idx % 2 === 0 ? "left-4" : "right-4"
                    }`}
                  >
                    {item.pageNumber}
                  </span>
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {/* CONTROLLER BAR DIBAWAH ULTRA CLEAN */}
      <div
        className={`w-full flex items-center justify-between border-zinc-200/50 dark:border-zinc-800/30 transition-all duration-300 ${
          isFullscreen
            ? "bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-xl px-6 py-3 max-w-lg mb-4 text-white shadow-2xl"
            : "bg-white dark:bg-black border-x border-b rounded-b-2xl px-6 py-4 shadow-sm"
        }`}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-[11px] font-medium tracking-widest text-zinc-400 dark:text-zinc-500 font-mono px-3.5 py-1 bg-zinc-50/80 dark:bg-zinc-900/40 rounded border border-zinc-200/30 dark:border-zinc-800/20 shadow-inner">
            {currentPage + 1} / {pagesData.length}
          </span>

          <button
            onClick={goNext}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
