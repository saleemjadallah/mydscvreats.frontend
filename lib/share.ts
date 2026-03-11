export function getAppUrl(windowOrigin?: string) {
  return (process.env.NEXT_PUBLIC_APP_URL ?? windowOrigin ?? "https://mydscvr.ai").replace(
    /\/$/,
    ""
  );
}

export function getRestaurantPublicUrl(slug: string, windowOrigin?: string) {
  return `${getAppUrl(windowOrigin)}/${slug}`;
}

export function getRestaurantWidgetSnippet(slug: string, windowOrigin?: string) {
  const publicUrl = getRestaurantPublicUrl(slug, windowOrigin);

  return `<iframe src="${publicUrl}?embed=1" width="100%" height="760" style="border:0;border-radius:24px;overflow:hidden" loading="lazy"></iframe>`;
}

export function getRestaurantQrCodeUrl(publicUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}`;
}
