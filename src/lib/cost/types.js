// Shared shapes used across the data layer (JSDoc only, no runtime code).

/**
 * @typedef {Object} CostRecord
 * @property {string} id
 * @property {string} date
 * @property {string} monthKey
 * @property {string} monthLabel
 * @property {number} sortIndex
 * @property {string} accountId
 * @property {string} account
 * @property {string} service
 * @property {string} region
 * @property {string} owner
 * @property {number|null} cost
 * @property {number} budget
 * @property {number|null} variance
 * @property {'usage'|'credit'} chargeCategory
 * @property {boolean} isMissingCost
 * @property {boolean} isCredit
 * @property {boolean} isDuplicate
 * @property {boolean} countInCost
 * @property {boolean} countInBudget
 */

/**
 * @typedef {Object} AccountSummary
 * @property {string} account_id
 * @property {string} account_name
 * @property {string} owner
 * @property {number} grossCost
 * @property {number} credits
 * @property {number} netCost
 * @property {number} budget
 * @property {number} variance
 * @property {number} utilization_pct
 * @property {'healthy'|'watch'|'over'} band
 */

/**
 * @typedef {Object} MonthPoint
 * @property {string} monthKey
 * @property {string} label
 * @property {number} sortIndex
 * @property {number} cost
 * @property {number} budget
 * @property {number} variance
 */

export {}
