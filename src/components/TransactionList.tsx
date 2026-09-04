import type { Folder, FolderAssignments, Transaction } from "../types";
import { TransactionRow } from "./TransactionRow";

interface Props {
  transactions: Transaction[];
  folders: Folder[];
  assignments: FolderAssignments;
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onRemoveFromFolder: (transactionId: string, folderId: string) => void;
}

export function TransactionList({
  transactions,
  folders,
  assignments,
  draggingId,
  onDragStart,
  onDragEnd,
  onRemoveFromFolder,
}: Props) {
  const folderById = new Map(folders.map((f) => [f.id, f]));

  if (transactions.length === 0) {
    return <p className="empty-state">No transactions in this view.</p>;
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => {
        const folderIds = assignments[transaction.id] ?? [];
        const assignedFolders = folderIds
          .map((id) => folderById.get(id))
          .filter((f): f is Folder => Boolean(f));

        return (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            assignedFolders={assignedFolders}
            isDragging={draggingId === transaction.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onRemoveFromFolder={(folderId) => onRemoveFromFolder(transaction.id, folderId)}
          />
        );
      })}
    </div>
  );
}
