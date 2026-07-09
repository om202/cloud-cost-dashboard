import { MONTHS, RISK } from './constants'

export const clean = (v) => (typeof v === 'string' ? v.trim() : v)

export const sumBy = (list, fn) => list.reduce((total, item) => total + fn(item), 0)

export function classifyCost(rawCost) {
  const isMissingCost = rawCost === null || rawCost === undefined
  const isCredit = !isMissingCost && rawCost < 0
  const chargeCategory = isCredit ? 'credit' : 'usage'
  return { isMissingCost, isCredit, chargeCategory }
}

export function buildNaturalKey(record, iso, category) {
  return [
    record.account_id,
    clean(record.service),
    clean(record.region),
    iso,
    category,
  ].join('|')
}

export function riskBand(utilizationPct) {
  if (utilizationPct > RISK.over) return 'over'
  if (utilizationPct >= RISK.watch) return 'watch'
  return 'healthy'
}

export function normalizeDate(raw) {
  const s = String(raw ?? '').trim()
  const parts = parseDateParts(s)
  if (!parts) return null

  const { y, m, d } = parts
  if (m < 1 || m > 12 || d < 1 || d > 31) return null

  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return {
    iso: `${y}-${mm}-${dd}`,
    monthKey: `${y}-${mm}`,
    label: MONTHS[m - 1],
    sortIndex: y * 12 + m,
    reformatted: !/^\d{4}-\d{2}-\d{2}$/.test(s),
  }
}

function parseDateParts(s) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    return { y, m, d }
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [m, d, y] = s.split('/').map(Number)
    return { y, m, d }
  }
  return null
}
