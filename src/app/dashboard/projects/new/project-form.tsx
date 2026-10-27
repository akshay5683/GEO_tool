"use client";

import { useActionState, useState } from "react";
import { Alert, Button, Card, Field, Input, Select } from "@/components/ui";
import { COUNTRIES, COUNTRY_CODES, LANGUAGES, LANGUAGE_CODES, type CountryCode } from "@/lib/markets";
import type { ActionState } from "@/server/action-state";
import { createProjectAction } from "../actions";

export function ProjectForm({ defaultDomain, defaultCountry }: { defaultDomain: string; defaultCountry: CountryCode }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createProjectAction, {});
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const defaults: readonly string[] = COUNTRIES[country].defaultLanguages;

  return (
    <Card className="max-w-xl">
      <form action={action} className="flex flex-col gap-5">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <Field label="Domain" htmlFor="domain" error={state.fieldErrors?.domain} hint="For example backlinksfusion.com">
          <Input id="domain" name="domain" defaultValue={defaultDomain} required placeholder="example.com" />
        </Field>
        <Field label="Project name" htmlFor="name" error={state.fieldErrors?.name} hint="Optional. Defaults to the domain.">
          <Input id="name" name="name" maxLength={100} />
        </Field>
        <Field label="Target country" htmlFor="country" error={state.fieldErrors?.country}>
          <Select id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value as CountryCode)}>
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>{COUNTRIES[code].name}</option>
            ))}
          </Select>
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium">Languages</legend>
          {/* Re-mount on country change so the defaults for the new market apply. */}
          <div key={country} className="flex flex-wrap gap-4">
            {LANGUAGE_CODES.map((code) => (
              <label key={code} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="languages" value={code} defaultChecked={defaults.includes(code)} className="accent-brand" />
                {LANGUAGES[code]}
              </label>
            ))}
          </div>
          {state.fieldErrors?.languages ? <p className="text-sm text-danger">{state.fieldErrors.languages}</p> : null}
        </fieldset>
        <div>
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create project"}</Button>
        </div>
      </form>
    </Card>
  );
}
