import type { RestaurantThemeKey } from "@/types";

export interface RestaurantTheme {
  key: RestaurantThemeKey;
  name: string;
  description: string;
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
    heroOverlayStart: "rgba(16,24,30,0.9)",
    heroOverlayEnd: "rgba(32,78,87,0.55)",
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
];

export function getRestaurantTheme(themeKey?: RestaurantThemeKey | null) {
  return restaurantThemes.find((theme) => theme.key === themeKey) ?? restaurantThemes[0];
}
