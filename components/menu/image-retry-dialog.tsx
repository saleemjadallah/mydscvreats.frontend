"use client";

import { AlertTriangle, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageRetryDialogProps {
  itemName: string;
  loading: boolean;
  onClose: () => void;
  onRetryPrimary: () => void;
  onRetryFallback: () => void;
}

export function ImageRetryDialog({
  itemName,
  loading,
  onClose,
  onRetryPrimary,
  onRetryFallback,
}: ImageRetryDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-[#E7DAC5] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-[#F1E6D5]">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-[#B8960C]" />
              Image generation paused
            </CardTitle>
            <p className="text-sm text-stone">
              <span className="font-medium text-ink">{itemName}</span> did not generate successfully.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm text-stone">
            Retry with the best-quality model, or use a faster lower-quality model for this
            image only.
          </p>
          <div className="grid gap-3">
            <Button onClick={onRetryPrimary} disabled={loading} className="justify-start">
              <ImagePlus className="h-4 w-4" />
              Try again with best quality
            </Button>
            <Button
              variant="secondary"
              onClick={onRetryFallback}
              disabled={loading}
              className="justify-start"
            >
              <ImagePlus className="h-4 w-4" />
              Use lower quality model
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Try again later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
