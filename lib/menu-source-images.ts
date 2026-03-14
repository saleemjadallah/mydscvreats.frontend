export type RenderedMenuSourcePage = {
  pageNumber: number;
  contentType: "image/jpeg";
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
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
    },
  ];
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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);

    pages.push({
      pageNumber: pageIndex,
      contentType: "image/jpeg",
      dataUrl,
      base64: dataUrlToBase64(dataUrl),
      width: canvas.width,
      height: canvas.height,
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
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to decode rendered menu page"));
    el.src = page.dataUrl;
  });

  const paddingX = bbox.width * 0.04;
  const paddingY = bbox.height * 0.04;
  const x = Math.max(0, bbox.x - paddingX);
  const y = Math.max(0, bbox.y - paddingY);
  const width = Math.min(1 - x, bbox.width + paddingX * 2);
  const height = Math.min(1 - y, bbox.height + paddingY * 2);

  const sx = Math.round(x * page.width);
  const sy = Math.round(y * page.height);
  const sw = Math.max(1, Math.round(width * page.width));
  const sh = Math.max(1, Math.round(height * page.height));

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
