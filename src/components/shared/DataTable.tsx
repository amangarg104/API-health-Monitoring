import * as React from 'react'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = 'Search…',
  pageSize = 10,
}: {
  data: T[]
  columns: Column<T>[]
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  pageSize?: number
}) {
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let rows = data
    if (q && searchKeys?.length) {
      const qq = q.toLowerCase()
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(qq)),
      )
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      rows = [...rows].sort((a, b) => {
        const av = col?.sortValue?.(a) ?? ''
        const bv = col?.sortValue?.(b) ?? ''
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return rows
  }, [data, q, searchKeys, sortKey, sortDir, columns])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const slice = filtered.slice(page * pageSize, page * pageSize + pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-3">
      {searchKeys ? (
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(0)
          }}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
      ) : null}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort(c.key)}
                    >
                      {c.header}
                      {sortKey !== c.key ? (
                        <ArrowUpDown className="h-3 w-3" />
                      ) : sortDir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  No results
                </TableCell>
              </TableRow>
            ) : (
              slice.map((row, i) => (
                <TableRow key={row.id ?? i}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length} row{filtered.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span>
            {page + 1} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
