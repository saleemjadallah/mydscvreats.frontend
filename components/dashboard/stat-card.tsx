import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "saffron",
  featured = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: LucideIcon;
  accent?: "saffron" | "coral" | "emerald" | "stone";
  featured?: boolean;
}) {
  const accentStyles = {
    saffron: {
      iconBg: "bg-[#E8A317]/12",
      iconText: "text-[#E8A317]",
      glowColor: "rgba(232,163,23,0.08)",
      number: "text-ink",
    },
    coral: {
      iconBg: "bg-[#FF6B5A]/10",
      iconText: "text-[#FF6B5A]",
      glowColor: "rgba(255,107,90,0.08)",
      number: "text-ink",
    },
    emerald: {
      iconBg: "bg-[#2E8B57]/10",
      iconText: "text-[#2E8B57]",
      glowColor: "rgba(46,139,87,0.08)",
      number: "text-ink",
    },
    stone: {
      iconBg: "bg-[#8A7563]/10",
      iconText: "text-[#8A7563]",
      glowColor: "rgba(138,117,99,0.08)",
      number: "text-ink",
    },
  };

  const colors = accentStyles[accent];

  if (featured) {
    return (
      <div className="group relative overflow-hidden rounded-[28px] bg-ink p-6 shadow-card transition-all duration-500 hover:shadow-[0_28px_68px_rgba(32,26,23,0.14)]">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#E8A317]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-[#FF6B5A]/10 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E8A317]">
              {label}
            </div>
            <div className="mt-3 text-[56px] font-bold leading-none tracking-tight text-white">
              {value}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-white/50">
              {hint}
            </p>
          </div>
          {Icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-6 w-6 text-[#E8A317]" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-5 shadow-card backdrop-blur transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_28px_68px_rgba(32,26,23,0.12)]`}
    >
      {/* Subtle corner glow on hover */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${colors.glowColor}, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
            {label}
          </span>
          {Icon ? (
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className={`h-[18px] w-[18px] ${colors.iconText}`} />
            </div>
          ) : null}
        </div>
        <div className={`mt-2 text-[40px] font-bold leading-none tracking-tight ${colors.number}`}>
          {value}
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-stone/70">
          {hint}
        </p>
      </div>
    </div>
  );
}
