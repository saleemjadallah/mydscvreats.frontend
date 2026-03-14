import type {
  AnalyticsSummary,
  BadgeType,
  DietaryTag,
  GbpConnection,
  ItemTagSuggestions,
  MenuAnalysisResult,
  MenuAssistantMessage,
  MenuExtractionDraft,
  MenuItemBadge,
  MenuItemImage,
  MenuSection,
  Promotion,
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
  chatWithMenuAI(
    restaurantId: string,
    message: string,
    history: MenuAssistantMessage[]
  ) {
    return request<{ reply: string }>(`/api/chat/${restaurantId}`, {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },
  getImageStatuses(token: string, restaurantId: string) {
    return request<{
      id: string;
      imageStatus: string;
      imageUrl: string | null;
      images: MenuItemImage[];
    }[]>(
      `/api/menu/${restaurantId}/image-statuses`,
      { token }
    );
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
  createPromotion(token: string, payload: Record<string, unknown>) {
    return request<Promotion>("/api/menu/promotions", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updatePromotion(token: string, promotionId: string, payload: Record<string, unknown>) {
    return request<Promotion>(`/api/menu/promotions/${promotionId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  deletePromotion(token: string, promotionId: string) {
    return request<void>(`/api/menu/promotions/${promotionId}`, {
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
  previewMenu(payload: {
    sourceText?: string;
    fileName?: string;
    contentType?: string;
    base64?: string;
  }) {
    return request<MenuExtractionDraft>("/api/preview/extract", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  queueImageGeneration(
    token: string,
    menuItemId: string,
    options?: {
      promptModifier?: string;
      allowFallback?: boolean;
      replaceImageId?: string;
    }
  ) {
    return request<{ queued: boolean; imageId: string }>("/api/menu/generate-image", {
      method: "POST",
      token,
      body: JSON.stringify({
        menuItemId,
        promptModifier: options?.promptModifier,
        allowFallback: options?.allowFallback,
        replaceImageId: options?.replaceImageId,
      }),
    });
  },
  selectMenuItemImage(token: string, itemId: string, imageId: string) {
    return request<{ ok: boolean }>(`/api/menu/items/${itemId}/images/${imageId}/select`, {
      method: "POST",
      token,
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
  generateShortLink(token: string, restaurantId: string) {
    return request<NonNullable<Restaurant["shortLink"]>>(
      `/api/short-links/${restaurantId}/generate`,
      {
        method: "POST",
        token,
      }
    );
  },
  deleteShortLink(token: string, restaurantId: string) {
    return request<void>(`/api/short-links/${restaurantId}`, {
      method: "DELETE",
      token,
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
  trackBrandingClick(payload: {
    restaurantId: string;
    path?: string;
    referrer?: string | null;
    userAgent?: string | null;
  }) {
    return request<{ ok: boolean }>("/api/analytics/branding-click", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  trackMenuItemLike(payload: {
    restaurantId: string;
    menuItemId: string;
    path: string;
    userAgent?: string | null;
    referrer?: string | null;
  }) {
    return request<{ ok: boolean }>("/api/analytics/menu-item-like", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ── AI Description Writer ──────────────────────────────────
  enhanceDescription(token: string, menuItemId: string, tone?: string) {
    return request<{
      suggestion: string;
      originalDescription: string | null;
      usage: { used: number; limit: number | null };
    }>("/api/ai/enhance-description", {
      method: "POST",
      token,
      body: JSON.stringify({ menuItemId, tone }),
    });
  },
  enhanceDescriptionsBulk(
    token: string,
    payload: { restaurantId: string; mode: "missing" | "weak" | "all"; tone?: string }
  ) {
    return request<{
      suggestions: Record<string, string>;
      count: number;
    }>("/api/ai/enhance-descriptions-bulk", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  suggestPromotionContent(
    token: string,
    payload: {
      restaurantId: string;
      type: "discounted_item" | "deal" | "combo";
      itemIds: string[];
      title?: string | null;
      subtitle?: string | null;
      description?: string | null;
      badgeLabel?: string | null;
      terms?: string | null;
      promoPrice?: string | null;
      startsAt?: string | null;
      endsAt?: string | null;
      tone?: string;
    }
  ) {
    return request<{
      suggestion: {
        title: string;
        subtitle: string;
        description: string;
        badgeLabel: string;
        terms: string;
      };
      usage: { used: number; limit: number | null };
    }>("/api/ai/suggest-promotion-content", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  acceptDescriptions(
    token: string,
    actions: Array<{ menuItemId: string; action: "accept" | "reject"; description?: string }>
  ) {
    return request<{ ok: boolean }>("/api/ai/accept-descriptions", {
      method: "POST",
      token,
      body: JSON.stringify({ actions }),
    });
  },

  // ── Menu Badges ──────────────────────────────────────────
  getBadgeTypes() {
    return request<BadgeType[]>("/api/menu-badges");
  },
  setItemBadges(
    token: string,
    itemId: string,
    badges: Array<{ badgeId: string }>
  ) {
    return request<MenuItemBadge[]>("/api/menu-badges/items/" + itemId + "/badges", {
      method: "POST",
      token,
      body: JSON.stringify({ badges }),
    });
  },

  // ── Dietary Tags ───────────────────────────────────────────
  getDietaryTags() {
    return request<DietaryTag[]>("/api/dietary-tags");
  },
  suggestTags(token: string, restaurantId: string) {
    return request<{
      suggestions: ItemTagSuggestions[];
      usage: { used: number; limit: number | null };
    }>("/api/ai/suggest-tags", {
      method: "POST",
      token,
      body: JSON.stringify({ restaurantId }),
    });
  },
  setItemTags(
    token: string,
    itemId: string,
    tags: Array<{ tagId: string; source?: string; confidence?: number }>
  ) {
    return request("/api/dietary-tags/items/" + itemId + "/tags", {
      method: "POST",
      token,
      body: JSON.stringify({ tags }),
    });
  },
  confirmTagsBulk(
    token: string,
    actions: Array<{ menuItemId: string; tagId: string; action: "confirm" | "reject" }>
  ) {
    return request<{ ok: boolean }>("/api/ai/confirm-tags-bulk", {
      method: "POST",
      token,
      body: JSON.stringify({ actions }),
    });
  },

  // ── Menu Analysis ─────────────────────────────────────────
  analyzeMenu(token: string, restaurantId: string) {
    return request<{
      analysis: MenuAnalysisResult;
      cached: boolean;
      usage: { used: number; limit: number | null };
      level: "basic" | "full";
    }>("/api/ai/analyze-menu", {
      method: "POST",
      token,
      body: JSON.stringify({ restaurantId }),
    });
  },
  getMenuAnalysis(token: string, restaurantId: string) {
    return request<{
      analysis: MenuAnalysisResult | null;
      cached?: boolean;
      createdAt?: string;
      level: "basic" | "full";
    }>("/api/ai/analyze-menu/" + restaurantId, {
      token,
    });
  },

  // ── Google Business Profile ─────────────────────────────────
  getGbpConnection(token: string, restaurantId: string) {
    return request<GbpConnection | null>(`/api/gbp/${restaurantId}`, {
      token,
    });
  },
  connectGbp(token: string, restaurantId: string, payload?: { gbpUrl?: string }) {
    return request<GbpConnection>(`/api/gbp/${restaurantId}/connect`, {
      method: "POST",
      token,
      body: JSON.stringify(payload ?? {}),
    });
  },
  disconnectGbp(token: string, restaurantId: string) {
    return request<{ ok: boolean }>(`/api/gbp/${restaurantId}`, {
      method: "DELETE",
      token,
    });
  },
};

export function getApiUrl() {
  return API_URL;
}
