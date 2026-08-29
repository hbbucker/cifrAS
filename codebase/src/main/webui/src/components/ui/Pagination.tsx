import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label={t('pagination.prev', 'Previous page')}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-md sm:rounded-lg bg-bg-card hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[#aa3bff] outline-none"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-text-main" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="flex items-center justify-center w-7 h-9 sm:w-9 sm:h-10 text-text-mute text-xs sm:text-sm">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            aria-label={t('pagination.page', `Page ${page}`)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-md sm:rounded-lg font-medium text-xs sm:text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#aa3bff] outline-none ${
              isCurrent
                ? 'bg-[#aa3bff] text-white font-bold'
                : 'bg-bg-card text-text-main hover:bg-bg-elevated'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label={t('pagination.next', 'Next page')}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-md sm:rounded-lg bg-bg-card hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[#aa3bff] outline-none"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-text-main" />
      </button>
    </div>
  );
};
