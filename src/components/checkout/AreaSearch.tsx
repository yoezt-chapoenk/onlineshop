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
    <div ref={containerRef} className="relative">
      <label className="label" htmlFor="area_search">
        Kota / Kecamatan tujuan
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-muted)]" />
        <input
          id="area_search"
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && !selected && setOpen(true)}
          placeholder="Ketik nama kota atau kecamatan…"
          className="input !pl-9 !pr-8"
          autoComplete="off"
          disabled={disabled}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[color:var(--color-muted)]" />
        )}
        {selected && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-[color:var(--color-line)] bg-white shadow-lg">
          {results.map((area) => (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => handleSelect(area)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[color:var(--color-cloud-50)] transition-colors flex items-start gap-2"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[color:var(--color-navy-500)]" />
                <div>
                  <div className="font-medium text-[color:var(--color-ink)]">
                    {area.label}
                  </div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    Kode Pos: {area.postalCode}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[color:var(--color-line)] bg-white shadow-lg px-4 py-3 text-sm text-[color:var(--color-muted)]">
          Tidak ditemukan area yang cocok.
        </div>
      )}
    </div>
  );
}
