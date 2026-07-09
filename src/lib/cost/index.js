import rawCosts from '@/data/costs.json'
import summary from '@/data/summary.json'
import { buildAccountMeta } from './accounts'
import { ingestRecords } from './ingest'
import {
  accountAcceleration,
  buildAccountSummaries,
  computeKpis,
  monthlySeries,
  overspendInsight,
  serviceOverspend,
} from './aggregate'
import { sumBy } from './helpers'

export { RISK } from './constants'
export { riskBand } from './helpers'

// Single source of truth: clean, classify, dedupe, then derive every number here.
const accountMeta = buildAccountMeta(summary)
const { records, quality, issues } = ingestRecords(rawCosts, accountMeta)

export const costRecords = records
export const accountSummaries = buildAccountSummaries(records, accountMeta)
export const accounts = accountSummaries.map((a) => a.account_name)

export function getKpis() {
  return computeKpis(accountSummaries)
}

export function getMonthlySeries(account = 'all') {
  return monthlySeries(records, account)
}

export function getServiceOverspend() {
  return serviceOverspend(records)
}

export function getAccountAcceleration() {
  return accountAcceleration(accountSummaries, records)
}

export function getOverspendInsight() {
  const services = serviceOverspend(records).slice(0, 6)
  const acceleration = accountAcceleration(accountSummaries, records)
  return { services, ...overspendInsight(records, services, acceleration) }
}

const derivedGross = sumBy(accountSummaries, (a) => a.grossCost)

export const dataQuality = {
  ...quality,
  issues,
  adjustedRows: issues.length,
  derivedGross,
  summaryGross: summary.totals.total_cost,
  // Derived gross must equal the summary, or the cleaning rules are wrong.
  reconciled: derivedGross === summary.totals.total_cost,
}
