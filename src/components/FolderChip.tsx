import type { Folder } from "../types";

interface Props {
  folder: Folder;
  onRemove?: () => void;
}

export function FolderChip({ folder, onRemove }: Props) {
  return (
    <span className="folder-chip" style={{ backgroundColor: folder.color }}>
      {folder.name}
      {onRemove && (
        <button
          type="button"
          className="folder-chip-remove"
          aria-label={`Remove from ${folder.name}`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </span>
  );
}
