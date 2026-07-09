import { riskBand, sumBy } from './helpers'

function getOrCreateAccount(byId, record, accountMeta) {
  let account = byId.get(record.accountId)
  if (!account) {
    const meta = accountMeta[record.accountId]
    account = {
      account_id: record.accountId,
      account_name: record.account,
      owner: meta?.owner ?? record.owner,
      grossCost: 0,
      credits: 0,
      budget: meta?.budget ?? 0,
    }
    byId.set(record.accountId, account)
  }
  return account
}

function finalizeAccount(account) {
  const netCost = account.grossCost + account.credits
  const variance = netCost - account.budget
  const utilization_pct = account.budget ? (netCost / account.budget) * 100 : 0
  return { ...account, netCost, variance, utilization_pct, band: riskBand(utilization_pct) }
}

// Actuals from records, budget from the authoritative summary.
export function buildAccountSummaries(records, accountMeta) {
  const byId = new Map()
  for (const r of records) {
    const account = getOrCreateAccount(byId, r, accountMeta)
    if (!r.countInCost) continue
    if (r.isCredit) account.credits += r.cost
    else account.grossCost += r.cost
  }
  return [...byId.values()]
    .map(finalizeAccount)
    .sort((a, b) => b.utilization_pct - a.utilization_pct)
}

export function computeKpis(accountSummaries) {
  const grossCost = sumBy(accountSummaries, (a) => a.grossCost)
  const credits = sumBy(accountSummaries, (a) => a.credits)
  const budget = sumBy(accountSummaries, (a) => a.budget)
  const netCost = grossCost + credits
  return {
    grossCost,
    credits,
    netCost,
    totalBudget: budget,
    variance: netCost - budget,
    utilizationPct: budget ? (netCost / budget) * 100 : 0,
    accountCount: accountSummaries.length,
    overBudgetCount: accountSummaries.filter((a) => a.band === 'over').length,
    atRiskCount: accountSummaries.filter((a) => a.band === 'watch').length,
  }
}

function getMonthBucket(byMonth, record) {
  let bucket = byMonth.get(record.monthKey)
  if (!bucket) {
    bucket = {
      monthKey: record.monthKey,
      label: record.monthLabel,
      sortIndex: record.sortIndex,
      cost: 0,
      budget: 0,
    }
    byMonth.set(record.monthKey, bucket)
  }
  return bucket
}

export function monthlySeries(records, account = 'all') {
  const rows = account === 'all' ? records : records.filter((r) => r.account === account)
  const byMonth = new Map()
  for (const r of rows) {
    if (r.isDuplicate) continue
    const bucket = getMonthBucket(byMonth, r)
    // Budget counts even when cost is missing.
    bucket.budget += r.budget
    if (!r.isMissingCost) bucket.cost += r.cost
  }
  return [...byMonth.values()]
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((m) => ({ ...m, variance: m.cost - m.budget }))
}

function getServiceBucket(byService, record) {
  let bucket = byService.get(record.service)
  if (!bucket) {
    bucket = { service: record.service, cost: 0, budget: 0 }
    byService.set(record.service, bucket)
  }
  return bucket
}

export function serviceOverspend(records) {
  const byService = new Map()
  for (const r of records) {
    if (r.isDuplicate) continue
    const bucket = getServiceBucket(byService, r)
    bucket.budget += r.budget
    if (!r.isMissingCost) bucket.cost += r.cost
  }
  return [...byService.values()]
    .map((s) => ({ ...s, variance: s.cost - s.budget }))
    .filter((s) => s.variance > 0)
    .sort((a, b) => b.variance - a.variance)
}

function averageMonthlyChange(series) {
  const deltas = []
  for (let i = 1; i < series.length; i++) {
    deltas.push(series[i].variance - series[i - 1].variance)
  }
  return deltas.reduce((total, d) => total + d, 0) / deltas.length
}

function buildAcceleration(account, series) {
  return {
    account: account.account_name,
    owner: account.owner,
    slope: averageMonthlyChange(series),
    latestVariance: series[series.length - 1].variance,
    firstVariance: series[0].variance,
    band: account.band,
  }
}

// Accounts ranked by rising variance to catch the next problem early.
export function accountAcceleration(accountSummaries, records) {
  const out = []
  for (const account of accountSummaries) {
    const series = monthlySeries(records, account.account_name)
    if (series.length < 2) continue
    out.push(buildAcceleration(account, series))
  }
  return out.sort((a, b) => b.slope - a.slope)
}

function topAccountForService(records, service) {
  const byAccount = new Map()
  for (const r of records) {
    if (r.service !== service || !r.countInCost) continue
    const bucket = byAccount.get(r.account) ?? { account: r.account, variance: 0 }
    bucket.variance += r.variance
    byAccount.set(r.account, bucket)
  }
  return [...byAccount.values()].sort((a, b) => b.variance - a.variance)[0]
}

export function overspendInsight(records, services, acceleration) {
  const accelerator = acceleration.find((a) => a.slope > 0) ?? null
  const top = services[0]
  if (!top) return { lead: null, accelerator }

  const topAccount = topAccountForService(records, top.service)
  const share = topAccount ? topAccount.variance / top.variance : 0
  return { lead: { ...top, topAccount, share }, accelerator }
}
