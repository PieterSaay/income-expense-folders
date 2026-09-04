# Transaction Folders

A prototype of a drag-and-drop categorization layer for bank transactions,
scaffolded against a synthetic (fake) ledger — see the discussion in the
project history for the full pros/cons analysis behind this idea.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. A ~3-month synthetic transaction ledger loads
automatically (deterministic, seeded — same data every run).

## What's here

- **`src/data/generateTransactions.ts`** — deterministic synthetic ledger
  generator (groceries, petrol, debit orders, entertainment, health, salary),
  standing in for a real bank export until this is wired to one.
- **`src/types.ts`** — `Transaction`, `Folder`, and `FolderAssignments` data
  model.
- **`src/hooks/useFolderAssignments.ts`** — the annotation layer: which
  transaction ids belong to which folder ids, persisted to `localStorage`.
- **`src/components/`** — `Sidebar` (folder list + drop targets + totals),
  `TransactionList` / `TransactionRow` (the draggable ledger), `FolderChip`.

## Key design decision: labels, not strict folders

A transaction can belong to **zero, one, or several** folders — modeled as
`FolderAssignments = Record<transactionId, folderId[]>` — the same way
Gmail labels work, rather than a strict single-parent folder tree. This
matters in practice: a fuel purchase paid by debit order is legitimately
both "Petrol" and "Debit Orders" at once, and a single-folder model can't
represent that without arbitrary tie-breaking. The UI still *feels* like
dragging into a folder; the data underneath just doesn't force exclusivity.

## What this doesn't do (yet)

- **No real bank connection.** Transactions are read-only and synthetic.
  A production version would sync from a bank export/Open Banking API and
  keep folder assignments in a separate store, never mutating the bank's
  own record — see the design notes on why write-back to a bank isn't
  feasible.
- **No auto-categorization rules.** Every transaction is filed manually by
  drag-and-drop. A natural next step is "always file transactions from
  merchant X into folder Y," with manual drag as the fallback for
  exceptions.
- **No split transactions.** A transaction is filed as a whole; partial-
  amount splitting across folders (e.g. one supermarket trip split between
  groceries and household) isn't modeled.
