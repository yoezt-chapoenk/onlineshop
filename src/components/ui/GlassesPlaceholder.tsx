import React from "react";

export function GlassesPlaceholder({ 
  color = "#1a1a1a", 
  shape = "oval", 
  width = 240, 
  height = 120 
}: { 
  color?: string; 
  shape?: "oval" | "round" | "aviator" | "rectangle" | "cateye" | "browline" | string; 
  width?: number; 
  height?: number; 
}) {
  const lensW = shape === "aviator" ? 56 : shape === "shield" ? 80 : shape === "butterfly" ? 62 : shape === "cateye" ? 58 : 50;
  const lensH = shape === "round" ? 50 : shape === "shield" ? 38 : shape === "aviator" ? 44 : shape === "cateye" ? 38 : 34;
  const rx = shape === "round" ? 50 : shape === "oval" || shape === "aviator" ? 22 : shape === "butterfly" || shape === "cateye" ? 18 : 4;
  const cx = width / 2;
  const cy = height / 2;
  const gap = 12;
  const l1x = cx - gap / 2 - lensW;
  const l2x = cx + gap / 2;
  const ly = cy - lensH / 2;
  const strokeW = 2.5;
  const cat = shape === "cateye" || shape === "cat-eye";
  const bfly = shape === "butterfly";
  const shield = shape === "shield";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`lg-${shape}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* temples */}
      <line x1={8} y1={cy} x2={l1x} y2={cy} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <line x1={l2x + lensW} y1={cy} x2={width - 8} y2={cy} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* bridge */}
      <line x1={l1x + lensW} y1={cy} x2={l2x} y2={cy} stroke={color} strokeWidth={strokeW} />
      {/* lenses */}
      {[l1x, l2x].map((x, i) =>
        cat ? (
          <path key={i}
            d={`M${x},${ly + lensH * 0.6} Q${x},${ly} ${x + lensW * 0.3},${ly} L${x + lensW * 0.85},${ly} Q${x + lensW},${ly} ${x + lensW},${ly + lensH * 0.5} L${x + lensW},${ly + lensH} Q${x + lensW},${ly + lensH} ${x + lensW * 0.5},${ly + lensH} Q${x},${ly + lensH} ${x},${ly + lensH * 0.6}Z`}
            fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} />
        ) : bfly ? (
          <path key={i}
            d={`M${x + lensW * 0.5},${ly + lensH * 0.5} Q${x},${ly} ${x},${ly + lensH * 0.5} Q${x},${ly + lensH} ${x + lensW * 0.5},${ly + lensH} Q${x + lensW},${ly + lensH * 0.8} ${x + lensW},${ly + lensH * 0.5} Q${x + lensW},${ly} ${x + lensW * 0.5},${ly + lensH * 0.5}Z`}
            fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} />
        ) : (
          <rect key={i} x={x} y={ly} width={lensW} height={lensH} rx={rx} ry={rx}
            fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} />
        )
      )}
    </svg>
  );
}
