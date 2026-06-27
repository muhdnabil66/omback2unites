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
  HelpCircle,
} from "lucide-react";

function LoadingDialog() {
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
                width: "100%",
                transition: "width 0.2s ease",
              }}
            />
          </div>
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
      style={{
        padding: "3px 8px",
        fontSize: "11px",
        minHeight: "28px",
        minWidth: "32px",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
}

export default function PdfFlipBook({ pdfUrl, fileName }) {
  const totalPages = 24;
  const [isLoading, setIsLoading] = useState(true);
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

  // ── Guide state ──
  const [showGuide, setShowGuide] = useState(false);

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const isFlipping = useRef(false);
  const resizeTimer = useRef(null);
  const audioRef = useRef(null);
  const guideTimerRef = useRef(null);

  // ── Show guide every time page loads ──
  useEffect(() => {
    // Delay supaya flipbook sempat render
    const timer = setTimeout(() => {
      setShowGuide(true);
      // Auto hide after 5 seconds
      guideTimerRef.current = setTimeout(() => {
        hideGuide();
      }, 5000);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const hideGuide = () => {
    setShowGuide(false);
    if (guideTimerRef.current) {
      clearTimeout(guideTimerRef.current);
    }
  };

  // ── Function to show guide manually (via ? button) ──
  const showGuideManually = () => {
    setShowGuide(true);
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    guideTimerRef.current = setTimeout(() => {
      hideGuide();
    }, 5000);
  };

  // ── Audio preload ──
  useEffect(() => {
    audioRef.current = new Audio("/page-flip.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.load();
  }, []);

  // ── Ambil dimensi imej pertama ──
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageDimensions({ width: 800, height: 1120 });
      setIsLoading(false);
    };
    img.src = "/pages/programbookreal_page-0001.webp";
  }, []);

  // ── Responsive ──
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

      // ── Hide guide on first flip ──
      if (showGuide) {
        hideGuide();
      }

      if (!isMuted && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
      isFlipping.current = false;
    },
    [isMuted, showGuide],
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

  const stableKey = useMemo(
    () => `flip-${isMobile}-${isFullscreen}`,
    [isMobile, isFullscreen],
  );

  const pagesArray = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => {
      const pageNum = String(i + 1).padStart(4, "0");
      return `/pages/programbookreal_page-${pageNum}.webp`;
    });
  }, [totalPages]);

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
        touchAction: "pan-y",
      }}
    >
      {isLoading && <LoadingDialog />}

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
            style={{ margin: "auto", touchAction: "none" }}
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
            {/* ── Help button ── */}
            <TBtn onClick={showGuideManually} title="Show guide again">
              <HelpCircle size={13} />
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

      {/* ── GUIDE OVERLAY ── */}
      {showGuide && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "fadeIn 0.4s ease",
            padding: "16px",
            touchAction: "none",
          }}
          onClick={hideGuide}
        >
          <div
            className="win-window"
            style={{
              maxWidth: isMobile ? "320px" : "400px",
              width: "100%",
              padding: 0,
              textAlign: "center",
              cursor: "pointer",
              animation: "slideUp 0.4s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="win-titlebar">
              <div className="win-titlebar-label">
                <span>📖</span>
                <span>How to Use</span>
              </div>
              <button
                onClick={hideGuide}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "0 4px",
                  fontFamily: "var(--font-win)",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: isMobile ? "20px 16px 24px" : "24px 24px 28px",
                backgroundColor: "var(--window-bg)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "56px" : "64px",
                  marginBottom: "12px",
                }}
              >
                {isMobile ? "👆" : "🖱️"}
              </div>
              <p
                style={{
                  fontSize: isMobile ? "15px" : "13px",
                  color: "var(--text-primary)",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {isMobile ? "Swipe left or right" : "Click or drag corners"}
              </p>
              <p
                style={{
                  fontSize: isMobile ? "12px" : "11px",
                  color: "var(--text-secondary)",
                  marginBottom: isMobile ? "20px" : "16px",
                }}
              >
                to turn pages like a real book
              </p>
              <button
                className="win-btn"
                onClick={hideGuide}
                style={{
                  fontSize: isMobile ? "13px" : "11px",
                  padding: isMobile ? "8px 32px" : "4px 20px",
                  minHeight: isMobile ? "40px" : "auto",
                  touchAction: "manipulation",
                }}
              >
                Got it!
              </button>
              <p
                style={{
                  fontSize: "9px",
                  color: "var(--text-disabled)",
                  marginTop: "12px",
                }}
              >
                Tip: Use buttons below too
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS animations ── */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
