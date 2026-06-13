"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import HTMLFlipBook from "@marvellousptc/react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/* ── Win2000 Loading Dialog ── */
function LoadingDialog({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--inset-bg)",
        zIndex: 20,
      }}
    >
      <div className="win-window" style={{ width: 280, padding: 0 }}>
        <div className="win-titlebar">
          <div className="win-titlebar-label">
            <span>⏳</span>
            <span>Opening Document</span>
          </div>
        </div>
        <div
          style={{
            padding: "16px 16px 12px",
            backgroundColor: "var(--window-bg)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-primary)",
              marginBottom: "10px",
            }}
          >
            Rendering pages, please wait...
          </p>
          <div className="win-progress-track" style={{ marginBottom: "6px" }}>
            <div
              className="win-progress-fill"
              style={{
                width: `${pct}%`,
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              textAlign: "right",
            }}
          >
            {progress} / {total > 0 ? total : "…"} pages
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Toolbar Button (compact Win2000) ── */
function TBtn({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="win-btn"
      style={{ padding: "3px 8px", fontSize: "11px" }}
    >
      {children}
    </button>
  );
}

export default function PdfFlipBook({ pdfUrl, fileName }) {
  const [pagesData, setPagesData] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dims, setDims] = useState({ w: 480, h: 640 });
  const [showEndMsg, setShowEndMsg] = useState(false);

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const isFlipping = useRef(false);
  const resizeTimer = useRef(null);

  /* ── Responsive dimensions ── */
  const recalcDims = useCallback(() => {
    if (!pagesData.length) return;
    const base = pagesData[0];
    const ratio = base.width / base.height;
    const mobile = window.innerWidth < 768;
    const fs = !!document.fullscreenElement;

    let h;
    if (fs) {
      h = mobile ? window.innerHeight * 0.72 : window.innerHeight * 0.82;
    } else {
      const avail = Math.min(window.innerHeight * 0.7, 620);
      h = mobile ? Math.min(avail, 460) : avail;
    }
    setDims({ w: Math.round(h * ratio), h: Math.round(h) });
    setIsMobile(mobile);
  }, [pagesData]);

  useEffect(() => {
    const onResize = () => {
      clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(recalcDims, 120);
    };
    recalcDims();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer.current);
    };
  }, [recalcDims]);

  /* ── PDF rendering ── */
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      setLoadedCount(0);
      setPagesData([]);
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setTotalPages(pdf.numPages);
        const items = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // HD render
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          items.push({
            img: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height,
            pageNumber: i,
          });
          if (!cancelled) setLoadedCount(i);
        }

        if (!cancelled) setPagesData(items);
      } catch (err) {
        if (!cancelled) setError("Gagal memuatkan dokumen. Sila muat semula.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  /* ── Fullscreen listener ── */
  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setTimeout(recalcDims, 120);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [recalcDims]);

  /* ── Navigation ── */
  // flipPrev on mobile needs rAF so the browser commits the current
  // composited frame before the reverse-direction animation begins.
  // Without it, the JS thread kicks off the left-corner flip mid-paint → jank.
  const FLIP_MS = isMobile ? 580 : 750;

  const goPrev = useCallback(() => {
    if (isFlipping.current || !flipBookRef.current) return;
    if (currentPage === 0) return;
    isFlipping.current = true;
    requestAnimationFrame(() => {
      flipBookRef.current?.pageFlip().flipPrev();
    });
    setTimeout(() => {
      isFlipping.current = false;
    }, FLIP_MS + 80);
  }, [currentPage, FLIP_MS]);

  const goNext = useCallback(() => {
    if (isFlipping.current || !flipBookRef.current) return;
    const lastIdx = isMobile ? pagesData.length - 1 : pagesData.length - 2;
    if (currentPage >= lastIdx) {
      setShowEndMsg(true);
      setTimeout(() => setShowEndMsg(false), 2000);
      return;
    }
    isFlipping.current = true;
    requestAnimationFrame(() => {
      flipBookRef.current?.pageFlip().flipNext();
    });
    setTimeout(() => {
      isFlipping.current = false;
    }, FLIP_MS + 80);
  }, [currentPage, pagesData.length, isMobile, FLIP_MS]);

  const onFlip = useCallback(
    (e) => {
      setCurrentPage(e.data);
      if (!isMuted) {
        const audio = new Audio("/page-flip.mp3");
        audio.play().catch(() => {});
      }
      isFlipping.current = false;
    },
    [isMuted],
  );

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${fileName}.pdf`;
    a.click();
  };

  /* Stable key — only remount on layout/mode switch */
  const stableKey = useMemo(
    () => `flip-${isMobile}-${isFullscreen}`,
    [isMobile, isFullscreen],
  );

  /* ── Error state ── */
  if (error)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "var(--inset-bg)",
        }}
      >
        <div className="win-window" style={{ width: 280 }}>
          <div className="win-titlebar">
            <div className="win-titlebar-label">
              <span>⚠️</span>
              <span>Error</span>
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--window-bg)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              {error}
            </p>
            <button
              className="win-btn"
              onClick={() => window.location.reload()}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );

  /* ── Page label (left/right even/odd) ── */
  const pageLabel = (idx) => (
    <span
      style={{
        position: "absolute",
        bottom: "4px",
        [idx % 2 === 0 ? "left" : "right"]: "6px",
        fontSize: "9px",
        fontFamily: "var(--font-win)",
        color: "#888",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {idx + 1}
    </span>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: isFullscreen ? "var(--desktop-bg)" : "var(--inset-bg)",
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
        padding: isFullscreen ? "8px 0 4px" : 0,
      }}
    >
      {/* Loading dialog */}
      {isLoading && <LoadingDialog progress={loadedCount} total={totalPages} />}

      {/* ── Flipbook stage ── */}
      {!isLoading && pagesData.length > 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
            overflow: "hidden",
            /* Give the browser a 3D compositing context so both flipNext AND
             flipPrev share the same GPU layer — fixes reverse-direction jank */
            perspective: "2000px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <HTMLFlipBook
            key={stableKey}
            ref={flipBookRef}
            width={dims.w}
            height={dims.h}
            size="fixed"
            drawShadow={
              !isMobile
            } /* shadow off on mobile — JS canvas shadow is #1 cause of flipPrev jank */
            flippingTime={FLIP_MS} /* shorter on mobile = less jank window */
            usePortrait={isMobile}
            singlePage={isMobile}
            showCover={true} /* AnyFlip behavior: cover centred, then spreads */
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={isMobile ? 0 : 0.4}
            mobileScrollSupport={
              false
            } /* off: swipe-right (prev) was competing with browser back gesture */
            clickEventForward={true}
            swipeDistance={
              isMobile ? 40 : 20
            } /* higher threshold on mobile prevents accidental triggers */
            showPageCorners={
              !isMobile
            } /* corners off on mobile = fewer touch event conflicts */
            useMouseEvents={true}
            onFlip={onFlip}
            style={{ margin: "auto" }}
          >
            {pagesData.map((item, idx) => (
              <div
                key={idx}
                className="flip-page-inner"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d",
                }}
              >
                <img
                  src={item.img}
                  alt={`Halaman ${item.pageNumber}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "block",
                  }}
                  draggable={false}
                />
                {pageLabel(idx)}
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      )}

      {/* ── End-of-book message (Win2000 dialog style) ── */}
      {showEndMsg && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
          }}
        >
          <div className="win-window" style={{ minWidth: 200 }}>
            <div className="win-titlebar">
              <div className="win-titlebar-label">
                <span>📖</span>
                <span>Programme Book</span>
              </div>
            </div>
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "var(--window-bg)",
                textAlign: "center",
                fontSize: "11px",
                color: "var(--text-primary)",
              }}
            >
              Ini adalah halaman terakhir.
            </div>
          </div>
        </div>
      )}

      {/* ── Control bar (Win2000 toolbar style) ── */}
      {!isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "4px",
            padding: "4px 6px",
            width: "100%",
            backgroundColor: "var(--button-face)",
            borderTop: "2px solid var(--border-hi)",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {/* Left: sound + download */}
          <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
            <TBtn
              onClick={() => setIsMuted((m) => !m)}
              title={isMuted ? "Enable Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </TBtn>
            <div className="win-sep-v" />
            <TBtn onClick={downloadPdf} title="Download PDF">
              <Download size={13} />
              <span style={{ display: isMobile ? "none" : "inline" }}>
                Save
              </span>
            </TBtn>
          </div>

          {/* Centre: navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <TBtn onClick={goPrev} disabled={currentPage === 0}>
              <ChevronLeft size={13} /> Prev
            </TBtn>

            {/* Page counter — sunken style */}
            <div
              className="win-sunken"
              style={{
                padding: "2px 10px",
                fontSize: "11px",
                fontFamily: "var(--font-win)",
                color: "var(--text-primary)",
                minWidth: "64px",
                textAlign: "center",
                backgroundColor: "var(--inset-bg)",
                userSelect: "none",
              }}
            >
              {currentPage + 1} / {pagesData.length}
            </div>

            <TBtn onClick={goNext}>
              Next <ChevronRight size={13} />
            </TBtn>
          </div>

          {/* Right: fullscreen */}
          <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
            <TBtn
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span style={{ display: isMobile ? "none" : "inline" }}>
                {isFullscreen ? "Restore" : "Fullscreen"}
              </span>
            </TBtn>
          </div>
        </div>
      )}
    </div>
  );
}
