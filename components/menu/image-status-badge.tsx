import { Badge } from "@/components/ui/badge";
import type { ImageStatus } from "@/types";

export function ImageStatusBadge({ status }: { status: ImageStatus }) {
  const variant =
    status === "generated" || status === "uploaded"
      ? "success"
      : status === "failed"
        ? "accent"
        : "muted";

  return <Badge variant={variant}>{status}</Badge>;
}
