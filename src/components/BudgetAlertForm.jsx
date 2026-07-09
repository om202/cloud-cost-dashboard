import { useState } from 'react'
import { accounts } from '@/lib/cost'
import { usd } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

let nextId = 1

export default function BudgetAlertForm() {
  const [account, setAccount] = useState('')
  const [threshold, setThreshold] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [alerts, setAlerts] = useState([])

  const validate = () => {
    const e = {}
    if (!account) e.account = 'Select an account.'
    const amount = Number(threshold)
    if (threshold === '') e.threshold = 'Enter a threshold.'
    else if (Number.isNaN(amount) || amount <= 0)
      e.threshold = 'Threshold must be a positive number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setAlerts((prev) => [
      {
        id: nextId++,
        account,
        threshold: Number(threshold),
        description: description.trim(),
      },
      ...prev,
    ])
    setAccount('')
    setThreshold('')
    setDescription('')
    setErrors({})
  }

  const remove = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Alerts</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Notify when an account crosses a monthly spend threshold.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="alert-account">Account</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger id="alert-account" className="w-full" aria-invalid={!!errors.account}>
                <SelectValue placeholder="Select account…" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && <p className="text-xs text-destructive">{errors.account}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert-threshold">Threshold (USD / month)</Label>
            <Input
              id="alert-threshold"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 50000"
              aria-invalid={!!errors.threshold}
            />
            {errors.threshold && <p className="text-xs text-destructive">{errors.threshold}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert-desc">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="alert-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Escalate to FinOps"
            />
          </div>

          <Button type="submit" className="w-full">
            Create alert
          </Button>
        </form>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Active alerts ({alerts.length})
          </p>
          {alerts.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              No alerts yet. Create one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.account}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Alert above {usd(a.threshold)}/mo
                      {a.description ? ` · ${a.description}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(a.id)}
                    className="h-7 shrink-0 px-2 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete alert for ${a.account}`}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
