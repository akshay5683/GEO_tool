"use client";

import { RouteError } from "@/components/route-error";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24">
      <RouteError {...props} />
    </div>
  );
}
