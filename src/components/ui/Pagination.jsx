import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className = '',
  itemsPerPage = 10,
  totalItems,
  onItemsPerPageChange
}) => {
  // Générer la plage de pages à afficher
  const getPageRange = () => {
    const range = [];
    const leftSibling = Math.max(1, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages, currentPage + siblingCount);

    for (let i = leftSibling; i <= rightSibling; i++) {
      range.push(i);
    }

    // Ajouter les ellipses si nécessaire
    if (leftSibling > 1) {
      range.unshift('...');
      range.unshift(1);
    }
    if (rightSibling < totalPages) {
      range.push('...');
      range.push(totalPages);
    }

    return range;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageButton = (page, index) => {
    const isCurrentPage = page === currentPage;
    const isEllipsis = page === '...';

    if (isEllipsis) {
      return (
        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500" aria-hidden="true">
          ...
        </span>
      );
    }

    return (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={`
          px-3 py-2 rounded-md text-sm font-medium
          ${isCurrentPage
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        aria-current={isCurrentPage ? 'page' : undefined}
        aria-label={`Page ${page}`}
      >
        {page}
      </button>
    );
  };

  return (
    <nav 
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Information sur les éléments par page */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <label htmlFor="items-per-page">Éléments par page:</label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        {totalItems && (
          <span className="ml-4" role="status">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
            {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
          </span>
        )}
      </div>

      {/* Navigation des pages */}
      <div className="flex items-center gap-2">
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Première page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center" role="group" aria-label="Liste des pages">
          {getPageRange().map((page, index) => renderPageButton(page, index))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Dernière page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
  itemsPerPage: PropTypes.number,
  totalItems: PropTypes.number,
  onItemsPerPageChange: PropTypes.func
};

Pagination.defaultProps = {
  showFirstLast: true,
  siblingCount: 1,
  className: '',
  itemsPerPage: 10,
  totalItems: undefined,
  onItemsPerPageChange: undefined
};

export default Pagination;