import { compareAsc, parseISO } from "date-fns";
import { useMemo } from "react";

import type { TransformedImage } from "../types/general";

export type TransformedImagesSortField = "size" | "date" | "downloads" | "likes";
export type TransformedImagesSortOrder = "asc" | "desc";

export interface TransformedImagesFilterState {
  minSize: number | null;
  maxSize: number | null;
  sortBy: TransformedImagesSortField;
  sortOrder: TransformedImagesSortOrder;
}

export const defaultTransformedImagesFilters: TransformedImagesFilterState = {
  minSize: null,
  maxSize: null,
  sortBy: "date",
  sortOrder: "desc",
};

const filterBySizeRange = (
  images: TransformedImage[],
  minSize: number | null,
  maxSize: number | null
) => {
  if (minSize == null && maxSize == null) return images;

  return images.filter((image) => {
    if (minSize != null && image.size < minSize) {
      return false;
    }

    if (maxSize != null && image.size > maxSize) {
      return false;
    }

    return true;
  });
};

const sortTransformedImages = (
  images: TransformedImage[],
  sortBy: TransformedImagesSortField,
  sortOrder: TransformedImagesSortOrder
) => {
  const sorted = [...images];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "size":
        comparison = a.size - b.size;
        break;
      case "date": {
        const dateA = parseISO(a.createdAt);
        const dateB = parseISO(b.createdAt);
        comparison = compareAsc(dateA, dateB);
        break;
      }
      case "downloads":
        comparison = a.downloadsCount - b.downloadsCount;
        break;
      case "likes":
        comparison = (a.likes?.length ?? 0) - (b.likes?.length ?? 0);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
};

export const applyTransformedImagesFilters = (
  images: TransformedImage[],
  filters: TransformedImagesFilterState
) => {
  const afterSize = filterBySizeRange(images, filters.minSize, filters.maxSize);

  return sortTransformedImages(afterSize, filters.sortBy, filters.sortOrder);
};

export const useTransformedImagesFilter = (
  images: TransformedImage[],
  filters: TransformedImagesFilterState
) => {
  return useMemo(
    () => applyTransformedImagesFilters(images, filters),
    [images, filters]
  );
};

