export interface Transaction {
  id: string;
  date: string; // ISO date, e.g. 2026-08-14
  description: string;
  merchant: string;
  amount: number; // negative = money out, positive = money in
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  /** money allocated into this folder for the current month, e.g. a R2,000 petrol budget */
  budget: number;
}

// A transaction can belong to zero, one, or several folders (labels, not
// strict single-parent folders) — see design note in README.
export type FolderAssignments = Record<string, string[]>;
