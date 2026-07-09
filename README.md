# Cloud Cost Dashboard

Submitted By: Omprakash Sah Kanu

A single page dashboard for cloud spend vs budget. It is built for a VP who needs the state of spending in about 60 seconds.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

Data is read from `src/data/costs.json` and `src/data/summary.json`. There is no backend.

## Packages used

- React 18
- Vite
- Tailwind CSS v4
- Recharts
- shadcn/ui
- Radix UI
- lucide-react
- Inter font

## Data rules followed

- Every row is tagged as usage or credit.
- Credits are kept separate. Gross and net are tracked apart.
- A null cost is not treated as zero. It is excluded from totals and flagged.
- Duplicate usage rows are removed on a natural key. First row wins.
- All actual numbers come from the detail records.
- Budgets come from the summary file. It is the authoritative target.
- Utilization uses three bands. Healthy, at risk from 90 percent, and over budget.

## Reconciliation

The derived gross spend is rebuilt from the raw records. It equals the summary file to the dollar at 1,386,680. This proves the cleaning rules are correct. The app shows this as a banner.

## Important files

- `src/data/`
  The raw input files, `costs.json` and `summary.json`. Nothing else lives here.

- `src/lib/cost/`
  The cost data layer. `index.js` is the public API. Around it sit `constants`, `types`, `helpers`, `accounts`, `ingest`, `aggregate`, and `table`. This is the single source of truth for every number the UI shows.

- `src/components/DataQualityBanner.jsx`
  Shows the reconciliation result and every adjustment made. Nothing is hidden.

- `src/components/KpiSection.jsx`
  Top cards and per account utilization bars with risk bands.

- `src/components/TrendChart.jsx`
  Cost vs budget over six months with an account filter.

- `src/components/CostTable.jsx`
  Sortable and searchable detail table. Excluded rows are marked.

- `src/components/InsightSection.jsx`
  Ranks overspend by size and flags the account rising fastest.

- `src/components/BudgetAlertForm.jsx`
  Local form to create and delete budget alerts.

## What and why

- Split the source of truth by data kind.
  Actuals come from records. Budgets come from the summary. This matches how billing and budgeting data are made in real life.

- Show a reconciliation banner.
  Two inputs feed one view. The banner proves they agree. If they ever differ, it will say so.

- Use risk bands instead of over or under only.
  An account at 99 percent and one at 140 percent are not the same. Bands make that clear.

- Add an acceleration signal in insights.
  The biggest overspend is already known. The fastest rising account is the next problem.

## What I would improve with more time

- Amortized and blended cost views. There are no commitments in this data.
- Statistical anomaly detection with z score or IQR. This needs more history.
- Cumulative pacing against the yearly budget.
- Persist alerts and add CSV export.
