"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import HTMLFlipBook from "@marvellousptc/react-pageflip";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";

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
            Loading pages, please wait...
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

export default function PdfFlipBook({
  pdfUrl,
  fileName,
  targetPage,
  onPageFlipped,
}) {
  const [totalPages, setTotalPages] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dims, setDims] = useState({ w: 480, h: 640 });
  const [showEndMsg, setShowEndMsg] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const isFlipping = useRef(false);
  const resizeTimer = useRef(null);
  const hasFlipped = useRef(false);

  // ── Detect pages ──
  useEffect(() => {
    let cancelled = false;
    const checkPages = async () => {
      let count = 0;
      let loaded = 0;
      try {
        for (let i = 1; i <= 30; i++) {
          if (cancelled) return;
          const pageNum = String(i).padStart(4, "0");
          const src = `/pages/programbookreal_page-${pageNum}.jpg`;
          const res = await fetch(src, { method: "HEAD" });
          if (!res.ok) break;
          const img = new Image();
          img.src = src;
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject();
          });
          count = i;
          loaded++;
          setLoadedCount(loaded);
          if (i === 1) {
            setImageDimensions({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          }
        }
        if (!cancelled) setTotalPages(count);
      } catch (err) {
        if (!cancelled) setError("Gagal mengesan halaman.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    checkPages();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Responsive dimensions ──
  const recalcDims = useCallback(() => {
    let ratio = 0.71;
    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      ratio = imageDimensions.width / imageDimensions.height;
    }
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
  }, [imageDimensions]);

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

  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setTimeout(recalcDims, 120);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [recalcDims]);

  // ── Navigation ──
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
    const lastIdx = isMobile ? totalPages - 1 : totalPages - 2;
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
  }, [currentPage, totalPages, isMobile, FLIP_MS]);

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

  // ── FLIP TO TARGET PAGE (FINAL FIX) ──
  useEffect(() => {
    if (!targetPage || targetPage < 1 || totalPages === 0 || isLoading) {
      return;
    }

    const pageIndex = targetPage - 1;
    if (pageIndex >= totalPages) return;

    // Reset flag untuk target baru
    hasFlipped.current = false;

    const tryFlip = () => {
      const flip = flipBookRef.current?.pageFlip();
      if (flip && typeof flip.flip === "function") {
        try {
          // Method BETUL: flip(pageIndex)
          flip.flip(pageIndex);
          hasFlipped.current = true;
          if (onPageFlipped) onPageFlipped();
          console.log("✅ Flip to page", targetPage, "success!");
        } catch (e) {
          console.log("❌ Flip error:", e);
          setTimeout(tryFlip, 200);
        }
      } else {
        setTimeout(tryFlip, 100);
      }
    };

    // Tunggu 300ms untuk pastikan flipbook siap
    const timer = setTimeout(tryFlip, 300);
    return () => clearTimeout(timer);
  }, [targetPage, totalPages, isLoading, onPageFlipped]);

  const stableKey = useMemo(
    () => `flip-${isMobile}-${isFullscreen}`,
    [isMobile, isFullscreen],
  );

  const pagesArray = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => {
      const pageNum = String(i + 1).padStart(4, "0");
      return `/pages/programbookreal_page-${pageNum}.jpg`;
    });
  }, [totalPages]);

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
      {isLoading && (
        <LoadingDialog progress={loadedCount} total={totalPages || 0} />
      )}

      {!isLoading && totalPages > 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
            overflow: "hidden",
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
            drawShadow={!isMobile}
            flippingTime={FLIP_MS}
            usePortrait={isMobile}
            singlePage={isMobile}
            showCover={true}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={isMobile ? 0 : 0.4}
            mobileScrollSupport={false}
            clickEventForward={true}
            swipeDistance={isMobile ? 40 : 20}
            showPageCorners={!isMobile}
            useMouseEvents={true}
            onFlip={onFlip}
            style={{ margin: "auto" }}
          >
            {pagesArray.map((src, idx) => (
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
                  src={src}
                  alt={`Halaman ${idx + 1}`}
                  loading={idx < 3 ? "eager" : "lazy"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "block",
                  }}
                  draggable={false}
                  onLoad={() => {
                    setLoadedCount((prev) => Math.min(prev + 1, totalPages));
                  }}
                />
                {pageLabel(idx)}
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      )}

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
              This is the last page.
            </div>
          </div>
        </div>
      )}

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

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <TBtn onClick={goPrev} disabled={currentPage === 0}>
              <ChevronLeft size={13} /> Prev
            </TBtn>
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
              {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : "…"}
            </div>
            <TBtn onClick={goNext}>
              Next <ChevronRight size={13} />
            </TBtn>
          </div>

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
