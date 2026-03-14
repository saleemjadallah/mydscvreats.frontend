export type SubscriptionStatus = "trial" | "active" | "paused" | "cancelled";
export type SubscriptionPlan = "starter" | "pro";
export type AnalyticsTier = "basic" | "advanced";
export type RestaurantThemeKey = "saffron" | "midnight" | "rose" | "noir" | "aegean" | "neon";
export type GbpConnectionStatus = "not_connected" | "self_reported" | "verified";
export type PromotionType = "discounted_item" | "deal" | "combo";
export type ImageStatus =
  | "none"
  | "generating"
  | "generated"
  | "uploaded"
  | "failed";
export type ImageOriginType =
  | "legacy_unspecified"
  | "mydscvr_ai"
  | "owner_upload"
  | "menu_source_upload";
export type ImageDerivationType =
  | "original"
  | "truth_preserving_edit"
  | "synthetic_generation";

export interface TimePeriod {
  open: string;   // "09:00" HH:mm 24h
  close: string;  // "23:00" HH:mm 24h
}

export interface DaySchedule {
  dayOfWeek: number;   // 0=Sunday ... 6=Saturday
  isClosed: boolean;
  periods: TimePeriod[];
}

export interface OperatingHoursConfig {
  timezone: string;          // IANA e.g. "Asia/Dubai"
  schedule: DaySchedule[];   // exactly 7 entries
}

export interface MenuItemImage {
  id: string;
  slot: number;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  promptModifier: string | null;
  isPrimary: boolean;
  originType: ImageOriginType;
  derivationType: ImageDerivationType;
  parentImageId: string | null;
}

export interface DetectedMenuSourceImage {
  itemId: string;
  pageNumber: number;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  note?: string;
}

export type MenuSourceImageReviewStatus = "pending" | "confirmed" | "dismissed";

export interface MenuSourceImageCandidate {
  id: string;
  restaurantId: string;
  imageUrl: string;
  sourcePageImageUrl: string | null;
  sourcePageNumber: number;
  cropX: number | null;
  cropY: number | null;
  cropWidth: number | null;
  cropHeight: number | null;
  textOverlapScore: number | null;
  confidence: number;
  note: string | null;
  reviewStatus: MenuSourceImageReviewStatus;
  suggestedMenuItemId: string | null;
  assignedMenuItemId: string | null;
  linkedImageId: string | null;
  createdAt: string;
  updatedAt: string;
  suggestedMenuItem?: {
    id: string;
    name: string;
  } | null;
  assignedMenuItem?: {
    id: string;
    name: string;
  } | null;
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

export interface BadgeType {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  color: string;
  textColor: string;
  category: string;
  displayOrder: number;
}

export interface MenuItemBadge {
  id: string;
  menuItemId: string;
  badgeId: string;
  badge: BadgeType;
}

export interface GbpConnection {
  id: string;
  restaurantId: string;
  status: GbpConnectionStatus;
  gbpUrl: string | null;
  placeId: string | null;
  verifiedAt: string | null;
  connectedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  badges?: MenuItemBadge[];
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
  badges?: MenuItemBadge[];
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
  whatsappNumber: string | null;
  whatsappPrefill: string | null;
  operatingHours?: OperatingHoursConfig | null;
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
  pendingMenuSourceImageReviewCount?: number;
  menuSections?: MenuSection[];
  promotions?: Promotion[];
  gbpConnection?: GbpConnection | null;
  entitlements?: {
    plan: SubscriptionPlan | null;
    hasSelectedPlan: boolean;
    menuItemLimit: number | null;
    sourcePhotoImportEnabled: boolean;
    sourcePhotoReviewEnabled: boolean;
    widgetEnabled: boolean;
    menuAssistantEnabled: boolean;
    customDomainEnabled: boolean;
    shortLinksEnabled: boolean;
    hideBranding: boolean;
    analyticsTier: AnalyticsTier;
    imageGenerationPriority: number;
    priorityImageGeneration: boolean;
    imageEnhancementLimit: number | null;
    batchImageEnhancementEnabled: boolean;
    advancedPhotoStylingEnabled: boolean;
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
  likes: {
    total: number;
    today: number;
    thisWeek: number;
    topItems: Array<{
      menuItemId: string;
      name: string;
      likes: number;
    }>;
  };
  whatsapp: {
    totalClicks: number;
    clicksToday: number;
    clicksThisWeek: number;
  } | null;
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
  branding: {
    totalClicks: number;
    clicksThisWeek: number;
  };
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

export interface ImageEnhancementUsage {
  allowed: boolean;
  usage: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  capabilities: {
    importOwnPhotos: boolean;
    reviewImportedPhotos: boolean;
    batchEnhancement: boolean;
    advancedStyling: boolean;
  };
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
