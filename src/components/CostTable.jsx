import { useMemo, useState } from 'react'
import { costRecords } from '@/lib/cost'
import { usd, signedUsd } from '@/lib/format'
import { filterRecords, nextSort, sortRecords } from '@/lib/cost/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COLUMNS = [
  { key: 'date', label: 'Date', align: 'left' },
  { key: 'account', label: 'Account', align: 'left' },
  { key: 'service', label: 'Service', align: 'left' },
  { key: 'region', label: 'Region', align: 'left' },
  { key: 'cost', label: 'Cost', align: 'right' },
  { key: 'budget', label: 'Budget', align: 'right' },
  { key: 'variance', label: 'Variance', align: 'right' },
]

function SortIcon({ dir }) {
  return (
    <span className="ml-1 inline-block text-[10px] text-muted-foreground">
      {dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '↕'}
    </span>
  )
}

export default function CostTable() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })

  const rows = useMemo(
    () => sortRecords(filterRecords(costRecords, query), sort),
    [query, sort],
  )

  const excludedCount = costRecords.filter((r) => !r.countInCost).length

  const toggleSort = (key) => setSort((s) => nextSort(s, key))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Cost Breakdown</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {rows.length} of {costRecords.length} records
            {excludedCount > 0 && ` · ${excludedCount} excluded from totals`}
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search account, service, region, owner…"
          className="h-9 w-72"
        />
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                {COLUMNS.map((c) => (
                  <TableHead
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className={`cursor-pointer select-none whitespace-nowrap ${
                      c.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {c.label}
                    <SortIcon dir={sort.key === c.key ? sort.dir : null} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} className="h-24 text-center text-muted-foreground">
                    No records match “{query}”.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const over = r.variance > 0
                  const excluded = !r.countInCost
                  return (
                    <TableRow key={r.id} className={excluded ? 'opacity-55' : undefined}>
                      <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                        {r.date}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {r.account}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          {r.service}
                          {r.isCredit && (
                            <Badge variant="outline" className="border-under/40 bg-under-soft text-[10px] text-under">
                              credit
                            </Badge>
                          )}
                          {r.isMissingCost && (
                            <Badge variant="outline" className="border-warn/40 bg-warn-soft text-[10px] text-warn">
                              no data
                            </Badge>
                          )}
                          {r.isDuplicate && (
                            <Badge variant="outline" className="border-border bg-muted text-[10px] text-muted-foreground">
                              duplicate
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {r.region}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">
                        {r.isMissingCost ? '—' : usd(r.cost)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums text-muted-foreground">
                        {usd(r.budget)}
                      </TableCell>
                      <TableCell
                        className={`whitespace-nowrap text-right font-medium tabular-nums ${
                          r.variance == null
                            ? 'text-muted-foreground'
                            : over
                              ? 'text-over'
                              : 'text-under'
                        }`}
                      >
                        {r.variance == null ? '—' : signedUsd(r.variance)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
