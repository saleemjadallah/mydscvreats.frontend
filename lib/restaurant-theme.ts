import type { RestaurantThemeKey } from "@/types";

export interface RestaurantTheme {
  key: RestaurantThemeKey;
  name: string;
  description: string;
  isPremium?: boolean;
  accent: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  heroFrom: string;
  heroTo: string;
  heroOverlayStart: string;
  heroOverlayEnd: string;
  pageBackground: string;
  glowA: string;
  glowB: string;
  placeholderFrom: string;
  placeholderTo: string;
  price: string;
  divider: string;
}

export const restaurantThemes: RestaurantTheme[] = [
  {
    key: "saffron",
    name: "Saffron House",
    description: "Warm, premium, and spice-market inspired.",
    accent: "#E8A317",
    accentText: "#7A5211",
    badgeBg: "#F2E2B9",
    badgeText: "#7A5211",
    chipBg: "#F2E7D8",
    chipText: "#201A17",
    chipBorder: "#E6D8C4",
    heroFrom: "#201A17",
    heroTo: "#6D3B22",
    heroOverlayStart: "rgba(32,26,23,0.88)",
    heroOverlayEnd: "rgba(109,59,34,0.58)",
    pageBackground: "#F7F1E8",
    glowA: "rgba(232,163,23,0.24)",
    glowB: "rgba(255,107,90,0.16)",
    placeholderFrom: "rgba(232,163,23,0.42)",
    placeholderTo: "rgba(255,107,90,0.28)",
    price: "#FF6B5A",
    divider: "#E6D8C4",
  },
  {
    key: "midnight",
    name: "Midnight Slate",
    description: "Dark, modern, and dinner-service forward.",
    accent: "#58D3C7",
    accentText: "#0E4742",
    badgeBg: "#D7F5F1",
    badgeText: "#0E4742",
    chipBg: "#DFF4F2",
    chipText: "#10292A",
    chipBorder: "#B9D9D8",
    heroFrom: "#10181E",
    heroTo: "#204E57",
    heroOverlayStart: "rgba(16,24,30,0.92)",
    heroOverlayEnd: "rgba(32,78,87,0.78)",
    pageBackground: "#EEF6F5",
    glowA: "rgba(88,211,199,0.18)",
    glowB: "rgba(25,98,117,0.12)",
    placeholderFrom: "rgba(88,211,199,0.34)",
    placeholderTo: "rgba(32,78,87,0.26)",
    price: "#159987",
    divider: "#C6DBDA",
  },
  {
    key: "rose",
    name: "Rose Terrace",
    description: "Bright, elegant, and cafe-friendly.",
    accent: "#D97D6C",
    accentText: "#6D3328",
    badgeBg: "#F7D9D3",
    badgeText: "#6D3328",
    chipBg: "#FAE5DF",
    chipText: "#3A2622",
    chipBorder: "#E7CCC6",
    heroFrom: "#5D3437",
    heroTo: "#C97A6F",
    heroOverlayStart: "rgba(93,52,55,0.88)",
    heroOverlayEnd: "rgba(201,122,111,0.44)",
    pageBackground: "#FBF2EE",
    glowA: "rgba(217,125,108,0.18)",
    glowB: "rgba(244,198,164,0.16)",
    placeholderFrom: "rgba(217,125,108,0.34)",
    placeholderTo: "rgba(244,198,164,0.28)",
    price: "#C66155",
    divider: "#E7CCC6",
  },
  {
    key: "noir",
    name: "Noir & Gold",
    description: "Luxurious, candlelit, and fine-dining refined.",
    isPremium: true,
    accent: "#C9A84C",
    accentText: "#5C4A1E",
    badgeBg: "#F0E4C3",
    badgeText: "#5C4A1E",
    chipBg: "#F2EDDF",
    chipText: "#1A1714",
    chipBorder: "#DDD5C2",
    heroFrom: "#0D0B09",
    heroTo: "#3D2E1F",
    heroOverlayStart: "rgba(13,11,9,0.93)",
    heroOverlayEnd: "rgba(61,46,31,0.72)",
    pageBackground: "#F5F2EC",
    glowA: "rgba(201,168,76,0.16)",
    glowB: "rgba(61,46,31,0.10)",
    placeholderFrom: "rgba(201,168,76,0.30)",
    placeholderTo: "rgba(61,46,31,0.22)",
    price: "#C9A84C",
    divider: "#DDD5C2",
  },
  {
    key: "aegean",
    name: "Aegean Cove",
    description: "Sun-washed, coastal, and Mediterranean-warm.",
    isPremium: true,
    accent: "#D47B4A",
    accentText: "#6B3518",
    badgeBg: "#F6DCC8",
    badgeText: "#6B3518",
    chipBg: "#E3EEF6",
    chipText: "#14252E",
    chipBorder: "#BDD4E4",
    heroFrom: "#0E2A3D",
    heroTo: "#2A7EA6",
    heroOverlayStart: "rgba(14,42,61,0.90)",
    heroOverlayEnd: "rgba(42,126,166,0.52)",
    pageBackground: "#F2F7FA",
    glowA: "rgba(212,123,74,0.18)",
    glowB: "rgba(42,126,166,0.12)",
    placeholderFrom: "rgba(42,126,166,0.32)",
    placeholderTo: "rgba(212,123,74,0.24)",
    price: "#D47B4A",
    divider: "#C6D8E4",
  },
  {
    key: "neon",
    name: "Neon Dusk",
    description: "Bold, electric, and downtown-rooftop alive.",
    isPremium: true,
    accent: "#B8E636",
    accentText: "#3A4D0F",
    badgeBg: "#E6F5B8",
    badgeText: "#3A4D0F",
    chipBg: "#EDEAF5",
    chipText: "#1A1624",
    chipBorder: "#D2CCE3",
    heroFrom: "#110E22",
    heroTo: "#3B2768",
    heroOverlayStart: "rgba(17,14,34,0.93)",
    heroOverlayEnd: "rgba(59,39,104,0.65)",
    pageBackground: "#F4F2F8",
    glowA: "rgba(184,230,54,0.16)",
    glowB: "rgba(59,39,104,0.12)",
    placeholderFrom: "rgba(184,230,54,0.28)",
    placeholderTo: "rgba(59,39,104,0.24)",
    price: "#9ACC22",
    divider: "#D6D0E4",
  },
];

export const freeThemes = restaurantThemes.filter((t) => !t.isPremium);
export const premiumThemes = restaurantThemes.filter((t) => t.isPremium);

export function isPremiumTheme(themeKey?: RestaurantThemeKey | null): boolean {
  return restaurantThemes.find((t) => t.key === themeKey)?.isPremium ?? false;
}

export function getRestaurantTheme(themeKey?: RestaurantThemeKey | null) {
  return restaurantThemes.find((theme) => theme.key === themeKey) ?? restaurantThemes[0];
}
