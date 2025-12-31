import { compareAsc, isValid, parseISO } from "date-fns";
import { useMemo } from "react";

import type { Image } from "../types/general";

export type ImagesSortField = "name" | "size" | "date" | "downloads" | "likes";
export type ImagesSortOrder = "asc" | "desc";

export interface ImagesFilterState {
  name: string;
  minSize: number | null;
  maxSize: number | null;
  format: string | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: ImagesSortField;
  sortOrder: ImagesSortOrder;
}

export const defaultImagesFilters: ImagesFilterState = {
  name: "",
  minSize: null,
  maxSize: null,
  format: null,
  startDate: null,
  endDate: null,
  sortBy: "date",
  sortOrder: "desc",
};

const safeParseDate = (value: string | null) => {
  if (!value) return null;

  try {
    const parsed = parseISO(value);

    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const filterByName = (images: Image[], name: string) => {
  const trimmed = name.trim();

  if (!trimmed) return images;

  const searchTerm = trimmed.toLowerCase();

  return images.filter((image) =>
    image.originalName.toLowerCase().includes(searchTerm)
  );
};

const filterBySizeRange = (
  images: Image[],
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

const filterByFormat = (images: Image[], format: string | null) => {
  if (!format) return images;

  return images.filter((image) =>
    image.format.toLowerCase() === format.toLowerCase()
  );
};

const filterByDateRange = (
  images: Image[],
  startDateValue: string | null,
  endDateValue: string | null
) => {
  const startDate = safeParseDate(startDateValue);
  const endDate = safeParseDate(endDateValue);

  if (!startDate && !endDate) return images;

  return images.filter((image) => {
    const imageDate = parseISO(image.createdAt);

    if (startDate && endDate) {
      return (
        compareAsc(imageDate, startDate) >= 0 &&
        compareAsc(imageDate, endDate) <= 0
      );
    }

    if (startDate) {
      return compareAsc(imageDate, startDate) >= 0;
    }

    if (endDate) {
      return compareAsc(imageDate, endDate) <= 0;
    }

    return true;
  });
};

const sortImages = (
  images: Image[],
  sortBy: ImagesSortField,
  sortOrder: ImagesSortOrder
) => {
  const sorted = [...images];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.originalName.localeCompare(b.originalName);
        break;
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

export const applyImagesFilters = (
  images: Image[],
  filters: ImagesFilterState
) => {
  const afterName = filterByName(images, filters.name);
  const afterSize = filterBySizeRange(afterName, filters.minSize, filters.maxSize);
  const afterFormat = filterByFormat(afterSize, filters.format);
  const afterDate = filterByDateRange(
    afterFormat,
    filters.startDate,
    filters.endDate
  );

  return sortImages(afterDate, filters.sortBy, filters.sortOrder);
};

export const useImagesFilter = (images: Image[], filters: ImagesFilterState) => {
  return useMemo(
    () => applyImagesFilters(images, filters),
    [images, filters]
  );
};


