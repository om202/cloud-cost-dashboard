import { canonicalAccountName, resolveOwner } from './accounts'
import { buildNaturalKey, classifyCost, clean, normalizeDate } from './helpers'

function emptyQuality(total) {
  return {
    ingested: total,
    unparseableDates: 0,
    datesNormalized: 0,
    namesCorrected: 0,
    missingExcluded: 0,
    creditsCount: 0,
    creditsAmount: 0,
    duplicatesDropped: 0,
  }
}

// Duplicate usage rows double-count spend, so keep only the first.
function isDuplicateUsage(chargeCategory, key, seenUsageKeys) {
  if (chargeCategory !== 'usage') return false
  if (seenUsageKeys.has(key)) return true
  seenUsageKeys.add(key)
  return false
}

function buildRecord(record, index, date, account, flags, accountMeta) {
  const { isMissingCost, isCredit, chargeCategory, isDuplicate } = flags
  const cost = isMissingCost ? null : record.cost
  const budget = typeof record.budget === 'number' ? record.budget : 0

  // A missing or duplicate row never counts toward totals.
  const countInCost = !isMissingCost && !isDuplicate
  const countInBudget = !isDuplicate

  return {
    id: `${index}-${record.account_id}-${clean(record.service)}-${date.iso}`,
    date: date.iso,
    monthKey: date.monthKey,
    monthLabel: date.label,
    sortIndex: date.sortIndex,
    accountId: record.account_id,
    account,
    service: clean(record.service),
    region: clean(record.region),
    owner: resolveOwner(record, accountMeta),
    cost,
    budget,
    variance: countInCost ? cost - budget : null,
    chargeCategory,
    isMissingCost,
    isCredit,
    isDuplicate,
    countInCost,
    countInBudget,
  }
}

export function ingestRecords(rawCosts, accountMeta) {
  const issues = []
  const records = []
  const quality = emptyQuality(rawCosts.length)
  const seenUsageKeys = new Set()

  rawCosts.forEach((raw, index) => {
    const date = normalizeDate(raw.date)
    if (!date) {
      quality.unparseableDates += 1
      issues.push({ row: index, field: 'date', kind: 'unparseable', value: raw.date })
      return
    }
    if (date.reformatted) quality.datesNormalized += 1

    const account = canonicalAccountName(raw, accountMeta)
    if (clean(raw.account_name) !== account) quality.namesCorrected += 1

    const { isMissingCost, isCredit, chargeCategory } = classifyCost(raw.cost)
    const key = buildNaturalKey(raw, date.iso, chargeCategory)
    const isDuplicate = isDuplicateUsage(chargeCategory, key, seenUsageKeys)

    if (isDuplicate) {
      quality.duplicatesDropped += 1
      issues.push({ row: index, field: 'row', kind: 'duplicate', value: key })
    }
    if (isMissingCost) {
      quality.missingExcluded += 1
      issues.push({ row: index, field: 'cost', kind: 'missing', value: raw.cost })
    }
    if (isCredit) {
      quality.creditsCount += 1
      quality.creditsAmount += raw.cost
    }

    const flags = { isMissingCost, isCredit, chargeCategory, isDuplicate }
    records.push(buildRecord(raw, index, date, account, flags, accountMeta))
  })

  return { records, quality, issues }
}
