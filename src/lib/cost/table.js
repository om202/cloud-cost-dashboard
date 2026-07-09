const ASC_BY_DEFAULT = new Set(['date', 'account', 'service', 'region'])

export function filterRecords(records, query) {
  const q = query.trim().toLowerCase()
  if (!q) return records
  return records.filter((r) =>
    [r.account, r.service, r.region, r.owner].some((field) =>
      String(field).toLowerCase().includes(q),
    ),
  )
}

// Missing values always sort to the bottom, whatever the direction.
function compareValues(av, bv, mult) {
  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1
  if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
  return String(av).localeCompare(String(bv)) * mult
}

export function compareRecords(a, b, sort) {
  const mult = sort.dir === 'asc' ? 1 : -1
  if (sort.key === 'date') return (a.sortIndex - b.sortIndex) * mult
  return compareValues(a[sort.key], b[sort.key], mult)
}

export function sortRecords(records, sort) {
  return [...records].sort((a, b) => compareRecords(a, b, sort))
}

export function nextSort(current, key) {
  if (current.key === key) {
    return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
  }
  return { key, dir: ASC_BY_DEFAULT.has(key) ? 'asc' : 'desc' }
}
