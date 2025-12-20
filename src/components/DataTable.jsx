import { useState, useMemo } from 'react';

const DataTable = ({
  data = [],
  columns = [],
  searchFields = [],
  defaultSort = { field: '', direction: 'desc' },
  defaultItemsPerPage = 10,
  searchPlaceholder = "Cari data...",
  emptyMessage = "Tidak ada data",
  className = ""
}) => {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState(defaultSort.field);
  const [sortDirection, setSortDirection] = useState(defaultSort.direction);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Sort data function
  const sortData = (dataToSort) => {
    if (!sortField) return dataToSort;
    
    return [...dataToSort].sort((a, b) => {
      const column = columns.find(col => col.key === sortField);
      let aValue, bValue;
      
      if (column?.sortValue) {
        aValue = column.sortValue(a);
        bValue = column.sortValue(b);
      } else {
        aValue = column?.accessor ? column.accessor(a) : a[sortField];
        bValue = column?.accessor ? column.accessor(b) : b[sortField];
      }
      
      // Handle different data types
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Convert to string for comparison
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    // Filter data
    const filteredData = data.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      return searchFields.some(field => {
        const value = typeof field === 'function' ? field(item) : item[field];
        return String(value || '').toLowerCase().includes(searchLower);
      });
    });
    
    // Sort data
    return sortData(filteredData);
  }, [data, searchTerm, sortField, sortDirection, searchFields, columns]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = processedData.slice(startIndex, endIndex);

  // Reset to first page when items per page changes or search term changes
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  // Navigate to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    const column = columns.find(col => col.key === field);
    if (!column?.sortable) return null;
    
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Get sort options for dropdown
  const getSortOptions = () => {
    const options = [];
    columns.forEach(column => {
      if (column.sortable) {
        options.push({
          value: `${column.key}-desc`,
          label: `${column.label} (Z-A)`
        });
        options.push({
          value: `${column.key}-asc`,
          label: `${column.label} (A-Z)`
        });
      }
    });
    return options;
  };

  return (
    <div className={className}>
      {/* Controls */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">data per halaman</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Cari:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="text-gray-400 hover:text-gray-600"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
          
          {getSortOptions().length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Urutkan:</span>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field);
                  setSortDirection(direction);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 flex flex-col gap-1">
          <div>
            {searchTerm ? (
              <>Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} hasil pencarian (total: {data.length} data)</>
            ) : (
              <>Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data</>
            )}
          </div>
          {sortField && (
            <div className="text-xs text-gray-500">
              Diurutkan: {columns.find(col => col.key === sortField)?.label} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-left text-xs font-semibold text-gray-600 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    <SortIcon field={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    {column.render ? column.render(item, startIndex + index) : 
                     column.accessor ? column.accessor(item) : 
                     item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  {searchTerm ? (
                    <>
                      Tidak ada data yang cocok dengan pencarian "{searchTerm}"
                      <br />
                      <button 
                        onClick={() => handleSearchChange('')}
                        className="text-blue-600 hover:text-blue-800 underline mt-2"
                      >
                        Hapus filter pencarian
                      </button>
                    </>
                  ) : (
                    emptyMessage
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? goToPage(page) : null}
                  disabled={page === '...'}
                  className={`px-3 py-1 text-sm rounded ${
                    page === currentPage
                      ? 'bg-[#003366] text-white'
                      : page === '...'
                      ? 'cursor-default'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya →
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;