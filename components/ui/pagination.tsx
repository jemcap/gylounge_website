import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationRange } from "@/lib/admin-member";

type PaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
};

export function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {

  const range = getPaginationRange(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const baseButton =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full text-sm font-medium transition";
  const activeClass = "bg-[#14110b] text-[#f5f1ea]";
  const inactiveClass = "text-[#3b3127] hover:bg-[#eee8dd]";
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        className={`${baseButton} px-3 ${isFirstPage ? disabledClass : inactiveClass}`}
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="ml-1 hidden sm:inline">Prev</span>
      </button>

      {range.map((page, index) =>
        page === null ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-10 min-w-10 items-center justify-center text-sm text-[#8b6b3f]"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${baseButton} ${page === currentPage ? activeClass : inactiveClass}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        className={`${baseButton} px-3 ${isLastPage ? disabledClass : inactiveClass}`}
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
