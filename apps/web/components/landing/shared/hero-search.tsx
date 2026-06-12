"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowRight,
  faXmark,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { HeroSearchProps, SearchResult } from "@/types/search";

// ── Static data ───────────────────────────────────────────────────────────────

const RESULT_TYPE_LABEL: Record<SearchResult["type"], string> = {
  creator:         "Creator",
  course:          "Course",
  category:        "Topic",
  "learning-path": "Path",
};

const POPULAR: readonly string[] = [
  "UI/UX portfolio review",
  "React interview prep",
  "System design fundamentals",
  "Personal finance basics",
  "Career switch to tech",
  "Figma for beginners",
  "Data science roadmap",
  "Digital marketing strategy",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroSearch({
  onSearch,
  results,
  isLoading = false,
  className,
}: HeroSearchProps): React.ReactElement {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // ── Close on outside click / Escape ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const trimmed     = query.trim();
  const suggestions = trimmed
    ? POPULAR.filter((s) => s.toLowerCase().includes(trimmed.toLowerCase()))
    : POPULAR;
  const showResults = !!results?.length;
  const isActive    = open || focused;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setOpen(false);
    onSearch?.(trimmed, null);
  }, [trimmed, onSearch]);

  const pick = useCallback((text: string) => {
    setQuery(text);
    setOpen(false);
    inputRef.current?.blur();
    onSearch?.(text, null);
  }, [onSearch]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("w-full", className)}>
      {/* click-outside anchor */}
      <div ref={wrapperRef} className="relative">

        {/* Input pill — only this takes up layout space */}
        <div
          className={cn(
            "relative border bg-card transition-[border-color,box-shadow] duration-150",
            open  ? "rounded-t-[28px] shadow-lg border-b-transparent" : "rounded-full shadow-sm",
            isActive
              ? "border-primary shadow-md"
              : "border-border hover:border-border/80 hover:shadow-md",
          )}
        >
          {/*
            CommandPrimitive provides cmdk context:
            - ArrowUp / ArrowDown navigates items
            - Enter fires onSelect on the highlighted item
            - shouldFilter=false → we control filtering
            - loop → wraps from last item back to first
          */}
          <CommandPrimitive shouldFilter={false} loop>

            {/* ── Input row ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2.5 px-5 py-3">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-150",
                  isActive ? "text-primary" : "text-muted-foreground/60",
                )}
              />

              <CommandPrimitive.Input
                ref={inputRef}
                placeholder="Search creators, courses, topics..."
                value={query}
                onValueChange={(v) => { setQuery(v); setOpen(true); }}
                onFocus={() => { setFocused(true); setOpen(true); }}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  // cmdk handles Enter for highlighted items (calls onSelect).
                  // If nothing highlighted, e.defaultPrevented stays false → we search.
                  if (e.key === "Enter" && !e.defaultPrevented) handleSearch();
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-base [&::-webkit-search-cancel-button]:appearance-none"
              />

              {trimmed && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  aria-label="Clear"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                </button>
              )}

              {/* Desktop */}
              <button
                type="button"
                onClick={handleSearch}
                aria-label="Search"
                className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 sm:flex"
              >
                Search
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
              </button>

              {/* Mobile */}
              <button
                type="button"
                onClick={handleSearch}
                aria-label="Search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 sm:hidden"
              >
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* ── Floating suggestions — absolutely positioned, zero layout impact ── */}
            {open && (
              <div
                className={cn(
                  "absolute left-[-1px] right-[-1px] top-full z-50",
                  "rounded-b-2xl border border-t-0 bg-card py-2 shadow-lg",
                  isActive ? "border-primary" : "border-border",
                )}
              >
                <div className="mx-5 h-px bg-border/40" />

                <CommandList className="max-h-[280px] py-2">

                  {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Searching…
                    </div>

                  ) : showResults ? (
                    // ── Real API results ─────────────────────────────────────
                    <CommandGroup>
                      {results!.map((r) => (
                        <CommandItem
                          key={r.id}
                          value={r.id}
                          onSelect={() => { window.location.href = r.href; }}
                          className="gap-3 rounded-none px-5 py-2.5 [&_svg.lucide-check]:hidden"
                        >
                          {r.thumbnailUrl ? (
                            <img
                              src={r.thumbnailUrl}
                              alt=""
                              aria-hidden
                              className="h-8 w-8 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                              {r.title[0]}
                            </span>
                          )}
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">{r.title}</span>
                            {r.subtitle && (
                              <span className="truncate text-xs text-muted-foreground">{r.subtitle}</span>
                            )}
                          </span>
                          <span className="ml-auto shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {RESULT_TYPE_LABEL[r.type]}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>

                  ) : (
                    // ── Suggestions ──────────────────────────────────────────
                    <>
                      {/* Exact query — pinned at top when typing */}
                      {trimmed && (
                        <CommandGroup>
                          <CommandItem
                            value={`__q__${trimmed}`}
                            onSelect={() => pick(trimmed)}
                            className="gap-3 rounded-none px-5 py-2 [&_svg.lucide-check]:hidden"
                          >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{trimmed}</span>
                          </CommandItem>
                        </CommandGroup>
                      )}

                      {/* Popular / filtered */}
                      <CommandGroup
                        heading={!trimmed ? "Popular" : undefined}
                        className={cn(!trimmed && "[&_[cmdk-group-heading]]:px-5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground/40")}
                      >
                        {suggestions.map((s) => (
                          <CommandItem
                            key={s}
                            value={s}
                            onSelect={() => pick(s)}
                            className="gap-3 rounded-none px-5 py-2 [&_svg.lucide-check]:hidden"
                          >
                            <FontAwesomeIcon
                              icon={trimmed ? faMagnifyingGlass : faArrowTrendUp}
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                            />
                            <span className="text-sm text-foreground">{s}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      {suggestions.length === 0 && trimmed && (
                        <CommandEmpty className="px-5 py-5 text-sm text-muted-foreground">
                          No suggestions for &ldquo;{query}&rdquo;
                        </CommandEmpty>
                      )}
                    </>
                  )}

                </CommandList>
              </div>
            )}

          </CommandPrimitive>
        </div>

      </div>
    </div>
  );
}
