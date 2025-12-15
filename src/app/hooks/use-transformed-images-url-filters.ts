"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import {
  defaultTransformedImagesFilters,
  type TransformedImagesFilterState,
  type TransformedImagesSortField,
  type TransformedImagesSortOrder,
} from "./use-transformed-images-filter";

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
): TransformedImagesFilterState => {
  const minSize = parseMegabytesParam(params.get("transformed-minSizeMb"));
  const maxSize = parseMegabytesParam(params.get("transformed-maxSizeMb"));

  const sortBy =
    (params.get("transformed-sortBy") as TransformedImagesSortField | null) ??
    defaultTransformedImagesFilters.sortBy;

  const sortOrder =
    (params.get("transformed-sortOrder") as TransformedImagesSortOrder | null) ??
    defaultTransformedImagesFilters.sortOrder;

  return {
    ...defaultTransformedImagesFilters,
    minSize,
    maxSize,
    sortBy,
    sortOrder,
  };
};

const buildSearchParamsFromFilters = (
  filters: TransformedImagesFilterState,
  baseSearchParamsString: string
): URLSearchParams => {
  const params = new URLSearchParams(baseSearchParamsString);

  const minSizeMb = toMegabytesParam(filters.minSize);
  const maxSizeMb = toMegabytesParam(filters.maxSize);

  if (minSizeMb) {
    params.set("transformed-minSizeMb", minSizeMb);
  } else {
    params.delete("transformed-minSizeMb");
  }

  if (maxSizeMb) {
    params.set("transformed-maxSizeMb", maxSizeMb);
  } else {
    params.delete("transformed-maxSizeMb");
  }

  if (filters.sortBy !== defaultTransformedImagesFilters.sortBy) {
    params.set("transformed-sortBy", filters.sortBy);
  } else {
    params.delete("transformed-sortBy");
  }

  if (filters.sortOrder !== defaultTransformedImagesFilters.sortOrder) {
    params.set("transformed-sortOrder", filters.sortOrder);
  } else {
    params.delete("transformed-sortOrder");
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

export const useTransformedImagesUrlFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchParamsString = searchParams.toString();

  const filters = useMemo(
    () => buildFiltersFromSearchParams(new URLSearchParams(searchParamsString)),
    [searchParamsString]
  );

  // Use refs to access latest values without recreating callbacks
  const filtersRef = useRef(filters);
  const searchParamsStringRef = useRef(searchParamsString);
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    filtersRef.current = filters;
    searchParamsStringRef.current = searchParamsString;
    routerRef.current = router;
    pathnameRef.current = pathname;
  }, [filters, searchParamsString, router, pathname]);

  const replaceFiltersInUrl = (nextFilters: TransformedImagesFilterState) => {
    const nextParams = buildSearchParamsFromFilters(
      nextFilters,
      searchParamsStringRef.current
    );

    replaceUrlIfChanged(
      routerRef.current,
      pathnameRef.current,
      searchParamsStringRef.current,
      nextParams
    );
  };

  return {
    filters,
    replaceFiltersInUrl,
  };
};

