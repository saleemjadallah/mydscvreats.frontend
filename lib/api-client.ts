import type {
  AnalyticsSummary,
  MenuExtractionDraft,
  MenuSection,
  Restaurant,
} from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

type FetchOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Request failed");
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  getCurrentRestaurant(token: string) {
    return request<{ restaurant: Restaurant | null }>("/api/restaurants/me", {
      token,
    });
  },
  createRestaurant(token: string, payload: Partial<Restaurant> & { name: string }) {
    return request<Restaurant>("/api/restaurants", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updateRestaurant(token: string, restaurantId: string, payload: Partial<Restaurant>) {
    return request<Restaurant>(`/api/restaurants/${restaurantId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  getRestaurantBySlug(slug: string) {
    return request<Restaurant>(`/api/restaurants/${slug}`);
  },
  listRestaurants(cuisine?: string) {
    const search = cuisine ? `?cuisine=${encodeURIComponent(cuisine)}` : "";
    return request<Restaurant[]>(`/api/restaurants${search}`);
  },
  getMenu(restaurantId: string) {
    return request<MenuSection[]>(`/api/menu/${restaurantId}`);
  },
  createSection(token: string, payload: {
    restaurantId: string;
    name: string;
    displayOrder?: number;
  }) {
    return request<MenuSection>("/api/menu/sections", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updateSection(token: string, sectionId: string, payload: Partial<MenuSection>) {
    return request<MenuSection>(`/api/menu/sections/${sectionId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  deleteSection(token: string, sectionId: string) {
    return request<void>(`/api/menu/sections/${sectionId}`, {
      method: "DELETE",
      token,
    });
  },
  createItem(token: string, payload: Record<string, unknown>) {
    return request("/api/menu/items", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updateItem(token: string, itemId: string, payload: Record<string, unknown>) {
    return request(`/api/menu/items/${itemId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  deleteItem(token: string, itemId: string) {
    return request<void>(`/api/menu/items/${itemId}`, {
      method: "DELETE",
      token,
    });
  },
  reorderMenu(token: string, payload: Record<string, unknown>) {
    return request<{ ok: boolean }>("/api/menu/reorder", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  importMenu(token: string, payload: {
    restaurantId: string;
    sections: MenuExtractionDraft["sections"];
  }) {
    return request<MenuSection[]>("/api/menu/import", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  extractMenu(token: string, payload: {
    restaurantId: string;
    sourceText?: string;
    fileName?: string;
    contentType?: string;
    base64?: string;
  }) {
    return request<MenuExtractionDraft>("/api/menu/extract", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  queueImageGeneration(token: string, menuItemId: string) {
    return request<{ queued: boolean }>("/api/menu/generate-image", {
      method: "POST",
      token,
      body: JSON.stringify({ menuItemId }),
    });
  },
  upload(token: string, payload: {
    filename: string;
    contentType: string;
    base64: string;
    folder?: string;
  }) {
    return request<{ key: string; url: string }>("/api/upload", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  createCheckout(token: string, payload: {
    restaurantId: string;
    plan: "starter" | "pro";
    successUrl: string;
    cancelUrl: string;
  }) {
    return request<{ checkoutUrl: string | null }>("/api/subscriptions/create", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  createBillingPortal(token: string, payload: { restaurantId: string; returnUrl: string }) {
    return request<{ url: string }>("/api/subscriptions/portal", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  getAnalytics(token: string, restaurantId: string) {
    return request<AnalyticsSummary>(`/api/analytics/${restaurantId}`, {
      token,
    });
  },
  trackPageView(payload: {
    restaurantId: string;
    path: string;
    userAgent?: string | null;
    referrer?: string | null;
  }) {
    return request<{ ok: boolean }>("/api/analytics/page-view", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function getApiUrl() {
  return API_URL;
}
