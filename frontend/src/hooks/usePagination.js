import { useState, useCallback } from "react";

/**
 * usePagination — client-side pagination helper.
 * @param {number} totalItems
 * @param {number} [initialPageSize=10]
 */
export const usePagination = (totalItems, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const paginate = useCallback((items) => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  const setPageSize = useCallback((newSize) => {
    setPageSizeState(newSize);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginate,
    goToPage,
    nextPage:  () => goToPage(currentPage + 1),
    prevPage:  () => goToPage(currentPage - 1),
    setPageSize,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};
