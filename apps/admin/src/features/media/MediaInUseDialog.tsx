import { Button, Dialog } from "@pokanito/ui";
import type { InUseConfirm } from "./types";

/** "This file is in use": shown when a delete was refused with 409. */
export default function MediaInUseDialog({
  confirm,
  onClose,
  onForce,
}: {
  confirm: InUseConfirm | null;
  onClose: () => void;
  onForce: (c: InUseConfirm) => void;
}) {
  return (
    <Dialog
      open={!!confirm}
      onClose={onClose}
      title="This file is in use"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep it
          </Button>
          <Button variant="danger" onClick={() => confirm && onForce(confirm)}>
            Delete anyway
          </Button>
        </>
      }
    >
      <p>
        {confirm?.message}. Deleting it leaves an empty spot on {confirm && confirm.item.usedIn.length > 1 ? "those invitations" : "that invitation"}.
      </p>
    </Dialog>
  );
}
