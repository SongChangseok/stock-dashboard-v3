import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import Input from './Input'
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation'

export interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
  mobileCardView?: boolean
  filters?: FilterOption[]
  onFilterChange?: (filters: Record<string, string>) => void
  keyboardNavigation?: boolean
  onRowSelect?: (row: T, index: number) => void
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  mobileCardView = true,
  filters = [],
  onFilterChange,
  keyboardNavigation = false,
  onRowSelect,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const handleFilterChange = React.useCallback((filterKey: string, value: string) => {
    const newFilters = { ...activeFilters }
    if (value === '') {
      delete newFilters[filterKey]
    } else {
      newFilters[filterKey] = value
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }, [activeFilters, onFilterChange])

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    }

    // Apply custom filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      result = result.filter(row => {
        const value = row[filterKey]
        return value?.toString().toLowerCase() === filterValue.toLowerCase()
      })
    })

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [data, sortConfig, searchQuery, columns, activeFilters])

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      return <ChevronUp className="h-4 w-4 opacity-30" />
    }

    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" style={{ color: 'var(--primary)' }} />
    ) : (
      <ChevronDown className="h-4 w-4" style={{ color: 'var(--primary)' }} />
    )
  }

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowUp: () => {
      if (keyboardNavigation && sortedAndFilteredData.length > 0) {
        setSelectedRowIndex(prev => Math.max(0, prev - 1))
      }
    },
    onArrowDown: () => {
      if (keyboardNavigation && sortedAndFilteredData.length > 0) {
        setSelectedRowIndex(prev => Math.min(sortedAndFilteredData.length - 1, prev + 1))
      }
    },
    onEnter: () => {
      if (keyboardNavigation && selectedRowIndex >= 0 && onRowSelect) {
        onRowSelect(sortedAndFilteredData[selectedRowIndex], selectedRowIndex)
      }
    },
    disabled: !keyboardNavigation,
  })

  const tableClasses = ['min-w-full', className].filter(Boolean).join(' ')

  const MobileCardView = () => (
    <div className="space-y-4">
      {sortedAndFilteredData.map((row, index) => (
        <div
          key={index}
          className="rounded-lg border p-4 space-y-3"
          style={{ 
            borderColor: 'var(--border)', 
            backgroundColor: 'var(--background)' 
          }}
        >
          {columns.map(column => {
            // Skip showing Actions header in mobile view, just render the buttons
            if (column.header === 'Actions') {
              return (
                <div key={String(column.key)} className="flex justify-end pt-2">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '-')}
                </div>
              )
            }
            
            return (
              <div key={String(column.key)} className="flex justify-between items-start">
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {column.header}
                </span>
                <span 
                  className="text-sm font-medium text-right"
                  style={{ color: 'var(--foreground)' }}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '-')}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(searchable || filters.length > 0) && (
        <div className="space-y-3">
          {searchable && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--muted-foreground)' }}
              />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          )}
          
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {filters.map(filter => (
                <div key={filter.key} className="flex items-center space-x-2">
                  <label 
                    className="text-sm font-medium"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {filter.label}:
                  </label>
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={e => handleFilterChange(filter.key, e.target.value)}
                    className="px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <option value="">All</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              
              {Object.keys(activeFilters).length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters({})
                    onFilterChange?.({})
                  }}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="block md:hidden">
          {sortedAndFilteredData.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--muted-foreground)' }}>
                {searchQuery ? 'No results found' : 'No data available'}
              </p>
            </div>
          ) : (
            <MobileCardView />
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={`${mobileCardView ? 'hidden md:block' : ''} rounded-2xl border overflow-x-auto`} style={{ borderColor: 'var(--border)' }}>
        <table className={`${tableClasses} table-auto w-full`}>
          <thead style={{ backgroundColor: 'var(--muted)' }}>
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                    column.sortable ? 'cursor-pointer hover:bg-opacity-80' : ''
                  }`}
                  style={{
                    color: 'var(--muted-foreground)',
                    ...(column.sortable && {
                      ':hover': { backgroundColor: 'var(--neutral-200)' },
                    }),
                  }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  onMouseEnter={e => {
                    if (column.sortable) {
                      (e.target as HTMLElement).style.backgroundColor = 'var(--neutral-200)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (column.sortable) {
                      (e.target as HTMLElement).style.backgroundColor = 'var(--muted)'
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--background)' }}>
            {sortedAndFilteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {searchQuery ? 'No results found' : 'No data available'}
                </td>
              </tr>
            ) : (
              sortedAndFilteredData.map((row, index) => (
                <tr
                  key={index}
                  className="table-row-hover border-t transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {columns.map(column => (
                    <td
                      key={String(column.key)}
                      className="px-3 py-3 whitespace-nowrap text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
