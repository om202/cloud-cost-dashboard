import { useState } from 'react'
import { CheckCircle2, ChevronDown, ShieldAlert } from 'lucide-react'
import { dataQuality } from '@/lib/cost'
import { usd } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'

// Shows the reconciliation result and every adjustment made to the data.
export default function DataQualityBanner() {
  const [open, setOpen] = useState(false)
  const q = dataQuality

  const adjustments = [
    { n: q.duplicatesDropped, label: 'duplicate line items dropped (double-counted spend)' },
    { n: q.missingExcluded, label: 'record with missing cost excluded from totals' },
    { n: q.creditsCount, label: `credit applied (${usd(q.creditsAmount)})` },
    { n: q.datesNormalized, label: 'date reformatted to ISO' },
    { n: q.namesCorrected, label: 'account name corrected' },
    { n: q.unparseableDates, label: 'unparseable date skipped' },
  ].filter((a) => a.n > 0)

  return (
    <Card>
      <CardContent>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 text-left"
        >
          {q.reconciled ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-under" />
          ) : (
            <ShieldAlert className="h-5 w-5 shrink-0 text-warn" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {q.reconciled
                ? 'Spend reconciled to source of truth'
                : 'Spend does not reconcile to summary'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {q.ingested} records ingested · {q.adjustedRows} adjusted · derived gross{' '}
              {usd(q.derivedGross)}
              {q.reconciled ? ' matches summary' : ` vs summary ${usd(q.summaryGross)}`}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            {adjustments.map((a) => (
              <li key={a.label} className="flex items-center gap-2">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[11px] font-medium tabular-nums text-foreground">
                  {a.n}
                </span>
                {a.label}
              </li>
            ))}
            <li className="flex items-center gap-2 pt-1 text-foreground">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[11px] font-medium tabular-nums">
                =
              </span>
              Gross {usd(q.derivedGross)} − credits {usd(-q.creditsAmount)} = net spend, all
              figures below derived from cleaned records.
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
