import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { accounts, getMonthlySeries } from '@/lib/cost'
import { usd, usdCompact, signedUsd } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OVER = 'var(--over)'
const UNDER = 'var(--under)'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const over = row.variance > 0
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="tabular-nums text-foreground">Cost: {usd(row.cost)}</p>
      <p className="tabular-nums text-muted-foreground">Budget: {usd(row.budget)}</p>
      <p className={`tabular-nums font-medium ${over ? 'text-over' : 'text-under'}`}>
        {over ? 'Over' : 'Under'} by {signedUsd(row.variance)}
      </p>
    </div>
  )
}

export default function TrendChart() {
  const [account, setAccount] = useState('all')
  const data = useMemo(() => getMonthlySeries(account), [account])

  const overMonths = data.filter((d) => d.variance > 0).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Cost vs. Budget</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {overMonths > 0
              ? `${overMonths} of ${data.length} months over budget`
              : 'Every month within budget'}
          </p>
        </div>
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger className="w-[200px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                tickFormatter={usdCompact}
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar dataKey="cost" name="Cost" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((d) => (
                  <Cell key={d.monthKey} fill={d.variance > 0 ? OVER : UNDER} />
                ))}
              </Bar>
              <Line
                dataKey="budget"
                name="Budget"
                type="monotone"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
