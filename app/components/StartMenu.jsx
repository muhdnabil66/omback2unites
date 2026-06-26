"use client";

import { useEffect, useRef } from "react";

export default function StartMenu({ isOpen, onClose, onSelect }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { id: "members", label: "Members", icon: "👥", desc: "Go to page 12" },
    { id: "tentatives", label: "Tentatives", icon: "📅", desc: "Go to page 8" },
    { id: "about", label: "About", icon: "ℹ️", desc: "Go to page 2" },
    // Layout dibuang
  ];

  return (
    <div
      ref={menuRef}
      className="start-menu win-window"
      style={{
        position: "absolute",
        bottom: "32px",
        left: 0,
        width: "280px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "row",
        padding: 0,
        userSelect: "none",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: "36px",
          flexShrink: 0,
          background:
            "linear-gradient(180deg, var(--titlebar-start) 0%, var(--desktop-bg) 100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "8px",
          borderRight: "1px solid var(--border-dark)",
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: "11px",
            fontWeight: "bold",
            fontFamily: "var(--font-win)",
            color: "var(--text-primary)",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            opacity: 0.85,
          }}
        >
          Windows XP
        </span>
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--button-face)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, padding: "4px 0" }}>
          {menuItems.map((item) => (
            <StartMenuItem
              key={item.id}
              item={item}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
            />
          ))}
        </div>

        <div className="win-sep-h" style={{ margin: "0 4px" }} />

        <div style={{ padding: "4px 0" }}>
          <StartMenuItem
            item={{
              id: "shutdown",
              label: "Shut Down...",
              icon: "🔴",
              desc: "End session",
            }}
            onClick={() => {
              onSelect("shutdown");
              onClose();
            }}
            accent
          />
        </div>
      </div>
    </div>
  );
}

function StartMenuItem({ item, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "5px 10px 5px 8px",
        cursor: "default",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "11px",
        color: accent ? "var(--text-primary)" : "var(--button-text)",
        fontFamily: "var(--font-win)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--hover-item)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = accent
          ? "var(--text-primary)"
          : "var(--button-text)";
      }}
    >
      <span
        style={{
          fontSize: "16px",
          width: "20px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontWeight: "bold", lineHeight: 1.2 }}>
          {item.label}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            lineHeight: 1.2,
          }}
        >
          {item.desc}
        </span>
      </div>
    </div>
  );
}
