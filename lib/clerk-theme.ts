import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#E8A317",
    colorDanger: "#C53B2F",
    colorBackground: "#F7F1E8",
    colorInputBackground: "#FFFDF9",
    colorInputText: "#201A17",
    colorText: "#201A17",
    colorTextSecondary: "#6B5A4C",
    borderRadius: "1rem",
    fontFamily:
      'Inter, "IBM Plex Sans Arabic", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: "rounded-[28px] border border-[#E7DAC5] shadow-card",
    formButtonPrimary:
      "rounded-full bg-[#201A17] text-white hover:bg-[#E8A317] hover:text-[#201A17] transition-colors",
    socialButtonsBlockButton:
      "rounded-full border border-[#D8C5AD] bg-white hover:bg-[#FFF6E4]",
    footerActionLink: "text-[#C53B2F] hover:text-[#9C2F26]",
    formFieldInput:
      "rounded-2xl border border-[#D8C5AD] bg-[#FFFDF9] focus:border-[#E8A317] focus:ring-[#E8A317]/20",
  },
};
