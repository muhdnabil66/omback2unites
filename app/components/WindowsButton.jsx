"use client";

export default function WindowsButton({ onClick, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="win-btn"
      title={title}
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      {children}
    </button>
  );
}
