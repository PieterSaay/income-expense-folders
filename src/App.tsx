import { useMemo, useState } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { TransactionList } from "./components/TransactionList";
import { seedFolders } from "./data/folders";
import { generateTransactions } from "./data/generateTransactions";
import { useFolderAssignments } from "./hooks/useFolderAssignments";
import type { Folder } from "./types";

function App() {
  const transactions = useMemo(() => generateTransactions(3), []);
  const [folders, setFolders] = useState<Folder[]>(seedFolders);
  const { assignments, assignToFolder, removeFromFolder, clearFolders } = useFolderAssignments();
  const [selectedView, setSelectedView] = useState("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const visibleTransactions = transactions.filter((t) => {
    const folderIds = assignments[t.id] ?? [];
    if (selectedView === "all") return true;
    if (selectedView === "unfiled") return folderIds.length === 0;
    return folderIds.includes(selectedView);
  });

  function handleDropOnFolder(transactionId: string, folderId: string) {
    if (folderId === "unfiled") clearFolders(transactionId);
    else assignToFolder(transactionId, folderId);
  }

  function handleCreateFolder(name: string, budget: number) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `folder-${Date.now()}`;
    if (folders.some((f) => f.id === id)) return;
    const palette = ["#e07a5f", "#3d5a80", "#8367c7", "#2a9d8f", "#e9c46a", "#f4a261", "#457b9d"];
    const color = palette[folders.length % palette.length];
    setFolders((prev) => [...prev, { id, name, color, budget }]);
  }

  function handleUpdateBudget(folderId: string, budget: number) {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, budget } : f)));
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Transaction Folders</h1>
        <p>Synthetic ledger — allocate your salary into folder budgets, then drag spending onto a folder to track it.</p>
      </header>
      <div className="app-body">
        <Sidebar
          folders={folders}
          transactions={transactions}
          assignments={assignments}
          selectedView={selectedView}
          onSelectView={setSelectedView}
          onDropOnFolder={handleDropOnFolder}
          onCreateFolder={handleCreateFolder}
          onUpdateBudget={handleUpdateBudget}
        />
        <main className="main-panel">
          <TransactionList
            transactions={visibleTransactions}
            folders={folders}
            assignments={assignments}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onRemoveFromFolder={removeFromFolder}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
