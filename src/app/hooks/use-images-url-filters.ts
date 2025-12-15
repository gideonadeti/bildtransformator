"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  defaultImagesFilters,
  type ImagesFilterState,
  type ImagesSortField,
  type ImagesSortOrder,
} from "./use-images-filter";

const parseMegabytesParam = (value: string | null) => {
  if (value == null) return null;

  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 1024 * 1024);
};

const toMegabytesParam = (bytes: number | null) => {
  if (bytes == null) return null;
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  const mb = bytes / (1024 * 1024);

  return mb.toFixed(mb < 10 ? 1 : 0);
};

const buildFiltersFromSearchParams = (
  params: URLSearchParams
): ImagesFilterState => {
  const name = params.get("name") ?? defaultImagesFilters.name;

  const minSize = parseMegabytesParam(params.get("minSizeMb"));
  const maxSize = parseMegabytesParam(params.get("maxSizeMb"));

  const format = params.get("format") || null;

  const sortBy =
    (params.get("sortBy") as ImagesSortField | null) ??
    defaultImagesFilters.sortBy;

  const sortOrder =
    (params.get("sortOrder") as ImagesSortOrder | null) ??
    defaultImagesFilters.sortOrder;

  return {
    ...defaultImagesFilters,
    name,
    minSize,
    maxSize,
    format,
    sortBy,
    sortOrder,
  };
};

const buildSearchParamsFromFilters = (
  filters: ImagesFilterState,
  baseSearchParamsString: string
): URLSearchParams => {
  const params = new URLSearchParams(baseSearchParamsString);
  const trimmedName = filters.name.trim();

  if (trimmedName) {
    params.set("name", trimmedName);
  } else {
    params.delete("name");
  }

  const minSizeMb = toMegabytesParam(filters.minSize);
  const maxSizeMb = toMegabytesParam(filters.maxSize);

  if (minSizeMb) {
    params.set("minSizeMb", minSizeMb);
  } else {
    params.delete("minSizeMb");
  }

  if (maxSizeMb) {
    params.set("maxSizeMb", maxSizeMb);
  } else {
    params.delete("maxSizeMb");
  }

  if (filters.format) {
    params.set("format", filters.format);
  } else {
    params.delete("format");
  }

  if (filters.sortBy !== defaultImagesFilters.sortBy) {
    params.set("sortBy", filters.sortBy);
  } else {
    params.delete("sortBy");
  }

  if (filters.sortOrder !== defaultImagesFilters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  } else {
    params.delete("sortOrder");
  }

  return params;
};

const replaceUrlIfChanged = (
  router: ReturnType<typeof useRouter>,
  pathname: string,
  currentSearchParamsString: string,
  nextParams: URLSearchParams
) => {
  const nextSearch = nextParams.toString();
  const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
  const currentSearch = currentSearchParamsString;
  const currentUrl = currentSearch ? `${pathname}?${currentSearch}` : pathname;

  if (nextUrl !== currentUrl) {
    router.replace(nextUrl, { scroll: false });
  }
};

export const useImagesUrlFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchParamsString = searchParams.toString();

  const filters = useMemo(
    () => buildFiltersFromSearchParams(new URLSearchParams(searchParamsString)),
    [searchParamsString]
  );

  const replaceFiltersInUrl = (nextFilters: ImagesFilterState) => {
    const nextParams = buildSearchParamsFromFilters(
      nextFilters,
      searchParamsString
    );

    replaceUrlIfChanged(router, pathname, searchParamsString, nextParams);
  };

  return {
    filters,
    replaceFiltersInUrl,
  };
};


