"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CategoryAnalysis } from "@/types";

interface MenuAnalysisCardProps {
  category: CategoryAnalysis;
  accentColor?: string;
}

function getScoreBadge(score: number) {
  if (score >= 75)
    return <Badge variant="success">{score}/100</Badge>;
  if (score >= 50)
    return <Badge variant="muted" className="bg-[#FFFBF0] text-[#8A7209]">{score}/100</Badge>;
  return <Badge variant="accent">{score}/100</Badge>;
}

function getItemIcon(type: "warning" | "suggestion" | "positive") {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#C05746]" />;
    case "suggestion":
      return <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[#B8960C]" />;
    case "positive":
      return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#2E8B57]" />;
  }
}

export function MenuAnalysisCard({ category }: MenuAnalysisCardProps) {
  return (
    <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{category.title}</h3>
        {getScoreBadge(category.score)}
      </div>
      <p className="mb-4 text-sm text-stone">{category.summary}</p>

      {category.items.length > 0 && (
        <div className="space-y-2.5">
          {category.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2.5">
              {getItemIcon(item.type)}
              <div className="min-w-0 flex-1 text-sm">
                <span className="text-ink">{item.message}</span>
                {item.menuItemName && (
                  <Link
                    href="/dashboard/menu"
                    className="ml-1 text-[#B8960C] hover:underline"
                  >
                    {item.menuItemName}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {category.items.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-[#2E8B57]">
          <CheckCircle2 className="h-4 w-4" />
          No issues found
        </div>
      )}
    </div>
  );
}
