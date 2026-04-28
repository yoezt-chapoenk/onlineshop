import type { Product } from "@/lib/types";

interface Props {
  product: Pick<Product, "frame" | "frameColor" | "lensColor" | "category">;
  className?: string;
  size?: number;
}

// Strict navy + light-blue palette only — every former colour family
// (gold / tortoise / rose / olive) maps to a navy or light-blue tone so
// the storefront imagery stays on-brand.
const FRAME_COLORS: Record<Product["frameColor"], string> = {
  black: "#01083c",
  gold: "#1a225a",
  silver: "#aab2cf",
  tortoise: "#060c3f",
  navy: "#01083c",
  rose: "#7cabff",
  olive: "#2a3470",
};

const FRAME_HIGHLIGHT: Record<Product["frameColor"], string> = {
  black: "#1a225a",
  gold: "#2a3470",
  silver: "#d6dae9",
  tortoise: "#1a225a",
  navy: "#2a3470",
  rose: "#a8c8ff",
  olive: "#495489",
};

const LENS_COLORS: Record<NonNullable<Product["lensColor"]>, string> = {
  clear: "#d4e4ff",
  smoke: "#0f164a",
  green: "#1a225a",
  amber: "#4f8eff",
  blue: "#2a6df0",
  mirror: "#a8c8ff",
};

/**
 * Stylised SVG eyewear illustration used as product imagery.
 * Self-contained — no remote assets required.
 */
export function GlassesArt({ product, className, size = 320 }: Props) {
  const { frame, frameColor, lensColor = "clear", category } = product;

  const stroke = FRAME_COLORS[frameColor];
  const highlight = FRAME_HIGHLIGHT[frameColor];
  const lens = LENS_COLORS[lensColor];

  const frameStrokeRef = stroke;

  if (category === "accessories") {
    return (
      <svg
        viewBox="0 0 320 200"
        width="100%"
        height={size}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        aria-hidden
      >
        <defs>
          <linearGradient id="case-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="100%" stopColor={stroke} />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="178" rx="110" ry="6" fill="#000" opacity="0.06" />
        <rect
          x="56"
          y="52"
          width="208"
          height="110"
          rx="20"
          fill="url(#case-grad)"
          stroke={stroke}
          strokeWidth="2"
        />
        <rect
          x="56"
          y="52"
          width="208"
          height="36"
          rx="20"
          fill="#ffffff"
          opacity="0.08"
        />
        <circle cx="160" cy="160" r="6" fill={highlight} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }

  // Lens shapes per frame style
  function renderLens(cx: number, cy: number) {
    const common = {
      fill: lens,
      stroke: frameStrokeRef,
      strokeWidth: 6,
    } as const;
    switch (frame) {
      case "round":
        return <circle cx={cx} cy={cy} r="44" {...common} />;
      case "aviator":
        return (
          <path
            d={`M ${cx - 50} ${cy - 30}
                Q ${cx - 44} ${cy + 38} ${cx - 4} ${cy + 40}
                Q ${cx + 38} ${cy + 38} ${cx + 50} ${cy - 30}
                Q ${cx + 30} ${cy - 36} ${cx} ${cy - 36}
                Q ${cx - 30} ${cy - 36} ${cx - 50} ${cy - 30} Z`}
            {...common}
          />
        );
      case "cateye":
        return (
          <path
            d={`M ${cx - 50} ${cy - 18}
                Q ${cx - 30} ${cy + 36} ${cx + 4} ${cy + 32}
                Q ${cx + 44} ${cy + 26} ${cx + 56} ${cy - 30}
                Q ${cx + 30} ${cy - 32} ${cx} ${cy - 30}
                Q ${cx - 30} ${cy - 28} ${cx - 50} ${cy - 18} Z`}
            {...common}
          />
        );
      case "browline":
        return (
          <g>
            <path
              d={`M ${cx - 48} ${cy - 26}
                  L ${cx + 48} ${cy - 26}
                  L ${cx + 50} ${cy - 14}
                  Q ${cx + 44} ${cy + 30} ${cx + 4} ${cy + 32}
                  Q ${cx - 38} ${cy + 30} ${cx - 50} ${cy - 14} Z`}
              {...common}
            />
            <path
              d={`M ${cx - 50} ${cy - 26} L ${cx + 50} ${cy - 26}`}
              stroke={frameStrokeRef}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      case "classic":
      case "rectangle":
      default:
        return (
          <rect
            x={cx - 50}
            y={cy - 28}
            width="100"
            height="58"
            rx="14"
            {...common}
          />
        );
    }
  }

  return (
    <svg
      viewBox="0 0 360 200"
      width="100%"
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="lens-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Soft pedestal shadow */}
      <ellipse cx="180" cy="170" rx="120" ry="8" fill="#000" opacity="0.07" />

      {/* Bridge */}
      <path
        d="M 130 100 Q 180 84 230 100"
        stroke={frameStrokeRef}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Temple arms */}
      <path
        d="M 50 96 Q 80 96 90 100"
        stroke={frameStrokeRef}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 270 100 Q 290 100 320 96"
        stroke={frameStrokeRef}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lenses */}
      {renderLens(90, 100)}
      {renderLens(270, 100)}

      {/* Subtle lens shine */}
      <ellipse cx="78" cy="86" rx="14" ry="4" fill="url(#lens-shine)" opacity="0.7" />
      <ellipse cx="258" cy="86" rx="14" ry="4" fill="url(#lens-shine)" opacity="0.7" />

      {/* Hinge dot */}
      <circle cx="44" cy="96" r="2.6" fill={highlight} />
      <circle cx="316" cy="96" r="2.6" fill={highlight} />
    </svg>
  );
}

export default GlassesArt;
