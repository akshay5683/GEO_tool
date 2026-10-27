import { ProjectList } from "@/components/project-list";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { requirePageContext } from "@/server/auth/session";
import { listProjects } from "@/server/projects/service";

export default async function DashboardPage() {
  const ctx = await requirePageContext();
  const projects = await listProjects(ctx);

  return (
    <>
      <PageHeader
        title={`Welcome, ${ctx.name.split(" ")[0]}`}
        description={`${ctx.organizationName} · ${projects.length} active project${projects.length === 1 ? "" : "s"}`}
        actions={<ButtonLink href="/dashboard/projects/new">New project</ButtonLink>}
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project for a domain and market. Once audits are enabled, visibility scores, citations and competitors will appear here — calculated only from real provider answers."
          action={<ButtonLink href="/dashboard/projects/new">Create your first project</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <Card>
            <h2 className="font-medium">Visibility metrics</h2>
            <p className="mt-2 text-sm text-muted">
              No audits have run yet, so there are no metrics to show. Automatic audits (website discovery, prompt
              generation and provider collection) are the next milestone in development.
            </p>
          </Card>
          <section>
            <h2 className="mb-4 font-medium">Projects</h2>
            <ProjectList projects={projects.slice(0, 6)} />
          </section>
        </div>
      )}
    </>
  );
}
