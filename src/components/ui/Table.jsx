import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({
  columns,
  data,
  sortable = true,
  sortColumn,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = "Aucune donnée disponible"
}) => {
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    if (onSort) {
      const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newDirection);
    }
  };

  const renderSortIcon = (column) => {
    if (!sortable || !column.sortable) return null;
    
    if (sortColumn === column.key) {
      return sortDirection === 'asc' ? 
        <ChevronUp className="h-4 w-4" aria-hidden="true" /> : 
        <ChevronDown className="h-4 w-4" aria-hidden="true" />;
    }
    
    return <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" aria-hidden="true" />;
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500" role="status">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200" role="grid">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${sortable && column.sortable ? 'cursor-pointer group hover:bg-gray-100' : ''}`}
                onClick={() => handleSort(column)}
                aria-sort={sortColumn === column.key ? 
                  (sortDirection === 'asc' ? 'ascending' : 'descending') : 
                  undefined}
                role="columnheader"
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  role="gridcell"
                >
                  {column.render ? 
                    column.render(row[column.key], row) : 
                    row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Définition du type de colonne
const ColumnShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sortable: PropTypes.bool,
  render: PropTypes.func
});

Table.propTypes = {
  columns: PropTypes.arrayOf(ColumnShape).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortable: PropTypes.bool,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string
};

Table.defaultProps = {
  sortable: true,
  loading: false,
  emptyMessage: "Aucune donnée disponible",
  sortColumn: undefined,
  sortDirection: undefined,
  onSort: undefined
};

export default Table;