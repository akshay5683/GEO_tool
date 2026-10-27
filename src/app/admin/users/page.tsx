import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { listUsers } from "@/server/admin/service";
import { requireAdminPageContext } from "@/server/auth/session";
import { setUserStatusAction } from "../actions";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "—";

export default async function AdminUsersPage() {
  const ctx = await requireAdminPageContext();
  const users = await listUsers(ctx);

  return (
    <>
      <PageHeader title="Users" description={`${users.length} most recent accounts.`} />
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orgs</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-4 py-3">{user.systemRole === "admin" ? <Badge tone="brand">admin</Badge> : "user"}</td>
                <td className="px-4 py-3 tabular-nums">{user.organizations}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.status === "active" ? "neutral" : "danger"}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.id === ctx.userId ? null : (
                    <form action={setUserStatusAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value={user.status === "active" ? "suspended" : "active"} />
                      <Button type="submit" variant={user.status === "active" ? "danger" : "secondary"} className="h-8">
                        {user.status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
