import React, { memo, useMemo, useCallback } from 'react';

// Optimized Card Component
export const OptimizedCard = memo(({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  onClick,
  loading = false 
}) => {
  const cardClasses = useMemo(() => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    
    return `p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`;
  }, [color]);

  const handleClick = useCallback(() => {
    if (onClick && !loading) {
      onClick();
    }
  }, [onClick, loading]);

  if (loading) {
    return (
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center">
          <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-lg"></div>
          <div className="ml-4 flex-1">
            <div className="animate-pulse bg-gray-200 h-4 w-24 mb-2 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-6 bg-white border border-gray-200 shadow-sm rounded-xl ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className={cardClasses}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Optimized Table Row Component
export const OptimizedTableRow = memo(({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  actions = true 
}) => {
  const handleEdit = useCallback(() => {
    if (onEdit) onEdit(data);
  }, [onEdit, data]);

  const handleDelete = useCallback(() => {
    if (onDelete) onDelete(data);
  }, [onDelete, data]);

  const handleView = useCallback(() => {
    if (onView) onView(data);
  }, [onView, data]);

  const cellValues = useMemo(() => {
    return columns.map(column => {
      if (typeof column.accessor === 'function') {
        return column.accessor(data);
      }
      return data[column.accessor] || '-';
    });
  }, [data, columns]);

  return (
    <tr className="border-t hover:bg-gray-50 transition-colors">
      {cellValues.map((value, index) => (
        <td key={index} className="px-4 py-2 text-sm text-gray-900">
          {value}
        </td>
      ))}
      {actions && (
        <td className="px-4 py-2 text-sm">
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={handleView}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Lihat
              </button>
            )}
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-green-600 hover:text-green-800 text-xs"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Hapus
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

// Optimized Search Input
export const OptimizedSearchInput = memo(({ 
  value, 
  onChange, 
  placeholder = "Cari...", 
  debounceMs = 300 
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  
  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value, debounceMs]);

  const handleChange = useCallback((e) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
});

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

// Optimized Filter Component
export const OptimizedFilter = memo(({ 
  options, 
  value, 
  onChange, 
  placeholder = "Pilih filter..." 
}) => {
  const handleChange = useCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  const optionElements = useMemo(() => {
    return options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }, [options]);

  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {optionElements}
    </select>
  );
});

OptimizedFilter.displayName = 'OptimizedFilter';

// Optimized Pagination Component
export const OptimizedPagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showInfo = true 
}) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback((page) => {
    if (onPageChange && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [onPageChange, currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {showInfo && (
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showInfo && (
          <div>
            <p className="text-sm text-gray-700">
              Halaman <span className="font-medium">{currentPage}</span> dari{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
        )}
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              ←
            </button>
            
            {pages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : page === '...'
                    ? 'border-gray-300 bg-white text-gray-700 cursor-default'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              →
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
});

OptimizedPagination.displayName = 'OptimizedPagination';