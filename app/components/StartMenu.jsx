"use client";

import { useEffect, useRef } from "react";

export default function StartMenu({ isOpen, onClose, onSelect }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        isOpen
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { id: "members", label: "Members", icon: "👥" },
    { id: "tentatives", label: "Tentatives", icon: "📅" },
    { id: "layout", label: "Layout", icon: "📐" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];

  return (
    <div
      ref={menuRef}
      className="start-menu"
      style={{
        position: "absolute",
        bottom: "40px",
        left: "12px",
        width: "200px",
        backgroundColor: "var(--button-face)",
        border: "2px solid",
        borderTopColor: "var(--border-light)",
        borderLeftColor: "var(--border-light)",
        borderRightColor: "var(--border-dark)",
        borderBottomColor: "var(--border-dark)",
        boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
        zIndex: 1000,
        padding: "4px 0",
      }}
    >
      {menuItems.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            onSelect(item.id);
            onClose();
          }}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "var(--button-text)",
            fontWeight: "normal",
            transition: "background 0.05s linear",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--border-light)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--button-text)";
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
