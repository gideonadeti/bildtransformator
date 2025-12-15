"use client";

import { useCallback, useState } from "react";

export const usePagination = (pageSize: number) => {
  const [displayedCount, setDisplayedCount] = useState(pageSize);

  const reset = useCallback(() => {
    setDisplayedCount(pageSize);
  }, [pageSize]);

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  return {
    displayedCount,
    reset,
    loadMore,
  };
};


