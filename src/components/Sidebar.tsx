import { useState } from "react";
import type { Folder, FolderAssignments, Transaction } from "../types";

interface Props {
  folders: Folder[];
  transactions: Transaction[];
  assignments: FolderAssignments;
  selectedView: string;
  onSelectView: (view: string) => void;
  onDropOnFolder: (transactionId: string, folderId: string) => void;
  onCreateFolder: (name: string, budget: number) => void;
  onUpdateBudget: (folderId: string, budget: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

function isThisMonth(dateIso: string) {
  const now = new Date();
  const [year, month] = dateIso.split("-").map(Number);
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

export function Sidebar({
  folders,
  transactions,
  assignments,
  selectedView,
  onSelectView,
  onDropOnFolder,
  onCreateFolder,
  onUpdateBudget,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderBudget, setNewFolderBudget] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState("");

  const unfiledCount = transactions.filter((t) => (assignments[t.id] ?? []).length === 0).length;

  function totalsFor(folderId: string | null) {
    const matching = transactions.filter((t) =>
      folderId === null
        ? (assignments[t.id] ?? []).length === 0
        : (assignments[t.id] ?? []).includes(folderId),
    );
    const total = matching.reduce((sum, t) => sum + t.amount, 0);
    return { count: matching.length, total };
  }

  /** money spent out of a folder this month — debits only, budgets don't track income filed into a folder */
  function spentThisMonth(folderId: string) {
    return transactions
      .filter((t) => isThisMonth(t.date) && t.amount < 0 && (assignments[t.id] ?? []).includes(folderId))
      .reduce((sum, t) => sum + -t.amount, 0);
  }

  const monthlyIncome = transactions
    .filter((t) => isThisMonth(t.date) && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBudgeted = folders.reduce((sum, f) => sum + f.budget, 0);
  const unallocated = monthlyIncome - totalBudgeted;

  function handleDrop(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    setDragOverId(null);
    const transactionId = e.dataTransfer.getData("text/plain");
    if (transactionId) onDropOnFolder(transactionId, folderId);
  }

  function startEditingBudget(folder: Folder) {
    setEditingBudgetId(folder.id);
    setBudgetDraft(String(folder.budget));
  }

  function saveBudget(folderId: string) {
    const value = Math.max(0, Math.round(Number(budgetDraft) || 0));
    onUpdateBudget(folderId, value);
    setEditingBudgetId(null);
  }

  return (
    <aside className="sidebar">
      <h2>Folders</h2>

      <div className="income-summary">
        <div className="income-summary-row">
          <span>Income this month</span>
          <span>{currencyFormatter.format(monthlyIncome)}</span>
        </div>
        <div className="income-summary-row">
          <span>Allocated</span>
          <span>{currencyFormatter.format(totalBudgeted)}</span>
        </div>
        <div className={`income-summary-row${unallocated < 0 ? " over" : ""}`}>
          <span>{unallocated < 0 ? "Over-allocated" : "Unallocated"}</span>
          <span>{currencyFormatter.format(Math.abs(unallocated))}</span>
        </div>
      </div>

      <ul className="folder-list">
        <li>
          <button
            type="button"
            className={`folder-list-item${selectedView === "all" ? " active" : ""}`}
            onClick={() => onSelectView("all")}
          >
            <span>All Transactions</span>
            <span className="folder-count">{transactions.length}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`folder-list-item${selectedView === "unfiled" ? " active" : ""}${
              dragOverId === "unfiled" ? " drag-over" : ""
            }`}
            onClick={() => onSelectView("unfiled")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverId("unfiled");
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, "unfiled")}
          >
            <span>Unfiled</span>
            <span className="folder-count">{unfiledCount}</span>
          </button>
        </li>
      </ul>

      <ul className="folder-list">
        {folders.map((folder) => {
          const { count } = totalsFor(folder.id);
          const spent = spentThisMonth(folder.id);
          const remaining = folder.budget - spent;
          const isOver = remaining < 0;
          const percentUsed = folder.budget > 0 ? Math.min(100, (spent / folder.budget) * 100) : spent > 0 ? 100 : 0;
          const isEditing = editingBudgetId === folder.id;

          return (
            <li key={folder.id} className="folder-item">
              <div
                className={`folder-list-item${selectedView === folder.id ? " active" : ""}${
                  dragOverId === folder.id ? " drag-over" : ""
                }`}
                style={{ borderLeftColor: folder.color }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(folder.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <button type="button" className="folder-select" onClick={() => onSelectView(folder.id)}>
                  <span>{folder.name}</span>
                  <span className="folder-count">{count}</span>
                </button>
              </div>

              <div className="folder-budget">
                <div className="budget-bar">
                  <div
                    className={`budget-bar-fill${isOver ? " over" : ""}`}
                    style={{ width: `${percentUsed}%`, backgroundColor: isOver ? undefined : folder.color }}
                  />
                </div>
                {isEditing ? (
                  <form
                    className="budget-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveBudget(folder.id);
                    }}
                  >
                    <span>R</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      autoFocus
                      value={budgetDraft}
                      onChange={(e) => setBudgetDraft(e.target.value)}
                      onBlur={() => saveBudget(folder.id)}
                    />
                  </form>
                ) : (
                  <button type="button" className="budget-text" onClick={() => startEditingBudget(folder)}>
                    <span className="budget-spent-line">
                      {currencyFormatter.format(spent)} of {currencyFormatter.format(folder.budget)}
                    </span>
                    <span className={`budget-remaining-line ${isOver ? "over" : "under"}`}>
                      {isOver
                        ? `${currencyFormatter.format(-remaining)} over budget`
                        : `${currencyFormatter.format(remaining)} left`}
                    </span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form
        className="new-folder-form"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newFolderName.trim();
          if (!trimmed) return;
          onCreateFolder(trimmed, Math.max(0, Math.round(Number(newFolderBudget) || 0)));
          setNewFolderName("");
          setNewFolderBudget("");
        }}
      >
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <input
          type="number"
          min={0}
          step={50}
          placeholder="Budget"
          className="new-folder-budget"
          value={newFolderBudget}
          onChange={(e) => setNewFolderBudget(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <p className="sidebar-hint">
        Drag a transaction row onto a folder to file it. Click a folder's budget line to edit it.
      </p>
    </aside>
  );
}
