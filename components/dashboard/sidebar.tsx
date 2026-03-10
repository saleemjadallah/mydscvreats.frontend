"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Menu,
  Palette,
  ScanLine,
  Soup,
  Sparkles,
  WandSparkles,
  X,
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
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="MyDscvr Eats" width={140} height={56} className="h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="default">Beta</Badge>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-stone hover:bg-[#F2E7D8] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-[#201A17] text-white"
                  : "text-[#4A3E35] hover:bg-[#F2E7D8] hover:scale-[1.02]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-[28px] bg-[#201A17] p-5 text-white">
        <div className="mb-2 text-sm uppercase tracking-[0.2em] text-[#E8C66A]">Built for speed</div>
        <p className="text-sm text-white/80">
          Publish menu updates, queue AI imagery, and share your hosted page without touching your own site.
        </p>
      </div>
    </>
  );

  return (
    <div className="md:w-[260px] md:shrink-0">
      {/* Mobile menu button — visible below md */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-panel flex items-center gap-2 rounded-2xl border border-[#E5D7C0] px-4 py-3 text-sm font-medium text-ink md:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col rounded-r-[32px] border-r border-[#E5D7C0] bg-sand p-5 shadow-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — hidden below md, sticky */}
      <aside className="glass-panel sticky top-8 hidden h-fit max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-[32px] border border-[#E5D7C0] p-5 md:flex">
        {sidebarContent}
      </aside>
    </div>
  );
}
