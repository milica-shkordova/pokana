import { ApiError } from "@pokanito/shared";
import { Button, Dialog, errorMessage } from "@pokanito/ui";

/** Why publishing was refused (the checklist issues the API sent back). */
export default function PublishErrorDialog({ error, onClose }: { error: unknown; onClose: () => void }) {
  return (
    <Dialog open={!!error} onClose={onClose} title="Not ready to publish yet" footer={<Button onClick={onClose}>OK</Button>}>
      {error instanceof ApiError && error.issues.length ? (
        <ul className="admin-issues">
          {error.issues.map((i) => (
            <li key={i.path}>{i.message}</li>
          ))}
        </ul>
      ) : (
        <p>{errorMessage(error)}</p>
      )}
    </Dialog>
  );
}
