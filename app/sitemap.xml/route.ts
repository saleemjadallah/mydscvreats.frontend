import { apiClient } from "@/lib/api-client";
import { getAppUrl, getCustomDomainUrl, getRequestHostname, getRestaurantPublicUrl, isAppHostname } from "@/lib/domains";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap(entries: Array<{ loc: string; lastmod?: string }>) {
  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export async function GET(request: Request) {
  const hostname = getRequestHostname(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));

  if (hostname && !isAppHostname(hostname)) {
    const restaurant = await apiClient.getRestaurantByHostname(hostname).catch(() => null);

    if (restaurant) {
      return new Response(
        renderSitemap([
          {
            loc: getCustomDomainUrl(hostname),
            lastmod: restaurant.updatedAt,
          },
        ]),
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }
      );
    }
  }

  const restaurants = await apiClient.listRestaurants().catch(() => []);
  const entries = [
    {
      loc: getAppUrl(),
    },
    {
      loc: `${getAppUrl()}/explore`,
    },
    ...restaurants
      .filter((restaurant) => restaurant.isPublished)
      .map((restaurant) => ({
        loc: getRestaurantPublicUrl(restaurant),
        lastmod: restaurant.updatedAt,
      })),
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
