import type { ReactNode } from "react";

export type ToastTone = "default" | "error";

export interface ToastItem {
  id: number;
  message: ReactNode;
  tone: ToastTone;
  /** Playing its exit animation; removed right after. */
  leaving?: boolean;
}

export type ShowToast = (message: ReactNode, tone?: ToastTone) => void;
