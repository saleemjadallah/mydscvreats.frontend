import type { ImageDerivationType, ImageOriginType, MenuItemImage } from "@/types";

function getOriginLabel(originType: ImageOriginType) {
  switch (originType) {
    case "mydscvr_ai":
      return "MyDscvr AI";
    case "owner_upload":
      return "Owner photo";
    case "menu_source_upload":
      return "Menu upload";
    default:
      return "Legacy image";
  }
}

function getDerivationLabel(derivationType: ImageDerivationType) {
  switch (derivationType) {
    case "truth_preserving_edit":
      return "AI-enhanced";
    case "synthetic_generation":
      return "AI-generated";
    default:
      return null;
  }
}

export function getMenuImageSourceLabel(image: Pick<MenuItemImage, "originType" | "derivationType">) {
  const originLabel = getOriginLabel(image.originType);
  const derivationLabel = getDerivationLabel(image.derivationType);

  if (!derivationLabel || image.derivationType === "original") {
    return originLabel;
  }

  if (image.originType === "mydscvr_ai" && image.derivationType === "synthetic_generation") {
    return "MyDscvr AI-generated";
  }

  return `${derivationLabel} from ${originLabel.toLowerCase()}`;
}

export function getMenuImageSourceTone(image: Pick<MenuItemImage, "originType" | "derivationType">) {
  if (image.originType === "mydscvr_ai") {
    return "ai";
  }

  if (image.derivationType === "truth_preserving_edit") {
    return "enhanced";
  }

  if (image.originType === "owner_upload" || image.originType === "menu_source_upload") {
    return "owned";
  }

  return "legacy";
}
