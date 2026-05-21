"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="retro"
      enableSystem={false}
      themes={["retro"]} // Hanya retro
    >
      {children}
    </ThemeProvider>
  );
}
