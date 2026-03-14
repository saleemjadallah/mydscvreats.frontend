import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/sign-in", "/sign-up", "/api/", "/embed/", "/preview/", "/r/"],
      },
    ],
    sitemap: "https://mydscvr.ai/sitemap.xml",
  };
}
