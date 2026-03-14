export type RenderedMenuSourcePage = {
  pageNumber: number;
  contentType: "image/jpeg";
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
  textBoxes: NormalizedBbox[];
};

export type NormalizedBbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function dataUrlToBase64(dataUrl: string) {
  const [, base64 = ""] = dataUrl.split(",", 2);
  return base64;
}

async function renderImageFile(file: File): Promise<RenderedMenuSourcePage[]> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to decode image upload"));
    el.src = dataUrl;
  });

  const maxWidth = 1800;
  const scale = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is unavailable");
  }

  ctx.drawImage(image, 0, 0, width, height);
  const renderedDataUrl = canvas.toDataURL("image/jpeg", 0.86);

  return [
    {
      pageNumber: 1,
      contentType: "image/jpeg",
      dataUrl: renderedDataUrl,
      base64: dataUrlToBase64(renderedDataUrl),
      width,
      height,
      textBoxes: [],
    },
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBbox(bbox: NormalizedBbox): NormalizedBbox {
  return {
    x: clamp(bbox.x, 0, 1),
    y: clamp(bbox.y, 0, 1),
    width: clamp(bbox.width, 0.01, 1),
    height: clamp(bbox.height, 0.01, 1),
  };
}

function getIntersectionArea(a: NormalizedBbox, b: NormalizedBbox) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right <= left || bottom <= top) {
    return 0;
  }

  return (right - left) * (bottom - top);
}

function getTextOverlapScore(page: RenderedMenuSourcePage, bbox: NormalizedBbox) {
  if (!page.textBoxes.length) {
    return 0;
  }

  const bboxArea = bbox.width * bbox.height;
  if (bboxArea <= 0) {
    return 0;
  }

  const overlapArea = page.textBoxes.reduce(
    (total, textBox) => total + getIntersectionArea(bbox, textBox),
    0
  );

  return clamp(overlapArea / bboxArea, 0, 1);
}

function getEdgeTextDensity(page: RenderedMenuSourcePage, bbox: NormalizedBbox) {
  const stripSizeX = Math.min(0.08, bbox.width * 0.18);
  const stripSizeY = Math.min(0.08, bbox.height * 0.18);

  const strips = {
    top: { x: bbox.x, y: bbox.y, width: bbox.width, height: stripSizeY },
    bottom: {
      x: bbox.x,
      y: bbox.y + Math.max(0, bbox.height - stripSizeY),
      width: bbox.width,
      height: stripSizeY,
    },
    left: { x: bbox.x, y: bbox.y, width: stripSizeX, height: bbox.height },
    right: {
      x: bbox.x + Math.max(0, bbox.width - stripSizeX),
      y: bbox.y,
      width: stripSizeX,
      height: bbox.height,
    },
  } satisfies Record<string, NormalizedBbox>;

  return Object.fromEntries(
    Object.entries(strips).map(([edge, strip]) => [edge, getTextOverlapScore(page, strip)])
  ) as Record<"top" | "bottom" | "left" | "right", number>;
}

export function adjustDetectedMenuPhotoCrop(
  page: RenderedMenuSourcePage,
  inputBbox: NormalizedBbox
) {
  let bbox = normalizeBbox(inputBbox);
  let overlap = getTextOverlapScore(page, bbox);

  if (!page.textBoxes.length) {
    return {
      bbox,
      textOverlapScore: overlap,
      rejected: false,
    };
  }

  for (let attempt = 0; attempt < 12 && overlap > 0.025; attempt += 1) {
    const edgeDensity = getEdgeTextDensity(page, bbox);
    const rankedEdge = (Object.entries(edgeDensity) as Array<["top" | "bottom" | "left" | "right", number]>)
      .sort((a, b) => b[1] - a[1])[0];

    if (!rankedEdge || rankedEdge[1] <= 0) {
      break;
    }

    const [edge] = rankedEdge;
    const shrinkX = Math.min(0.03, bbox.width * 0.12);
    const shrinkY = Math.min(0.03, bbox.height * 0.12);

    if (edge === "bottom" && bbox.height - shrinkY >= 0.12) {
      bbox = { ...bbox, height: bbox.height - shrinkY };
    } else if (edge === "top" && bbox.height - shrinkY >= 0.12) {
      bbox = { ...bbox, y: bbox.y + shrinkY, height: bbox.height - shrinkY };
    } else if (edge === "left" && bbox.width - shrinkX >= 0.12) {
      bbox = { ...bbox, x: bbox.x + shrinkX, width: bbox.width - shrinkX };
    } else if (edge === "right" && bbox.width - shrinkX >= 0.12) {
      bbox = { ...bbox, width: bbox.width - shrinkX };
    } else {
      break;
    }

    bbox = normalizeBbox(bbox);
    overlap = getTextOverlapScore(page, bbox);
  }

  return {
    bbox,
    textOverlapScore: overlap,
    rejected: overlap > 0.12,
  };
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to decode rendered menu page"));
    el.src = source;
  });
}

function cropLoadedImage(
  image: HTMLImageElement,
  widthPx: number,
  heightPx: number,
  bbox: NormalizedBbox
) {
  const paddingX = bbox.width * 0.04;
  const paddingY = bbox.height * 0.04;
  const x = Math.max(0, bbox.x - paddingX);
  const y = Math.max(0, bbox.y - paddingY);
  const width = Math.min(1 - x, bbox.width + paddingX * 2);
  const height = Math.min(1 - y, bbox.height + paddingY * 2);

  const sx = Math.round(x * widthPx);
  const sy = Math.round(y * heightPx);
  const sw = Math.max(1, Math.round(width * widthPx));
  const sh = Math.max(1, Math.round(height * heightPx));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is unavailable");
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

  return {
    contentType: "image/jpeg" as const,
    dataUrl,
    base64: dataUrlToBase64(dataUrl),
    width: sw,
    height: sh,
  };
}

function extractPdfTextBoxes(
  textContent: Awaited<ReturnType<any["getTextContent"]>>,
  viewport: { convertToViewportRectangle: (rect: [number, number, number, number]) => number[] }
) {
  return (textContent.items as Array<any>)
    .flatMap((item) => {
      if (!("str" in item) || typeof item.str !== "string" || !item.str.trim()) {
        return [];
      }

      const rect = viewport.convertToViewportRectangle([
        item.transform[4],
        item.transform[5],
        item.transform[4] + item.width,
        item.transform[5] + item.height,
      ] as [number, number, number, number]);

      const left = Math.min(rect[0], rect[2]);
      const right = Math.max(rect[0], rect[2]);
      const top = Math.min(rect[1], rect[3]);
      const bottom = Math.max(rect[1], rect[3]);

      return [
        {
          x: left,
          y: top,
          width: right - left,
          height: bottom - top,
        },
      ];
    })
    .filter((bbox) => bbox.width > 1 && bbox.height > 1);
}

async function renderPdfFile(file: File): Promise<RenderedMenuSourcePage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfDocument = await pdfjs.getDocument({ data: bytes }).promise;
  const pageCount = Math.min(pdfDocument.numPages, 8);
  const pages: RenderedMenuSourcePage[] = [];

  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Canvas is unavailable");
    }

    await page.render({ canvas, canvasContext: ctx, viewport } as never).promise;
    const textContent = await page.getTextContent();
    const rawTextBoxes = extractPdfTextBoxes(textContent, viewport as never);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);

    pages.push({
      pageNumber: pageIndex,
      contentType: "image/jpeg",
      dataUrl,
      base64: dataUrlToBase64(dataUrl),
      width: canvas.width,
      height: canvas.height,
      textBoxes: rawTextBoxes.map((bbox) =>
        normalizeBbox({
          x: bbox.x / canvas.width,
          y: bbox.y / canvas.height,
          width: bbox.width / canvas.width,
          height: bbox.height / canvas.height,
        })
      ),
    });
  }

  return pages;
}

export async function renderMenuSourcePages(file: File) {
  if (file.type === "application/pdf") {
    return renderPdfFile(file);
  }

  if (file.type.startsWith("image/")) {
    return renderImageFile(file);
  }

  throw new Error("Only PDF and image files are supported for menu source rendering.");
}

export async function cropRenderedMenuSourcePage(
  page: RenderedMenuSourcePage,
  bbox: NormalizedBbox
) {
  const image = await loadImage(page.dataUrl);
  return cropLoadedImage(image, page.width, page.height, bbox);
}

export async function cropSourceImageUrl(
  sourceImageUrl: string,
  bbox: NormalizedBbox
) {
  const image = await loadImage(sourceImageUrl);
  return cropLoadedImage(image, image.naturalWidth, image.naturalHeight, bbox);
}
