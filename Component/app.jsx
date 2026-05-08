
// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
{ id: 1, name: "Riviera", price: 340, category: "Sunglasses", tag: "Bestseller", color: "#1a1a1a", shape: "oval", desc: "Oversized oval acetate in matte noir. UV400 polarised." },
{ id: 2, name: "Palazzo", price: 420, category: "Sunglasses", tag: "New", color: "#4a3728", shape: "butterfly", desc: "Tortoise butterfly with gradient smoke lenses. Handmade in Italy." },
{ id: 3, name: "Vienne", price: 290, category: "Optical", tag: null, color: "#c9a96e", shape: "round", desc: "Slim gold-fill round frame. Titanium bridge and temples." },
{ id: 4, name: "Caldera", price: 380, category: "Sunglasses", tag: "Limited", color: "#2d2d3a", shape: "shield", desc: "Wraparound shield in midnight acetate. Sporty luxury." },
{ id: 5, name: "Marais", price: 310, category: "Optical", tag: null, color: "#3a3a3a", shape: "square", desc: "Classic square in brushed gunmetal. Lightweight stainless steel." },
{ id: 6, name: "Solène", price: 460, category: "Sunglasses", tag: "New", color: "#8b4040", shape: "cat-eye", desc: "Dramatic cat-eye in crimson cellulose acetate." },
{ id: 7, name: "Lausanne", price: 270, category: "Optical", tag: null, color: "#e8ddd0", shape: "oval", desc: "Translucent champagne oval. Light as a feather, ultra-thin frame." },
{ id: 8, name: "Odalys", price: 520, category: "Sunglasses", tag: "Limited", color: "#0d0d0d", shape: "aviator", desc: "Oversize aviator in blackened steel with double bridge." }];


const COLLECTIONS = [
{ id: "sunglasses", name: "Sunglasses", count: 24, subtitle: "Polarised & UV400" },
{ id: "optical", name: "Optical", count: 18, subtitle: "Prescription ready" },
{ id: "limited", name: "Limited", count: 6, subtitle: "Archive editions" }];


// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => `$${n.toLocaleString()}`;

function GlassesPlaceholder({ color = "#1a1a1a", shape = "oval", width = 240, height = 120 }) {
  const lensW = shape === "aviator" ? 56 : shape === "shield" ? 80 : shape === "butterfly" ? 62 : shape === "cat-eye" ? 58 : 50;
  const lensH = shape === "round" ? 50 : shape === "shield" ? 38 : shape === "aviator" ? 44 : shape === "cat-eye" ? 38 : 34;
  const rx = shape === "round" ? 50 : shape === "oval" || shape === "aviator" ? 22 : shape === "butterfly" || shape === "cat-eye" ? 18 : 4;
  const cx = width / 2;
  const cy = height / 2;
  const gap = 12;
  const l1x = cx - gap / 2 - lensW;
  const l2x = cx + gap / 2;
  const ly = cy - lensH / 2;
  const strokeW = 2.5;
  const cat = shape === "cat-eye";
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
      cat ?
      <path key={i}
      d={`M${x},${ly + lensH * 0.6} Q${x},${ly} ${x + lensW * 0.3},${ly} L${x + lensW * 0.85},${ly} Q${x + lensW},${ly} ${x + lensW},${ly + lensH * 0.5} L${x + lensW},${ly + lensH} Q${x + lensW},${ly + lensH} ${x + lensW * 0.5},${ly + lensH} Q${x},${ly + lensH} ${x},${ly + lensH * 0.6}Z`}
      fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} /> :

      bfly ?
      <path key={i}
      d={`M${x + lensW * 0.5},${ly + lensH * 0.5} Q${x},${ly} ${x},${ly + lensH * 0.5} Q${x},${ly + lensH} ${x + lensW * 0.5},${ly + lensH} Q${x + lensW},${ly + lensH * 0.8} ${x + lensW},${ly + lensH * 0.5} Q${x + lensW},${ly} ${x + lensW * 0.5},${ly + lensH * 0.5}Z`}
      fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} /> :


      <rect key={i} x={x} y={ly} width={lensW} height={lensH} rx={rx} ry={rx}
      fill={`url(#lg-${shape})`} stroke={color} strokeWidth={strokeW} />

      )}
    </svg>);

}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Nav({ page, setPage, cartCount, setCartOpen, lightMode, toggleLightMode }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Shop", "Collections", "About"];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "14px 40px" : "22px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--scrolled-border)" : "none",
        transition: "all 0.35s ease"
      }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--display)", fontSize: 22, letterSpacing: "0.18em", color: "var(--text)", fontWeight: 500 }}>JURAGAN GROSIR  

          </span>
        </button>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {links.map((l) =>
          <button key={l} onClick={() => setPage(l.toLowerCase())}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.16em",
            color: "var(--text-muted)", textTransform: "uppercase",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "var(--gold)"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}>
            {l}</button>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
          onMouseEnter={(e) => e.target.style.color = "var(--gold)"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}>
            Search</button>
          {/* Light/Dark toggle */}
          <button onClick={toggleLightMode} title={lightMode ? "Switch to Dark" : "Switch to Light"} style={{
            background: "none", border: "1px solid var(--border)", cursor: "pointer",
            width: 30, height: 30, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", fontSize: 13, flexShrink: 0,
            transition: "border-color 0.2s, color 0.2s"
          }}
          onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--gold)";e.currentTarget.style.color = "var(--gold)";}}
          onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--border)";e.currentTarget.style.color = "var(--text-muted)";}}>
            {lightMode ? "☀" : "☽"}</button>
          <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "var(--gold)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}>
              Bag</span>
            {cartCount > 0 &&
            <span style={{
              position: "absolute", top: -6, right: -10,
              background: "var(--gold)", color: "var(--bg)",
              fontSize: 9, fontWeight: 600, borderRadius: "50%",
              width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center"
            }}>{cartCount}</span>
            }
          </button>
        </div>
      </nav>
    </>);

}

function HeroSection({ setPage, tweaks }) {
  return (
    <section style={{
      height: "100vh", position: "relative", display: "flex", alignItems: "center",
      overflow: "hidden"
    }}>
      {/* Background geometric */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 70% 50%, var(--hero-bg-start) 0%, var(--hero-bg-end) 60%)"
      }} />
      <div style={{
        position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)",
        width: "42vw", height: "42vw", maxWidth: 600, maxHeight: 600,
        borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.08)",
        boxShadow: "0 0 120px 40px rgba(201,169,110,0.04)"
      }} />
      <div style={{
        position: "absolute", right: "12%", top: "50%", transform: "translateY(-50%)",
        width: "28vw", height: "28vw", maxWidth: 400, maxHeight: 400,
        borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.12)"
      }} />

      {/* Product visual */}
      <div style={{
        position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "floatUp 1.2s ease forwards", opacity: 0,
        animationDelay: "0.4s",
        filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.45))",
      }}>
        <div style={{
          background: "transparent",
          border: "none",
          borderRadius: 4, padding: "48px 56px"
        }}>
          <GlassesPlaceholder color="#7eb3e8" shape="oval" width={280} height={140} />
        </div>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--gold-dim)", textTransform: "uppercase" }}>
          Riviera — Matte Noir
        </span>
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 8% 0 8%", maxWidth: 640 }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase",
          marginBottom: 24, animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.1s"
        }}>
          SS 2026 Collection
        </div>
        <h1 style={{
          fontFamily: "var(--display)", fontSize: "clamp(52px, 6vw, 88px)",
          fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em",
          color: "var(--text)", marginBottom: 28,
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.2s"
        }}>
          See the world<br /><em>differently.</em>
        </h1>
        <p style={{
          fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 420,
          marginBottom: 44, fontWeight: 300,
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.3s"
        }}>
          Handcrafted eyewear for those who consider every detail. Italian acetate, Japanese hinges, lifetime craftsmanship.
        </p>
        <div style={{
          display: "flex", gap: 16, alignItems: "center",
          animation: "fadeUp 0.8s ease forwards", opacity: 0, animationDelay: "0.4s"
        }}>
          <button onClick={() => setPage("shop")} style={{
            background: "var(--gold)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            padding: "14px 36px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
            fontFamily: "var(--sans)", fontWeight: 500,
            transition: "background 0.2s, transform 0.2s"
          }}
          onMouseEnter={(e) => {e.target.style.background = "var(--gold-light)";e.target.style.transform = "translateY(-1px)";}}
          onMouseLeave={(e) => {e.target.style.background = "var(--gold)";e.target.style.transform = "none";}}>
            Shop Now</button>
          <button onClick={() => setPage("collections")} style={{
            background: "none", color: "var(--text-muted)",
            border: "1px solid var(--border)", cursor: "pointer",
            padding: "14px 32px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
            fontFamily: "var(--sans)", fontWeight: 400,
            transition: "border-color 0.2s, color 0.2s"
          }}
          onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--gold-dim)";e.currentTarget.style.color = "var(--gold)";}}
          onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--border)";e.currentTarget.style.color = "var(--text-muted)";}}>
            View Collections</button>
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "fadeUp 1s ease forwards", opacity: 0, animationDelay: "0.9s"
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--text-dim)", textTransform: "uppercase" }}>Scroll</span>
        <div style={{
          width: 1, height: 40, background: "linear-gradient(to bottom, var(--gold-dim), transparent)",
          animation: "scrollLine 1.6s ease-in-out infinite"
        }} />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateY(-50%) translateY(0); }
        }
        @keyframes scrollLine {
          0%,100% { opacity: 0.3; transform: scaleY(1); }
          50%      { opacity: 1;   transform: scaleY(1.4); }
        }
      `}</style>
    </section>);

}

function CollectionsSection({ setPage }) {
  return (
    <section style={{ padding: "100px 8%", background: "var(--bg2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>Categories</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, color: "var(--text)" }}>
            Shop by Collection
          </h2>
        </div>
        <button onClick={() => setPage("collections")} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--gold)",
          fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--sans)"
        }}>View All →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {COLLECTIONS.map((col) =>
        <button key={col.id} onClick={() => setPage("collections")} style={{
          position: "relative", background: "var(--surface)", border: "none", cursor: "pointer",
          padding: "56px 40px", textAlign: "left", overflow: "hidden",
          transition: "background 0.3s"
        }}
        onMouseEnter={(e) => {e.currentTarget.style.background = "var(--surface2)";}}
        onMouseLeave={(e) => {e.currentTarget.style.background = "var(--surface)";}}>
          
            <div style={{ marginBottom: 32 }}>
              <GlassesPlaceholder
              color={col.id === "sunglasses" ? "#c9a96e" : col.id === "optical" ? "#e8ddd0" : "#4a3728"}
              shape={col.id === "sunglasses" ? "aviator" : col.id === "optical" ? "round" : "cat-eye"}
              width={160} height={80} />
            
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              {col.count} styles
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 400, color: "var(--text)", marginBottom: 4 }}>
              {col.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{col.subtitle}</div>
            <div style={{
            position: "absolute", bottom: 24, right: 24,
            width: 32, height: 32, borderRadius: "50%",
            border: "1px solid var(--gold-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold)", fontSize: 16
          }}>→</div>
            {/* gold accent line */}
            <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(to right, var(--gold), transparent)",
            opacity: 0.4
          }} />
          </button>
        )}
      </div>
    </section>);

}

function ProductCard({ product, onAdd, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    style={{ cursor: "pointer" }}>
      {/* Image */}
      <div onClick={() => onClick(product)} style={{
        position: "relative", background: "var(--surface)",
        padding: "40px 32px 32px",
        transition: "transform 0.35s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        overflow: "hidden"
      }}>
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          height: 120
        }}>
          <GlassesPlaceholder color={product.color} shape={product.shape} width={220} height={110} />
        </div>
        {product.tag &&
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: product.tag === "New" ? "var(--gold)" : "var(--surface2)",
          color: product.tag === "New" ? "var(--bg)" : "var(--gold)",
          fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
          padding: "4px 10px", fontWeight: 600
        }}>{product.tag}</div>
        }
        {/* hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--overlay-sm)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s"
        }}>
          <span style={{
            fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--text)", border: "1px solid rgba(242,237,230,0.3)",
            padding: "10px 24px"
          }}>Quick View</span>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "18px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 400, color: "var(--text)", marginBottom: 2 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em" }}>{product.category}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, color: "var(--gold)", fontWeight: 400 }}>{fmt(product.price)}</div>
          <button onClick={(e) => {e.stopPropagation();onAdd(product);}} style={{
            marginTop: 6, background: "none", border: "none", cursor: "pointer",
            fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
            color: hovered ? "var(--gold)" : "var(--text-dim)",
            fontFamily: "var(--sans)", transition: "color 0.2s", padding: 0
          }}>Add to Bag</button>
        </div>
      </div>
    </div>);

}

function ShopPage({ onAdd, setActivePDP, tweaks }) {
  const [filter, setFilter] = React.useState("All");
  const cats = ["All", "Sunglasses", "Optical"];
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        padding: "60px 8% 48px",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end"
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>SS 2026</div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 400, color: "var(--text)" }}>All Eyewear</h1>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {cats.map((c) =>
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? "var(--gold)" : "none",
            border: `1px solid ${filter === c ? "var(--gold)" : "var(--border)"}`,
            color: filter === c ? "var(--bg)" : "var(--text-muted)",
            padding: "8px 20px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.2s"
          }}>{c}</button>
          )}
        </div>
      </div>
      {/* Grid */}
      <div style={{
        padding: "56px 8%",
        display: "grid",
        gridTemplateColumns: tweaks.gridCols === "2" ? "repeat(2,1fr)" : tweaks.gridCols === "4" ? "repeat(4,1fr)" : "repeat(3,1fr)",
        gap: "56px 32px"
      }}>
        {filtered.map((p) =>
        <ProductCard key={p.id} product={p} onAdd={onAdd} onClick={(p) => setActivePDP(p)} />
        )}
      </div>
    </div>);

}

function PDPModal({ product, onClose, onAdd }) {
  if (!product) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "var(--overlay-lg)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", maxWidth: 880, width: "100%",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        position: "relative",
        animation: "fadeUp 0.3s ease forwards"
      }}>
        {/* Visual */}
        <div style={{
          background: "var(--bg2)", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "64px 48px", position: "relative"
        }}>
          <GlassesPlaceholder color={product.color} shape={product.shape} width={280} height={140} />
          {product.tag &&
          <div style={{
            position: "absolute", top: 20, left: 20,
            background: product.tag === "New" ? "var(--gold)" : "var(--surface2)",
            color: product.tag === "New" ? "var(--bg)" : "var(--gold)",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            padding: "4px 10px", fontWeight: 600
          }}>{product.tag}</div>
          }
        </div>
        {/* Details */}
        <div style={{ padding: "48px 44px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>
            {product.category}
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 38, fontWeight: 400, color: "var(--text)", marginBottom: 6, lineHeight: 1.1 }}>
            {product.name}
          </h2>
          <div style={{ fontSize: 22, color: "var(--gold)", marginBottom: 24 }}>{fmt(product.price)}</div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36 }}>{product.desc}</p>
          {/* Colors */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 12 }}>Frame</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[product.color, "#c9a96e", "#e8ddd0"].map((c, i) =>
              <div key={i} style={{
                width: 28, height: 28, borderRadius: "50%", background: c,
                border: i === 0 ? "2px solid var(--gold)" : "2px solid transparent",
                cursor: "pointer"
              }} />
              )}
            </div>
          </div>
          <button onClick={() => {onAdd(product);onClose();}} style={{
            width: "100%", background: "var(--gold)", color: "var(--bg)",
            border: "none", cursor: "pointer", padding: "16px",
            fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            fontFamily: "var(--sans)", fontWeight: 500,
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.background = "var(--gold-light)"}
          onMouseLeave={(e) => e.target.style.background = "var(--gold)"}>
            Add to Bag</button>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Free shipping on orders over $200 · 30-day returns · Complimentary case included
          </div>
        </div>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none",
          border: "1px solid var(--border)", borderRadius: "50%",
          width: 32, height: 32, cursor: "pointer", color: "var(--text-muted)",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
        }}>×</button>
      </div>
    </div>);

}

function CartDrawer({ open, onClose, cart, setCart }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const updateQty = (id, delta) => setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "var(--overlay-md)",
        zIndex: 1100, opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s"
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "var(--surface)", zIndex: 1200,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        borderLeft: "1px solid var(--border)"
      }}>
        {/* Header */}
        <div style={{
          padding: "28px 32px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 400 }}>Your Bag</div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 22, lineHeight: 1
          }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {cart.length === 0 ?
          <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-dim)" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◯</div>
              <div style={{ fontSize: 13, letterSpacing: "0.08em" }}>Your bag is empty</div>
            </div> :
          cart.map((item) =>
          <div key={item.id} style={{
            display: "flex", gap: 16, marginBottom: 28,
            paddingBottom: 28, borderBottom: "1px solid var(--border)",
            alignItems: "flex-start"
          }}>
              <div style={{ background: "var(--bg2)", padding: "16px 12px", flexShrink: 0 }}>
                <GlassesPlaceholder color={item.color} shape={item.shape} width={100} height={50} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{item.category}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{
                    background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
                    width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>−</button>
                    <span style={{ fontSize: 13 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{
                    background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
                    width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>+</button>
                  </div>
                  <div style={{ color: "var(--gold)", fontWeight: 400 }}>{fmt(item.price * item.qty)}</div>
                </div>
              </div>
              <button onClick={() => remove(item.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-dim)", fontSize: 16
            }}>×</button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 &&
        <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>Total</span>
              <span style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--gold)" }}>{fmt(total)}</span>
            </div>
            <button style={{
            width: "100%", background: "var(--gold)", color: "var(--bg)",
            border: "none", cursor: "pointer", padding: "16px",
            fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            fontFamily: "var(--sans)", fontWeight: 500
          }}>Checkout</button>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "var(--text-dim)" }}>
              Free shipping on all orders
            </div>
          </div>
        }
      </div>
    </>);

}

function CollectionsPage({ setPage }) {
  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ padding: "60px 8% 48px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>OBSCURA</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 400, color: "var(--text)" }}>Collections</h1>
      </div>
      <div style={{ padding: "64px 8%" }}>
        {COLLECTIONS.map((col, idx) =>
        <div key={col.id} onClick={() => setPage("shop")} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 0, marginBottom: 2, cursor: "pointer",
          background: "var(--surface)",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}>
          
            <div style={{ padding: "64px 8%", display: "flex", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 8 }}>
                  {col.count} Styles
                </div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px, 3vw, 48px)", fontWeight: 400, color: "var(--text)", marginBottom: 12 }}>
                  {col.name}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>{col.subtitle}</p>
                <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", borderBottom: "1px solid var(--gold-dim)" }}>
                  Shop Now →
                </span>
              </div>
            </div>
            <div style={{
            background: "var(--bg2)", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 48, minHeight: 280
          }}>
              <GlassesPlaceholder
              color={col.id === "sunglasses" ? "#c9a96e" : col.id === "optical" ? "#e8ddd0" : "#4a3728"}
              shape={col.id === "sunglasses" ? "aviator" : col.id === "optical" ? "round" : "cat-eye"}
              width={300} height={150} />
            
            </div>
          </div>
        )}
      </div>
    </div>);

}

function AboutPage() {
  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      {/* Banner */}
      <div style={{
        background: "var(--surface)",
        padding: "120px 8% 100px",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)",
          opacity: 0.06
        }}>
          <GlassesPlaceholder color="#c9a96e" shape="oval" width={500} height={250} />
        </div>
        <div style={{ maxWidth: 640, position: "relative" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Est. 2018</div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 400, lineHeight: 1.1, color: "var(--text)", marginBottom: 28 }}>
            Crafted for<br /><em>the discerning eye.</em>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.8, fontWeight: 300 }}>
            OBSCURA was born from a single belief: that eyewear is the most personal accessory one can wear. We work exclusively with master craftspeople in Sabae, Japan and Belluno, Italy.
          </p>
        </div>
      </div>

      {/* Values */}
      <div style={{ padding: "80px 8%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {[
        { title: "Materials", body: "Every frame begins as raw acetate or titanium — no shortcuts, no composites. Sourced directly from the finest mills." },
        { title: "Craft", body: "Over 200 individual steps in every frame. Hand-polished, hand-assembled, inspected by master artisans with decades of experience." },
        { title: "Legacy", body: "We design for permanence, not fashion cycles. Every OBSCURA frame is guaranteed for life and repairable by our ateliers." }].
        map((v) =>
        <div key={v.title} style={{ background: "var(--surface)", padding: "48px 40px" }}>
            <div style={{ width: 32, height: 1, background: "var(--gold)", marginBottom: 24 }} />
            <h3 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 400, color: "var(--text)", marginBottom: 14 }}>{v.title}</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{v.body}</p>
          </div>
        )}
      </div>
    </div>);

}

function NewsletterSection() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <section style={{
      background: "var(--surface)",
      padding: "100px 8%",
      textAlign: "center",
      borderTop: "1px solid var(--border)"
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Stay Connected</div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>JURAGAN GROSIR

      </h2>
      <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.7 }}>
        New arrivals, limited editions, and private sales — delivered to your inbox first.
      </p>
      {sent ?
      <div style={{ color: "var(--gold)", fontFamily: "var(--display)", fontSize: 18, fontStyle: "italic" }}>
          Thank you. Welcome to OBSCURA.
        </div> :

      <form onSubmit={(e) => {e.preventDefault();if (email) setSent(true);}}
      style={{ display: "flex", maxWidth: 440, margin: "0 auto", gap: 0 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com" required
        style={{
          flex: 1, background: "var(--bg2)", border: "1px solid var(--border)",
          borderRight: "none", padding: "14px 20px",
          color: "var(--text)", fontSize: 14, fontFamily: "var(--sans)",
          outline: "none"
        }} />
          <button type="submit" style={{
          background: "var(--gold)", color: "var(--bg)", border: "none",
          padding: "14px 28px", fontSize: 11, letterSpacing: "0.18em",
          textTransform: "uppercase", fontFamily: "var(--sans)", fontWeight: 500,
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
        }}>Subscribe</button>
        </form>
      }
    </section>);

}

function Footer({ setPage }) {
  return (
    <footer style={{
      background: "var(--bg)", borderTop: "1px solid var(--border)",
      padding: "64px 8% 40px"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 56 }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 20, letterSpacing: "0.18em", color: "var(--text)", marginBottom: 16 }}>JURAGAN GROSIR</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 280 }}>
            Handcrafted fashion eyewear. Made in Italy & Japan. Designed for those who see everything.
          </p>
        </div>
        {[
        { title: "Shop", links: ["Sunglasses", "Optical", "Limited Edition", "New Arrivals"] },
        { title: "Company", links: ["About", "Ateliers", "Sustainability", "Press"] },
        { title: "Support", links: ["Shipping & Returns", "Care Guide", "Warranty", "Contact"] }].
        map((col) =>
        <div key={col.title}>
            <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) =>
            <button key={l} style={{
              background: "none", border: "none", cursor: "pointer", textAlign: "left",
              fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", padding: 0,
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--text)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}>
              {l}</button>
            )}
            </div>
          </div>
        )}
      </div>
      <div style={{
        borderTop: "1px solid var(--border)", paddingTop: 28,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>© 2026 JURAGAN GROSIR. All rights reserved.</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Build With Deadline</div>
      </div>
    </footer>);

}

// ─── Root App ─────────────────────────────────────────────────────────────────

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "gridCols": "3",
    "accentColor": "#7eb3e8",
    "darkBg": true,
    "heroTagline": "See the world differently."
  } /*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [page, setPage] = React.useState("home");
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [activePDP, setActivePDP] = React.useState(null);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Apply accent color and light/dark mode from tweaks
  React.useEffect(() => {
    // Only apply manual accent override if user has changed it from the dark default
    document.documentElement.style.setProperty("--gold", tweaks.accentColor);
  }, [tweaks.accentColor]);

  React.useEffect(() => {
    if (tweaks.lightMode) {
      document.documentElement.classList.add("light-mode");
      // Remove inline override so light mode CSS variable takes effect
      document.documentElement.style.removeProperty("--gold");
    } else {
      document.documentElement.classList.remove("light-mode");
      // Restore the accent color for dark mode
      document.documentElement.style.setProperty("--gold", tweaks.accentColor);
    }
  }, [tweaks.lightMode]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav page={page} setPage={setPage} cartCount={cartCount} setCartOpen={setCartOpen}
      lightMode={tweaks.lightMode}
      toggleLightMode={() => setTweak("lightMode", !tweaks.lightMode)} />

      {page === "home" &&
      <>
          <HeroSection setPage={setPage} tweaks={tweaks} />
          <CollectionsSection setPage={setPage} />
          <div style={{ padding: "100px 8% 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>Featured</div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 400, color: "var(--text)" }}>
                  New Arrivals
                </h2>
              </div>
              <button onClick={() => setPage("shop")} style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--gold)",
              fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--sans)"
            }}>View All →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "48px 28px" }}>
              {PRODUCTS.slice(0, 4).map((p) =>
            <ProductCard key={p.id} product={p} onAdd={addToCart} onClick={setActivePDP} />
            )}
            </div>
          </div>
          <div style={{ padding: "100px 8% 0" }}>
            <NewsletterSection />
          </div>
          <Footer setPage={setPage} />
        </>
      }

      {page === "shop" &&
      <>
          <ShopPage onAdd={addToCart} setActivePDP={setActivePDP} tweaks={tweaks} />
          <NewsletterSection />
          <Footer setPage={setPage} />
        </>
      }

      {page === "collections" &&
      <>
          <CollectionsPage setPage={setPage} />
          <Footer setPage={setPage} />
        </>
      }

      {page === "about" &&
      <>
          <AboutPage />
          <NewsletterSection />
          <Footer setPage={setPage} />
        </>
      }

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} />
      <PDPModal product={activePDP} onClose={() => setActivePDP(null)} onAdd={addToCart} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle label="Light Mode" value={tweaks.lightMode}
        onChange={(v) => setTweak("lightMode", v)} />
        <TweakColor label="Accent Color" value={tweaks.accentColor}
        onChange={(v) => setTweak("accentColor", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Product Grid" value={tweaks.gridCols}
        options={["2", "3", "4"]}
        onChange={(v) => setTweak("gridCols", v)} />
        <TweakSection label="Copy" />
        <TweakText label="Hero Tagline" value={tweaks.heroTagline}
        onChange={(v) => setTweak("heroTagline", v)} />
      </TweaksPanel>
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);