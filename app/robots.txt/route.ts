import { apiClient } from "@/lib/api-client";
import { getAppUrl, getCustomDomainUrl, getRequestHostname, isAppHostname } from "@/lib/domains";

function toRobotsTxt(lines: string[]) {
  return `${lines.join("\n")}\n`;
}

export async function GET(request: Request) {
  const hostname = getRequestHostname(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));

  if (hostname && !isAppHostname(hostname)) {
    const restaurant = await apiClient.getRestaurantByHostname(hostname).catch(() => null);

    if (restaurant) {
      return new Response(
        toRobotsTxt([
          "User-agent: *",
          "Allow: /",
          `Sitemap: ${getCustomDomainUrl(hostname)}/sitemap.xml`,
        ]),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
    }
  }

  return new Response(
    toRobotsTxt([
      "User-agent: *",
      "Allow: /",
      "Disallow: /dashboard",
      "Disallow: /sign-in",
      "Disallow: /sign-up",
      "Disallow: /api/",
      `Sitemap: ${getAppUrl()}/sitemap.xml`,
    ]),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
