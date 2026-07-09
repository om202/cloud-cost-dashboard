import { getKpis, accountSummaries } from '@/lib/cost'
import { usd, usdCompact, pct, signedUsd } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'

const BAND_BAR = { over: 'bg-over', watch: 'bg-warn', healthy: 'bg-under' }
const BAND_TEXT = { over: 'text-over', watch: 'text-warn', healthy: 'text-under' }

function StatCard({ label, value, sub, tone = 'default' }) {
  const toneClass =
    tone === 'bad' ? 'text-over' : tone === 'good' ? 'text-under' : 'text-foreground'
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`mt-2 text-3xl font-normal tracking-tight tabular-nums ${toneClass}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function AccountRow({ a }) {
  const util = a.utilization_pct
  const fill = Math.min(util, 100)
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="w-44 shrink-0">
        <p className="truncate text-sm font-medium text-foreground">{a.account_name}</p>
        <p className="truncate text-xs text-muted-foreground">{a.owner}</p>
      </div>

      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${BAND_BAR[a.band]}`}
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>

      <div className="w-14 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
        {pct(util, 0)}
      </div>
      <div
        className={`w-24 shrink-0 text-right text-sm font-medium tabular-nums ${BAND_TEXT[a.band]}`}
      >
        {signedUsd(a.variance)}
      </div>
    </div>
  )
}

export default function KpiSection() {
  const k = getKpis()
  const over = k.variance > 0
  const attention = k.overBudgetCount + k.atRiskCount

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Spend"
          value={usdCompact(k.netCost)}
          sub={
            k.credits < 0
              ? `${usdCompact(k.grossCost)} gross − ${usd(-k.credits)} credits · 6 months`
              : `of ${usdCompact(k.totalBudget)} budget · 6 months`
          }
        />
        <StatCard
          label="Budget Utilization"
          value={pct(k.utilizationPct)}
          sub={over ? 'over budget portfolio-wide' : 'within budget'}
          tone={over ? 'bad' : 'good'}
        />
        <StatCard
          label="Net Variance"
          value={signedUsd(k.variance)}
          sub={over ? 'spend above budget' : 'spend under budget'}
          tone={over ? 'bad' : 'good'}
        />
        <StatCard
          label="Accounts Needing Attention"
          value={`${attention} of ${k.accountCount}`}
          sub={`${k.overBudgetCount} over · ${k.atRiskCount} at risk (≥90%)`}
          tone={attention > 0 ? 'bad' : 'good'}
        />
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Accounts by utilization</h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-over" /> over budget
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-warn" /> at risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-under" /> healthy
              </span>
            </div>
          </div>
          <div className="mt-2 divide-y divide-border">
            {accountSummaries.map((a) => (
              <AccountRow key={a.account_id} a={a} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
