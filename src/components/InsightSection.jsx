import { useMemo } from 'react'
import { TriangleAlert, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getOverspendInsight } from '@/lib/cost'
import { usd, usdCompact, signedUsd, pct } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{row.service}</p>
      <p className="tabular-nums text-over">Over by {signedUsd(row.variance)}</p>
      <p className="tabular-nums text-muted-foreground">
        {usd(row.cost)} spent · {usd(row.budget)} budget
      </p>
    </div>
  )
}

export default function InsightSection() {
  const { services, lead, accelerator } = useMemo(() => getOverspendInsight(), [])

  if (!lead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overspend Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No services are over budget. 🎉
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overspend Drivers</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Services ranked by spend above budget across the portfolio
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-2.5 rounded-lg border border-over/25 bg-over-soft p-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-over" />
          <div className="text-xs leading-relaxed">
            <p className="font-medium text-over">Root cause</p>
            <p className="mt-0.5 text-foreground">
              <span className="font-medium">{lead.service}</span> is the top overspend
              driver at <span className="font-medium">{signedUsd(lead.variance)}</span> over
              budget.
              {lead.topAccount && (
                <>
                  {' '}
                  <span className="font-medium">{lead.topAccount.account}</span> accounts
                  for {pct(lead.share * 100, 0)} of it ({signedUsd(lead.topAccount.variance)}
                  ).
                </>
              )}
            </p>
          </div>
        </div>

        {accelerator && (
          <div className="flex gap-2.5 rounded-lg border border-warn/25 bg-warn-soft p-3">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <div className="text-xs leading-relaxed">
              <p className="font-medium text-warn">Emerging risk</p>
              <p className="mt-0.5 text-foreground">
                <span className="font-medium">{accelerator.account}</span> has the
                fastest-rising variance — trending{' '}
                <span className="font-medium">{signedUsd(accelerator.slope)}/mo</span> and now
                at <span className="font-medium">{signedUsd(accelerator.latestVariance)}</span>.
                Watch before it breaches budget.
              </p>
            </div>
          </div>
        )}

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={services}
              margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
            >
              <XAxis
                type="number"
                tickFormatter={usdCompact}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                type="category"
                dataKey="service"
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fontSize: 12, fill: 'var(--foreground)' }}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
              <Bar dataKey="variance" radius={[0, 4, 4, 0]} maxBarSize={26}>
                {services.map((s, i) => (
                  <Cell
                    key={s.service}
                    fill={
                      i === 0
                        ? 'var(--over)'
                        : 'color-mix(in srgb, var(--over) 45%, var(--card))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
