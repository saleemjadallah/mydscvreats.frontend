export type SubscriptionStatus = "trial" | "active" | "paused" | "cancelled";
export type SubscriptionPlan = "starter" | "pro";
export type AnalyticsTier = "basic" | "advanced";
export type RestaurantThemeKey = "saffron" | "midnight" | "rose" | "noir" | "aegean" | "neon";
export type PromotionType = "discounted_item" | "deal" | "combo";
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

export interface DietaryTag {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  category: string;
}

export interface MenuItemDietaryTag {
  id: string;
  menuItemId: string;
  tagId: string;
  source: string;
  confidence: number | null;
  tag: DietaryTag;
}

export interface MenuItem {
  id: string;
  sectionId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  aiNotes?: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  images?: MenuItemImage[];
  isAvailable: boolean;
  displayOrder: number;
  aiDescriptionStatus?: string | null;
  originalDescription?: string | null;
  dietaryTags?: MenuItemDietaryTag[];
}

export interface MenuSection {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface PromotionMenuItemSummary {
  id: string;
  sectionId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number | string;
  currency: string;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  images?: MenuItemImage[];
  isAvailable: boolean;
  displayOrder: number;
  dietaryTags?: MenuItemDietaryTag[];
}

export interface PromotionItem {
  id: string;
  promotionId: string;
  menuItemId: string;
  role: string;
  displayOrder: number;
  createdAt?: string;
  menuItem: PromotionMenuItemSummary;
}

export interface Promotion {
  id: string;
  restaurantId: string;
  type: PromotionType;
  title: string;
  subtitle: string | null;
  description: string | null;
  badgeLabel: string | null;
  terms: string | null;
  promoPrice: number | string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  items: PromotionItem[];
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
  shortLink?: {
    id: string;
    restaurantId: string;
    code: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  menuSections?: MenuSection[];
  promotions?: Promotion[];
  entitlements?: {
    plan: SubscriptionPlan | null;
    hasSelectedPlan: boolean;
    menuItemLimit: number | null;
    widgetEnabled: boolean;
    menuAssistantEnabled: boolean;
    customDomainEnabled: boolean;
    shortLinksEnabled: boolean;
    analyticsTier: AnalyticsTier;
    imageGenerationPriority: number;
    priorityImageGeneration: boolean;
    aiDescriptionLimit: number | null;
    bulkDescriptionEnabled: boolean;
    aiTagAnalysisLimit: number | null;
    menuAnalysisLevel: "basic" | "full";
    analysisLimit: number | null;
  };
  subscription?: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  } | null;
}

export interface MenuAssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnalyticsSummary {
  tier: AnalyticsTier;
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  shortLink: {
    code: string;
    totalClicks: number;
    clicksToday: number;
    clicksThisWeek: number;
  } | null;
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

export interface TagSuggestion {
  tagKey: string;
  confidence: number;
  reasoning: string;
}

export interface ItemTagSuggestions {
  menuItemId: string;
  tags: TagSuggestion[];
}

export interface AnalysisItem {
  type: "warning" | "suggestion" | "positive";
  message: string;
  menuItemId?: string;
  menuItemName?: string;
}

export interface CategoryAnalysis {
  score: number;
  title: string;
  summary: string;
  items: AnalysisItem[];
}

export interface MenuAnalysisResult {
  overallScore: number;
  categories: {
    pricing: CategoryAnalysis;
    descriptions: CategoryAnalysis;
    structure: CategoryAnalysis;
    gaps: CategoryAnalysis;
    seasonal: CategoryAnalysis;
  };
}
