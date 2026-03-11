import { getApiUrl } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${getApiUrl()}/api/analytics/page-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to proxy restaurant page view", error);
    return Response.json({ error: "Failed to track page view" }, { status: 500 });
  }
}
