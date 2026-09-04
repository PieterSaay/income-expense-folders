import { useCallback, useEffect, useState } from "react";
import type { FolderAssignments } from "../types";

const STORAGE_KEY = "income-expense-folders/assignments";

function load(): FolderAssignments {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FolderAssignments) : {};
  } catch {
    return {};
  }
}

/**
 * Folder assignments live separately from the (read-only, bank-sourced)
 * transaction list — this is the annotation layer described in the design
 * notes, keyed by transaction id -> folder ids.
 */
export function useFolderAssignments() {
  const [assignments, setAssignments] = useState<FolderAssignments>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const assignToFolder = useCallback((transactionId: string, folderId: string) => {
    setAssignments((prev) => {
      const current = prev[transactionId] ?? [];
      if (current.includes(folderId)) return prev;
      return { ...prev, [transactionId]: [...current, folderId] };
    });
  }, []);

  const removeFromFolder = useCallback((transactionId: string, folderId: string) => {
    setAssignments((prev) => {
      const current = prev[transactionId] ?? [];
      const next = current.filter((id) => id !== folderId);
      return { ...prev, [transactionId]: next };
    });
  }, []);

  return { assignments, assignToFolder, removeFromFolder };
}
