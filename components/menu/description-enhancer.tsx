"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface DescriptionEnhancerProps {
  menuItemId: string;
  currentDescription: string | null;
  onAccept: (description: string) => void;
  disabled?: boolean;
}

export function DescriptionEnhancer({
  menuItemId,
  currentDescription,
  onAccept,
  disabled,
}: DescriptionEnhancerProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number | null } | null>(null);

  async function enhance() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiClient.enhanceDescription(token, menuItemId);
      setSuggestion(result.suggestion);
      setUsage(result.usage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enhance description");
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    if (!suggestion) return;
    try {
      const token = await getToken();
      if (!token) return;
      await apiClient.acceptDescriptions(token, [
        { menuItemId, action: "accept", description: suggestion },
      ]);
      onAccept(suggestion);
      setSuggestion(null);
      toast.success("Description updated");
    } catch (error) {
      toast.error("Failed to save description");
    }
  }

  function edit() {
    if (!suggestion) return;
    onAccept(suggestion);
    setSuggestion(null);
  }

  function discard() {
    setSuggestion(null);
  }

  if (suggestion) {
    return (
      <div className="mt-2 rounded-2xl border border-[#E8C66A]/30 bg-[#FFFBF0] p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#B8960C]">
          <Sparkles className="h-3 w-3" />
          AI suggestion
        </div>
        <p className="mb-3 text-sm text-ink">{suggestion}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={accept} className="h-7 text-xs">
            <Check className="h-3 w-3" />
            Accept
          </Button>
          <Button size="sm" variant="secondary" onClick={edit} className="h-7 text-xs">
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={discard} className="h-7 text-xs">
            <X className="h-3 w-3" />
            Discard
          </Button>
        </div>
        {usage && usage.limit !== null && (
          <p className="mt-2 text-[11px] text-stone">
            {usage.used} of {usage.limit} used this month
          </p>
        )}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={enhance}
      disabled={disabled || loading}
      className="h-7 gap-1 px-2 text-xs text-[#B8960C] hover:bg-[#FFFBF0] hover:text-[#8A7209]"
      title="AI enhance description"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {loading ? "Enhancing..." : "AI"}
    </Button>
  );
}
