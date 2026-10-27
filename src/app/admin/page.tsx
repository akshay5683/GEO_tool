import { Card, PageHeader } from "@/components/ui";
import { getAdminOverview } from "@/server/admin/service";
import { requireAdminPageContext } from "@/server/auth/session";

export default async function AdminOverviewPage() {
  const ctx = await requireAdminPageContext();
  const overview = await getAdminOverview(ctx);
  const stats = [
    ["Users", overview.users],
    ["Suspended users", overview.suspendedUsers],
    ["Organizations", overview.organizations],
    ["Active projects", overview.projects],
    ["Active sessions", overview.activeSessions],
  ] as const;

  return (
    <>
      <PageHeader title="Admin overview" description="Live counts from the database." />
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
