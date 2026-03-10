export type SubscriptionStatus = "trial" | "active" | "paused" | "cancelled";
export type SubscriptionPlan = "starter" | "pro";
export type AnalyticsTier = "basic" | "advanced";
export type RestaurantThemeKey = "saffron" | "midnight" | "rose";
export type ImageStatus =
  | "none"
  | "generating"
  | "generated"
  | "uploaded"
  | "failed";

export interface MenuItemImage {
  id: string;
  slot: number;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  promptModifier: string | null;
  isPrimary: boolean;
}

export interface MenuItem {
  id: string;
  sectionId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  images?: MenuItemImage[];
  isAvailable: boolean;
  displayOrder: number;
}

export interface MenuSection {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string | null;
  themeKey: RestaurantThemeKey | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  menuSections?: MenuSection[];
  entitlements?: {
    plan: SubscriptionPlan;
    menuItemLimit: number | null;
    widgetEnabled: boolean;
    customDomainEnabled: boolean;
    analyticsTier: AnalyticsTier;
    imageGenerationPriority: number;
    priorityImageGeneration: boolean;
  };
  subscription?: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    stripeCustomerId?: string | null;
  } | null;
}

export interface AnalyticsSummary {
  tier: AnalyticsTier;
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  topPaths: Array<{
    path: string;
    views: number;
  }>;
}

export interface MenuExtractionDraft {
  sections: Array<{
    name: string;
    items: Array<{
      name: string;
      description: string | null;
      price: number;
    }>;
  }>;
}
