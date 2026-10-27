import { Badge, Card, PageHeader } from "@/components/ui";
import { requireAdminPageContext } from "@/server/auth/session";
import { getConfigStatus } from "@/server/config";

export default async function AdminSystemPage() {
  await requireAdminPageContext();
  const items = getConfigStatus();

  return (
    <>
      <PageHeader
        title="System configuration"
        description="Shows whether each setting is present. Values are never displayed. Connectivity is verified by real use."
      />
      <Card className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="font-mono text-xs text-muted">{item.key}</p>
              </div>
              <div className="flex gap-2">
                {item.required ? <Badge>required</Badge> : <Badge>optional</Badge>}
                <Badge tone={item.configured ? "brand" : item.required ? "danger" : "warning"}>
                  {item.configured ? "configured" : "missing"}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
