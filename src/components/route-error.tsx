"use client";

import { Alert, Button } from "@/components/ui";

export function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <Alert>
        This page could not be loaded. If the problem persists, check that the service is configured (see the
        README) and contact support with the reference below.
      </Alert>
      {error.digest ? <p className="font-mono text-xs text-muted">Reference: {error.digest}</p> : null}
      <div>
        <Button variant="secondary" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
