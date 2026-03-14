"use client";

import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface PoweredByFooterProps {
  restaurantId: string;
  hideBranding: boolean;
  isEmbedded?: boolean;
}

export function PoweredByFooter({
  restaurantId,
  hideBranding,
  isEmbedded = false,
}: PoweredByFooterProps) {
  const pathname = usePathname();

  if (hideBranding) {
    return null;
  }

  const ctaUrl = `https://mydscvr.ai?utm_source=powered_by&utm_medium=${isEmbedded ? "embed_footer" : "menu_footer"}&utm_campaign=${restaurantId}`;

  function handleClick() {
    apiClient
      .trackBrandingClick({
        restaurantId,
        path: pathname ?? undefined,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      })
      .catch(() => {});
  }

  return (
    <footer className="mt-8 flex items-center justify-center pb-6 pt-4">
      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-full border border-[#E7DAC5] bg-[#FFFDF9] px-4 py-2.5 text-xs font-medium text-[#8A7563] shadow-sm transition-colors hover:border-[#E8A317]/40 hover:text-[#201A17]"
      >
        <img
          src="/logo.png"
          alt=""
          className="h-4 w-auto"
          aria-hidden="true"
        />
        <span>
          Powered by{" "}
          <strong className="font-semibold text-[#201A17]">mydscvr Eats</strong>
        </span>
        <span className="text-[#E8A317]">&middot; Create yours free</span>
      </a>
    </footer>
  );
}
