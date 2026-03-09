import type { MenuExtractionDraft, MenuSection } from "@/types";

export interface MenuAuditIssue {
  id: string;
  label: string;
  description: string;
  count: number;
}

export interface MenuAuditSummary {
  totalSections: number;
  totalItems: number;
  imagesReady: number;
  itemsWithoutImages: number;
  failedImages: number;
  missingPrices: number;
  missingDescriptions: number;
  emptySections: number;
  duplicateNames: number;
  blockingIssues: MenuAuditIssue[];
  improvementIssues: MenuAuditIssue[];
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getDuplicateNames(names: string[]) {
  const counts = new Map<string, number>();

  names.forEach((name) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return Array.from(counts.values()).reduce((total, count) => {
    if (count < 2) {
      return total;
    }

    return total + (count - 1);
  }, 0);
}

function buildSummary(input: {
  totalSections: number;
  totalItems: number;
  imagesReady?: number;
  itemsWithoutImages?: number;
  failedImages?: number;
  missingPrices: number;
  missingDescriptions: number;
  emptySections: number;
  duplicateNames: number;
}) {
  const blockingIssues: MenuAuditIssue[] = [];
  const improvementIssues: MenuAuditIssue[] = [];

  if (input.missingPrices > 0) {
    blockingIssues.push({
      id: "missing-prices",
      label: "Missing prices",
      description: `${pluralize(input.missingPrices, "dish")} still need a valid price before launch.`,
      count: input.missingPrices,
    });
  }

  if (input.emptySections > 0) {
    blockingIssues.push({
      id: "empty-sections",
      label: "Empty sections",
      description: `${pluralize(input.emptySections, "section")} have no dishes yet.`,
      count: input.emptySections,
    });
  }

  if (input.duplicateNames > 0) {
    blockingIssues.push({
      id: "duplicate-dishes",
      label: "Repeated dish names",
      description: `${pluralize(input.duplicateNames, "dish")} look duplicated and should be checked.`,
      count: input.duplicateNames,
    });
  }

  if ((input.failedImages ?? 0) > 0) {
    blockingIssues.push({
      id: "failed-images",
      label: "Failed image jobs",
      description: `${pluralize(input.failedImages ?? 0, "image")} failed and should be retried.`,
      count: input.failedImages ?? 0,
    });
  }

  if (input.missingDescriptions > 0) {
    improvementIssues.push({
      id: "missing-descriptions",
      label: "Missing descriptions",
      description: `${pluralize(input.missingDescriptions, "dish")} could use a short description for a stronger page.`,
      count: input.missingDescriptions,
    });
  }

  if ((input.itemsWithoutImages ?? 0) > 0) {
    improvementIssues.push({
      id: "missing-images",
      label: "Missing visuals",
      description: `${pluralize(input.itemsWithoutImages ?? 0, "dish")} still need an image.`,
      count: input.itemsWithoutImages ?? 0,
    });
  }

  return {
    totalSections: input.totalSections,
    totalItems: input.totalItems,
    imagesReady: input.imagesReady ?? 0,
    itemsWithoutImages: input.itemsWithoutImages ?? 0,
    failedImages: input.failedImages ?? 0,
    missingPrices: input.missingPrices,
    missingDescriptions: input.missingDescriptions,
    emptySections: input.emptySections,
    duplicateNames: input.duplicateNames,
    blockingIssues,
    improvementIssues,
  };
}

export function auditDraft(draft: MenuExtractionDraft): MenuAuditSummary {
  const allItems = draft.sections.flatMap((section) => section.items);

  return buildSummary({
    totalSections: draft.sections.length,
    totalItems: allItems.length,
    missingPrices: allItems.filter((item) => item.price <= 0).length,
    missingDescriptions: allItems.filter((item) => !item.description?.trim()).length,
    emptySections: draft.sections.filter((section) => section.items.length === 0).length,
    duplicateNames: getDuplicateNames(allItems.map((item) => item.name)),
  });
}

export function auditSections(sections: MenuSection[]): MenuAuditSummary {
  const allItems = sections.flatMap((section) => section.items);

  return buildSummary({
    totalSections: sections.length,
    totalItems: allItems.length,
    imagesReady: allItems.filter((item) => Boolean(item.imageUrl)).length,
    itemsWithoutImages: allItems.filter((item) => !item.imageUrl).length,
    failedImages: allItems.filter((item) => item.imageStatus === "failed").length,
    missingPrices: allItems.filter((item) => item.price <= 0).length,
    missingDescriptions: allItems.filter((item) => !item.description?.trim()).length,
    emptySections: sections.filter((section) => section.items.length === 0).length,
    duplicateNames: getDuplicateNames(allItems.map((item) => item.name)),
  });
}
