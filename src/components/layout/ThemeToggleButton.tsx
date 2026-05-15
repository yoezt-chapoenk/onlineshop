"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

interface Props {
  /** Optional inline style overrides, useful for placing in different
      contexts (storefront header vs admin sidebar). */
  className?: string;
}

/**
 * Compact light/dark toggle that reads from the global ThemeProvider.
 * Placed in the admin sidebar so admins can switch theme without leaving
 * /admin (the storefront header has a separate copy).
 */
export default function ThemeToggleButton({ className }: Props) {
  const { isLightMode, toggleLightMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleLightMode}
      className={className}
      title={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        fontSize: 12,
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
        borderRadius: 8,
        cursor: "pointer",
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      <span aria-hidden style={{ fontSize: 14 }}>{isLightMode ? "☀" : "☽"}</span>
      <span>{isLightMode ? "Light" : "Dark"}</span>
    </button>
  );
}
