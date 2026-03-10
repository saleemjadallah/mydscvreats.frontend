"use client";

import { useState, useMemo } from "react";
import type { DietaryTag, MenuSection } from "@/types";

interface DietaryFilterChipsProps {
  sections: MenuSection[];
  activeFilters: Set<string>;
  onToggleFilter: (tagKey: string) => void;
  chipBg: string;
  chipText: string;
  chipBorder: string;
}

export function DietaryFilterChips({
  sections,
  activeFilters,
  onToggleFilter,
  chipBg,
  chipText,
  chipBorder,
}: DietaryFilterChipsProps) {
  // Collect unique tags across all menu items with counts
  const tagStats = useMemo(() => {
    const counts = new Map<string, { tag: { key: string; label: string; icon: string | null }; count: number }>();

    for (const section of sections) {
      for (const item of section.items) {
        for (const dt of item.dietaryTags ?? []) {
          const existing = counts.get(dt.tag.key);
          if (existing) {
            existing.count++;
          } else {
            counts.set(dt.tag.key, {
              tag: dt.tag,
              count: 1,
            });
          }
        }
      }
    }

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [sections]);

  if (!tagStats.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tagStats.map(({ tag, count }) => {
        const isActive = activeFilters.has(tag.key);

        return (
          <button
            key={tag.key}
            type="button"
            onClick={() => onToggleFilter(tag.key)}
            className="whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive ? chipText : chipBg,
              color: isActive ? "#fff" : chipText,
              borderColor: isActive ? chipText : chipBorder,
            }}
          >
            {tag.icon && <span className="mr-1">{tag.icon}</span>}
            {tag.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
