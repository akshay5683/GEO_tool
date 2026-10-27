"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Alert, Button, Card, Field, Input } from "@/components/ui";
import type { ActionState } from "@/server/action-state";
import { loginAction, registerAction } from "./actions";

function withNext(path: string, next: string | null) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

export function LoginForm() {
  const next = useSearchParams().get("next");
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <Card>
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? ""} />
        {state.error ? <Alert>{state.error}</Alert> : null}
        <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        No account?{" "}
        <Link href={withNext("/register", next)} className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}

export function RegisterForm() {
  const next = useSearchParams().get("next");
  const [state, action, pending] = useActionState<ActionState, FormData>(registerAction, {});
  return (
    <Card>
      <h1 className="text-xl font-semibold">Create your account</h1>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? ""} />
        {state.error ? <Alert>{state.error}</Alert> : null}
        <Field label="Your name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" autoComplete="name" required maxLength={100} />
        </Field>
        <Field label="Work email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={state.fieldErrors?.password}
          hint="At least 12 characters."
        >
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
        </Field>
        <Field
          label="Organization name"
          htmlFor="organizationName"
          error={state.fieldErrors?.organizationName}
          hint="Optional. You can rename it later."
        >
          <Input id="organizationName" name="organizationName" maxLength={100} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link href={withNext("/login", next)} className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
