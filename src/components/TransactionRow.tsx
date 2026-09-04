import type { Folder, Transaction } from "../types";
import { FolderChip } from "./FolderChip";

interface Props {
  transaction: Transaction;
  assignedFolders: Folder[];
  onRemoveFromFolder: (folderId: string) => void;
  isDragging: boolean;
  onDragStart: (transactionId: string) => void;
  onDragEnd: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

export function TransactionRow({
  transaction,
  assignedFolders,
  onRemoveFromFolder,
  isDragging,
  onDragStart,
  onDragEnd,
}: Props) {
  const isCredit = transaction.amount > 0;

  return (
    <div
      className={`transaction-row${isDragging ? " dragging" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", transaction.id);
        e.dataTransfer.effectAllowed = "copy";
        onDragStart(transaction.id);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="transaction-date">{transaction.date}</div>
      <div className="transaction-details">
        <div className="transaction-description">{transaction.description}</div>
        <div className="transaction-merchant">{transaction.merchant}</div>
      </div>
      <div className="transaction-folders">
        {assignedFolders.map((folder) => (
          <FolderChip
            key={folder.id}
            folder={folder}
            onRemove={() => onRemoveFromFolder(folder.id)}
          />
        ))}
      </div>
      <div className={`transaction-amount${isCredit ? " credit" : ""}`}>
        {currencyFormatter.format(transaction.amount)}
      </div>
    </div>
  );
}
