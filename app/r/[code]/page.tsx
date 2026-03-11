import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

export default async function ShortLinkRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const requestHeaders = await headers();
  const response = await fetch(
    `${API_URL}/api/short-links/resolve/${encodeURIComponent(code)}`,
    {
      cache: "no-store",
      headers: {
        "x-forwarded-user-agent": requestHeaders.get("user-agent") ?? "",
        "x-forwarded-referrer":
          requestHeaders.get("referer") ??
          requestHeaders.get("referrer") ??
          "",
      },
    }
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Unable to resolve short link");
  }

  const payload = (await response.json()) as { slug?: string };

  if (!payload.slug) {
    notFound();
  }

  redirect(`/${payload.slug}`);
}
