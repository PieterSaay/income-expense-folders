import { useState } from "react";
import type { Folder, FolderAssignments, Transaction } from "../types";

interface Props {
  folders: Folder[];
  transactions: Transaction[];
  assignments: FolderAssignments;
  selectedView: string;
  onSelectView: (view: string) => void;
  onDropOnFolder: (transactionId: string, folderId: string) => void;
  onCreateFolder: (name: string) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export function Sidebar({
  folders,
  transactions,
  assignments,
  selectedView,
  onSelectView,
  onDropOnFolder,
  onCreateFolder,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

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

  function handleDrop(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    setDragOverId(null);
    const transactionId = e.dataTransfer.getData("text/plain");
    if (transactionId) onDropOnFolder(transactionId, folderId);
  }

  return (
    <aside className="sidebar">
      <h2>Folders</h2>
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
          >
            <span>Unfiled</span>
            <span className="folder-count">{unfiledCount}</span>
          </button>
        </li>
      </ul>

      <ul className="folder-list">
        {folders.map((folder) => {
          const { count, total } = totalsFor(folder.id);
          return (
            <li key={folder.id}>
              <button
                type="button"
                className={`folder-list-item${selectedView === folder.id ? " active" : ""}${
                  dragOverId === folder.id ? " drag-over" : ""
                }`}
                style={{ borderLeftColor: folder.color }}
                onClick={() => onSelectView(folder.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(folder.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <span>{folder.name}</span>
                <span className="folder-meta">
                  <span className="folder-count">{count}</span>
                  <span className="folder-total">{currencyFormatter.format(total)}</span>
                </span>
              </button>
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
          onCreateFolder(trimmed);
          setNewFolderName("");
        }}
      >
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <p className="sidebar-hint">Drag a transaction row onto a folder to file it.</p>
    </aside>
  );
}
