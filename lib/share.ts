export function getAppUrl(windowOrigin?: string) {
  return (process.env.NEXT_PUBLIC_APP_URL ?? windowOrigin ?? "https://mydscvr.ai").replace(
    /\/$/,
    ""
  );
}

export function getRestaurantPublicUrl(slug: string, windowOrigin?: string) {
  return `${getAppUrl(windowOrigin)}/${slug}`;
}

export function getRestaurantEmbedUrl(slug: string, windowOrigin?: string) {
  return `${getAppUrl(windowOrigin)}/embed/${slug}`;
}

export function getRestaurantShortUrl(code: string, windowOrigin?: string) {
  return `${getAppUrl(windowOrigin)}/r/${code}`;
}

export function getRestaurantWidgetSnippet(slug: string, windowOrigin?: string) {
  const appUrl = getAppUrl(windowOrigin);
  const embedUrl = getRestaurantEmbedUrl(slug, windowOrigin);

  return [
    `<iframe`,
    `  src="${embedUrl}"`,
    `  title="Restaurant menu by mydscvr Eats"`,
    `  loading="lazy"`,
    `  scrolling="no"`,
    `  referrerpolicy="strict-origin-when-cross-origin"`,
    `  style="width:100%;min-height:480px;border:0;border-radius:24px;overflow:hidden;display:block;background:transparent"`,
    `></iframe>`,
    `<script>`,
    `(function () {`,
    `  var iframe = document.currentScript && document.currentScript.previousElementSibling;`,
    `  if (!iframe) return;`,
    `  function handleMessage(event) {`,
    `    if (event.origin !== "${appUrl}") return;`,
    `    if (event.source !== iframe.contentWindow) return;`,
    `    var data = event.data;`,
    `    if (!data || data.type !== "mydscvr-eats:resize" || typeof data.height !== "number") return;`,
    `    iframe.style.height = Math.max(480, Math.ceil(data.height)) + "px";`,
    `  }`,
    `  window.addEventListener("message", handleMessage);`,
    `})();`,
    `</script>`,
  ].join("\n");
}

export function getRestaurantQrCodeUrl(publicUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}`;
}
