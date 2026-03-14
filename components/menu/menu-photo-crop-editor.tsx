"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type CropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragMode = "move" | "nw" | "ne" | "sw" | "se";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCrop(crop: CropBox): CropBox {
  const minSize = 0.12;
  const width = clamp(crop.width, minSize, 1);
  const height = clamp(crop.height, minSize, 1);
  const x = clamp(crop.x, 0, 1 - width);
  const y = clamp(crop.y, 0, 1 - height);

  return { x, y, width, height };
}

export function MenuPhotoCropEditor({
  sourceImageUrl,
  initialCrop,
  saving,
  onCancel,
  onSave,
}: {
  sourceImageUrl: string;
  initialCrop: CropBox;
  saving?: boolean;
  onCancel: () => void;
  onSave: (crop: CropBox) => Promise<void> | void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [crop, setCrop] = useState<CropBox>(normalizeCrop(initialCrop));
  const [dragState, setDragState] = useState<{
    mode: DragMode;
    startX: number;
    startY: number;
    crop: CropBox;
  } | null>(null);

  useEffect(() => {
    setCrop(normalizeCrop(initialCrop));
  }, [initialCrop.height, initialCrop.width, initialCrop.x, initialCrop.y]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;

    function handlePointerMove(event: PointerEvent) {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const nextX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const nextY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const deltaX = nextX - currentDrag.startX;
      const deltaY = nextY - currentDrag.startY;
      const minSize = 0.12;
      const start = currentDrag.crop;

      if (currentDrag.mode === "move") {
        setCrop(
          normalizeCrop({
            ...start,
            x: start.x + deltaX,
            y: start.y + deltaY,
          })
        );
        return;
      }

      let candidate = { ...start };

      if (currentDrag.mode === "nw") {
        const nextLeft = clamp(start.x + deltaX, 0, start.x + start.width - minSize);
        const nextTop = clamp(start.y + deltaY, 0, start.y + start.height - minSize);
        candidate = {
          x: nextLeft,
          y: nextTop,
          width: start.width + (start.x - nextLeft),
          height: start.height + (start.y - nextTop),
        };
      } else if (currentDrag.mode === "ne") {
        const nextRight = clamp(
          start.x + start.width + deltaX,
          start.x + minSize,
          1
        );
        const nextTop = clamp(start.y + deltaY, 0, start.y + start.height - minSize);
        candidate = {
          x: start.x,
          y: nextTop,
          width: nextRight - start.x,
          height: start.height + (start.y - nextTop),
        };
      } else if (currentDrag.mode === "sw") {
        const nextLeft = clamp(start.x + deltaX, 0, start.x + start.width - minSize);
        const nextBottom = clamp(
          start.y + start.height + deltaY,
          start.y + minSize,
          1
        );
        candidate = {
          x: nextLeft,
          y: start.y,
          width: start.width + (start.x - nextLeft),
          height: nextBottom - start.y,
        };
      } else if (currentDrag.mode === "se") {
        const nextRight = clamp(
          start.x + start.width + deltaX,
          start.x + minSize,
          1
        );
        const nextBottom = clamp(
          start.y + start.height + deltaY,
          start.y + minSize,
          1
        );
        candidate = {
          x: start.x,
          y: start.y,
          width: nextRight - start.x,
          height: nextBottom - start.y,
        };
      }

      setCrop(normalizeCrop(candidate));
    }

    function handlePointerUp() {
      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState]);

  function startDrag(mode: DragMode, event: React.PointerEvent) {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    setDragState({
      mode,
      startX: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      startY: clamp((event.clientY - rect.top) / rect.height, 0, 1),
      crop,
    });
  }

  return (
    <div className="space-y-4 rounded-[24px] border border-[#E7DAC5] bg-[#FFFDF9] p-4">
      <div>
        <div className="text-sm font-semibold text-ink">Adjust crop before confirming</div>
        <p className="mt-1 text-sm text-stone">
          Drag the crop box or its corners so only the real dish photo remains.
        </p>
      </div>

      <div ref={containerRef} className="relative overflow-hidden rounded-[20px] border border-[#E7DAC5] bg-[#F7F1E8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sourceImageUrl} alt="Source menu page" className="block h-auto w-full select-none" />

        <div className="pointer-events-none absolute inset-0 bg-black/35" />
        <div
          className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]"
          style={{
            left: `${crop.x * 100}%`,
            top: `${crop.y * 100}%`,
            width: `${crop.width * 100}%`,
            height: `${crop.height * 100}%`,
          }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-move"
            onPointerDown={(event) => startDrag("move", event)}
            aria-label="Move crop"
          />
          {([
            ["nw", "left-0 top-0 cursor-nwse-resize"],
            ["ne", "right-0 top-0 cursor-nesw-resize"],
            ["sw", "bottom-0 left-0 cursor-nesw-resize"],
            ["se", "bottom-0 right-0 cursor-nwse-resize"],
          ] as const).map(([mode, position]) => (
            <button
              key={mode}
              type="button"
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-white ${position}`}
              onPointerDown={(event) => startDrag(mode, event)}
              aria-label={`Resize crop ${mode}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCrop(normalizeCrop(initialCrop))}
          disabled={saving}
        >
          Reset
        </Button>
        <Button onClick={() => void onSave(crop)} disabled={saving}>
          {saving ? "Saving crop..." : "Save crop"}
        </Button>
      </div>
    </div>
  );
}
