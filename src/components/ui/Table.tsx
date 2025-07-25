import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import Input from './Input'

export interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState('')

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data]

    if (searchQuery) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    }

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
  }, [data, sortConfig, searchQuery, columns])

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

  const tableClasses = ['min-w-full', className].filter(Boolean).join(' ')

  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
        <table className={tableClasses}>
          <thead style={{ backgroundColor: 'var(--muted)' }}>
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
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
                      ;(e.target as HTMLElement).style.backgroundColor = 'var(--neutral-200)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (column.sortable) {
                      ;(e.target as HTMLElement).style.backgroundColor = 'var(--muted)'
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
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
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
