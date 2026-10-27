import { switchOrganizationAction } from "@/app/(auth)/actions";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { listMyOrganizations } from "@/server/auth/service";
import { requirePageContext } from "@/server/auth/session";

export default async function SettingsPage() {
  const ctx = await requirePageContext();
  const organizations = await listMyOrganizations(ctx);

  return (
    <>
      <PageHeader title="Settings" description="Your account and organizations." />
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="font-medium">Account</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted">Name</dt>
            <dd>{ctx.name}</dd>
            <dt className="text-muted">Email</dt>
            <dd>{ctx.email}</dd>
          </dl>
        </Card>
        <Card>
          <h2 className="font-medium">Organizations</h2>
          <ul className="mt-4 divide-y divide-border">
            {organizations.map((org) => (
              <li key={org.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{org.name}</span>
                  <Badge>{org.role}</Badge>
                  {org.status !== "active" ? <Badge tone="danger">{org.status}</Badge> : null}
                </div>
                {org.id === ctx.organizationId ? (
                  <Badge tone="brand">Current</Badge>
                ) : (
                  <form action={switchOrganizationAction}>
                    <input type="hidden" name="organizationId" value={org.id} />
                    <Button type="submit" variant="secondary" className="h-8">Switch</Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
