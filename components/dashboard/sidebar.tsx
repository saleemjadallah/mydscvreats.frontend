"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Palette,
  ScanLine,
  Soup,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: Soup },
  { href: "/dashboard/ai-menu", label: "AI Menu Import", icon: ScanLine },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/widget", label: "Widget", icon: WandSparkles },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Sparkles },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel flex h-full w-full flex-col rounded-[32px] border border-[#E5D7C0] p-5 lg:max-w-[280px]">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="space-y-1">
          <div className="text-xs uppercase tracking-[0.26em] text-stone">mydscvr Eats</div>
          <div className="text-xl font-semibold text-ink">Owner Console</div>
        </Link>
        <Badge variant="default">Beta</Badge>
      </div>

      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[#201A17] text-white"
                  : "text-[#4A3E35] hover:bg-[#F2E7D8]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[28px] bg-[#201A17] p-5 text-white">
        <div className="mb-2 text-sm uppercase tracking-[0.2em] text-[#E8C66A]">Built for speed</div>
        <p className="text-sm text-white/80">
          Publish menu updates, queue AI imagery, and share your hosted page without touching your own site.
        </p>
      </div>
    </aside>
  );
}
