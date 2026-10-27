import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { RegisterForm } from "../auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <RegisterForm />
    </Suspense>
  );
}
