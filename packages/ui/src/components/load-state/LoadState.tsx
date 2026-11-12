import type { ReactNode } from "react";
import { ApiError } from "@pokanito/shared";
import { errorMessage } from "../../utils/errorMessage";
import { Alert } from "../Alert";
import { Button } from "../Button";
import { Spinner } from "../Spinner";

export interface LoadStateProps {
  loading: boolean;
  error?: Error;
  onRetry?: () => void;
  children: ReactNode;
  /** Class of the box around the spinner (styled by the admin: .admin-loading). */
  loadingClassName?: string;
}

/** Spinner while loading, an error with retry on failure, otherwise children. */
export function LoadState({ loading, error, onRetry, children, loadingClassName = "admin-loading" }: LoadStateProps) {
  if (error) {
    return (
      <Alert tone="danger">
        {errorMessage(error)}{" "}
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Alert>
    );
  }
  if (loading) {
    return (
      <div className={loadingClassName}>
        <Spinner size="lg" />
      </div>
    );
  }
  return <>{children}</>;
}

/** Renders an API error, including per-field issues. */
export function IssueList({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : "Something went wrong";
  const issues = error instanceof ApiError ? error.issues : [];
  return (
    <Alert tone="danger">
      <strong>{message}</strong>
      {issues.length > 0 && (
        <ul>
          {issues.map((i) => (
            <li key={i.path + i.message}>{i.message}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
