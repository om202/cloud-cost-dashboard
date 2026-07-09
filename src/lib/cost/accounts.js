import { ACCOUNT_ALIASES } from './constants'
import { clean } from './helpers'

export function buildAccountMeta(summary) {
  return summary.accounts.reduce((meta, a) => {
    meta[a.account_id] = { name: a.account_name, owner: a.owner, budget: a.total_budget }
    return meta
  }, {})
}

export function canonicalAccountName(record, accountMeta) {
  const byId = accountMeta[record.account_id]?.name
  if (byId) return byId
  const name = clean(record.account_name)
  return ACCOUNT_ALIASES[name] ?? name
}

export function resolveOwner(record, accountMeta) {
  const own = clean(record.owner)
  if (own) return own
  return accountMeta[record.account_id]?.owner ?? 'Unknown'
}
