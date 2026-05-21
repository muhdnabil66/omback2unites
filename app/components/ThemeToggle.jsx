"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isRetro = theme === "retro";

  return (
    <button
      onClick={() => setTheme(isRetro ? "modern" : "retro")}
      className="win-btn"
      style={{ fontSize: "11px", padding: "2px 10px" }}
    >
      {isRetro ? "✨ Modern" : "🖥️ Retro"}
    </button>
  );
}
