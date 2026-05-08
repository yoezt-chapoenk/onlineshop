"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface Area {
  id: string;
  label: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
}

interface AreaSearchProps {
  onSelect: (area: Area) => void;
  selectedLabel?: string;
  disabled?: boolean;
}

export default function AreaSearch({
  onSelect,
  selectedLabel,
  disabled,
}: AreaSearchProps) {
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [results, setResults] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(Boolean(selectedLabel));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAreas = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipping/areas?q=${encodeURIComponent(q)}`,
      );
      const json = (await res.json()) as { areas: Area[] };
      setResults(json.areas ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setSelected(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchAreas(value), 300);
  }

  function handleSelect(area: Area) {
    setQuery(area.label);
    setSelected(true);
    setOpen(false);
    setResults([]);
    onSelect(area);
  }

  function handleClear() {
    setQuery("");
    setSelected(false);
    setResults([]);
    setOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label htmlFor="area_search" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, display: "block" }}>
        Kota / Kecamatan tujuan
      </label>
      <div style={{ position: "relative" }}>
        <MapPin style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} />
        <input
          id="area_search"
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && !selected && setOpen(true)}
          placeholder="Ketik nama kota atau kecamatan…"
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px 16px 12px 36px", outline: "none", fontSize: 14, fontFamily: "var(--font-sans)" }}
          autoComplete="off"
          disabled={disabled}
        />
        {loading && (
          <Loader2 style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} className="animate-spin" />
        )}
        {selected && !loading && (
          <button
            type="button"
            onClick={handleClear}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul style={{ position: "absolute", zIndex: 50, marginTop: 4, width: "100%", maxHeight: 240, overflow: "auto", background: "var(--surface)", border: "1px solid var(--border)", listStyle: "none", padding: 0 }}>
          {results.map((area) => (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => handleSelect(area)}
                style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 8, transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <MapPin style={{ width: 14, height: 14, marginTop: 2, color: "var(--gold)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>
                    {area.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Kode Pos: {area.postalCode}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && results.length === 0 && query.length >= 3 && (
        <div style={{ position: "absolute", zIndex: 50, marginTop: 4, width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", fontSize: 14, color: "var(--text-muted)" }}>
          Tidak ditemukan area yang cocok.
        </div>
      )}
    </div>
  );
}
