import { useState, type ReactNode } from "react";
import { cx } from "../cx";

export interface DropZoneProps {
  /** Files dropped on the zone. */
  onFiles: (files: FileList) => void;
  /** Click: usually opens a hidden file input. */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/** File drop target (a button): highlights while files are dragged over it. */
export function DropZone({ onFiles, onClick, disabled, className, children }: DropZoneProps) {
  const [over, setOver] = useState(false);
  return (
    <button
      type="button"
      className={cx("ui-dropzone", over && "ui-dropzone--over", className)}
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(e.dataTransfer.files);
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
