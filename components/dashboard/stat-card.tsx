import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "saffron",
}: {
  label: string;
  value: string;
  hint: string;
  icon?: LucideIcon;
  accent?: "saffron" | "coral" | "emerald" | "stone";
}) {
  const accentColors = {
    saffron: { border: "border-l-saffron", bg: "bg-saffron/10", text: "text-saffron" },
    coral: { border: "border-l-coral", bg: "bg-coral/10", text: "text-coral" },
    emerald: { border: "border-l-[#2E8B57]", bg: "bg-[#2E8B57]/10", text: "text-[#2E8B57]" },
    stone: { border: "border-l-stone", bg: "bg-stone/10", text: "text-stone" },
  };

  const colors = accentColors[accent];

  return (
    <Card className={`border-l-4 ${colors.border} transition-transform duration-300 hover:-translate-y-1`}>
      <CardHeader className="relative">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
        {Icon ? (
          <div className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="text-sm text-stone">{hint}</CardContent>
    </Card>
  );
}
