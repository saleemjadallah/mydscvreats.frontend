import { Badge } from "@/components/ui/badge";
import type { ImageStatus } from "@/types";

export function ImageStatusBadge({ status }: { status: ImageStatus }) {
  const variant =
    status === "generated" || status === "uploaded"
      ? "success"
      : status === "failed"
        ? "accent"
        : "muted";

  const dotColor =
    status === "generated" || status === "uploaded"
      ? "bg-[#2E8B57]"
      : status === "failed"
        ? "bg-coral"
        : status === "generating"
          ? "bg-saffron animate-pulse"
          : "bg-stone";

  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </Badge>
  );
}
