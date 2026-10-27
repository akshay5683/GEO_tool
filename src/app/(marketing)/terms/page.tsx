import type { Metadata } from "next";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of service</h1>
      <div className="mt-6">
        <Alert tone="warning">
          Placeholder — this page has not been written or reviewed by a lawyer. It must be completed and receive legal
          review before the service is offered publicly.
        </Alert>
      </div>
    </article>
  );
}
