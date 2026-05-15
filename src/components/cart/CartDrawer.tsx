"use client";

import React from "react";
import { useCart } from "./CartProvider";
import { GlassesPlaceholder } from "@/components/ui/GlassesPlaceholder";
import { formatRupiah } from "@/lib/format";
import Link from "next/link";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, isHydrated } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);

  if (!isHydrated) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--overlay-md)",
          zIndex: 1100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: "100%",
          background: "var(--surface)",
          zIndex: 1200,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400 }}>
            Your Bag
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-dim)" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◯</div>
              <div style={{ fontSize: 13, letterSpacing: "0.08em" }}>Your bag is empty</div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.lineId}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 28,
                  paddingBottom: 28,
                  borderBottom: "1px solid var(--border)",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ background: "var(--bg2)", padding: "16px 12px", flexShrink: 0 }}>
                  <GlassesPlaceholder
                    color={
                      item.frameColor === "black"
                        ? "#1a1a1a"
                        : item.frameColor === "gold"
                        ? "#c9a96e"
                        : item.frameColor === "tortoise"
                        ? "#4a3728"
                        : item.frameColor === "silver"
                        ? "#e8ddd0"
                        : "#3a3a3a"
                    }
                    shape={item.frame}
                    width={100}
                    height={50}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 2 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                    {item.category}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                        style={{
                          background: "none",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: 13 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                        style={{
                          background: "none",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ color: "var(--gold)", fontWeight: 400 }}>
                      {formatRupiah(item.retailPrice * item.quantity)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.lineId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-dim)",
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Total
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)" }}>
                {formatRupiah(subtotal)}
              </span>
            </div>
            <Link href="/checkout" onClick={onClose} style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: "100%",
                  background: "var(--gold)",
                  color: "var(--bg)",
                  border: "none",
                  cursor: "pointer",
                  padding: "16px",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                }}
              >
                Checkout
              </button>
            </Link>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "var(--text-dim)" }}>
              Free shipping on all orders
            </div>
          </div>
        )}
      </div>
    </>
  );
}
