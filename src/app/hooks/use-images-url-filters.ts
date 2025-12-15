"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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
  const [nameInput, setNameInput] = useState<string>(() => {
    return searchParams.get("name") ?? "";
  });

  const searchParamsString = searchParams.toString();

  const filters = useMemo(
    () => buildFiltersFromSearchParams(new URLSearchParams(searchParamsString)),
    [searchParamsString]
  );

  // Use refs to access latest values inside debounced callback without recreating it
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

  // Keep local name input in sync if URL filters change externally (back/forward/etc.)
  useEffect(() => {
    setNameInput(filters.name ?? "");
  }, [filters.name]);

  const replaceFiltersInUrl = (nextFilters: ImagesFilterState) => {
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

  // Debounce only the name input into the URL
  const debouncedUpdateNameInUrl = useDebouncedCallback((name: string) => {
    const nextFilters: ImagesFilterState = {
      ...filtersRef.current,
      name,
    };

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
  }, 300);

  // Update URL when name input changes (debounced)
  useEffect(() => {
    debouncedUpdateNameInUrl(nameInput);
  }, [nameInput, debouncedUpdateNameInUrl]);

  return {
    filters,
    nameInput,
    setNameInput,
    replaceFiltersInUrl,
  };
};
