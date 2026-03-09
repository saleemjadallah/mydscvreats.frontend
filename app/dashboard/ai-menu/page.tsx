"use client";

import { useRouter } from "next/navigation";
import { AiMenuImportPanel } from "@/components/menu/ai-menu-import-panel";

export default function AiMenuPage() {
  const router = useRouter();

  return (
    <AiMenuImportPanel
      afterSave={() => {
        router.push("/dashboard/menu");
      }}
    />
  );
}
