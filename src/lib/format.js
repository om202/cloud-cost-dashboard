export const usd = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

export const usdCompact = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n ?? 0)

export const pct = (n, digits = 1) => `${(n ?? 0).toFixed(digits)}%`

export const signedUsd = (n) => {
  const v = n ?? 0
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${sign}${usd(Math.abs(v))}`
}

export const monthLabel = (monthKey) => {
  const [y, m] = monthKey.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(m) - 1]} ${y}`
}
