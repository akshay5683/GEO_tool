import { notFound } from "next/navigation";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { COUNTRIES, LANGUAGES, type CountryCode, type LanguageCode } from "@/lib/markets";
import { hasOrgRole } from "@/server/auth/rbac";
import { requirePageContext } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import { getProject } from "@/server/projects/service";
import { archiveProjectAction } from "../actions";

export default async function ProjectPage({ params }: PageProps<"/dashboard/projects/[projectId]">) {
  const ctx = await requirePageContext();
  const { projectId } = await params;
  const project = await getProject(ctx, projectId).catch((error) => {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.domain}
        actions={<Button disabled title="Automatic audits are not available yet">Run audit</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Market</p>
          <p className="mt-1 font-medium">{COUNTRIES[project.country as CountryCode]?.name ?? project.country}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Languages</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.languages.map((lang) => (
              <Badge key={lang} tone="brand">{LANGUAGES[lang as LanguageCode] ?? lang}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Created</p>
          <p className="mt-1 font-medium">{new Date(project.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
        </Card>
      </div>
      <div className="mt-8">
        <EmptyState
          title="No audits yet"
          description="Automatic audits — website discovery, prompt generation and provider collection — are not available in this build yet. No visibility data is shown until a real audit has run."
        />
      </div>
      {hasOrgRole(ctx.role, "admin") ? (
        <form action={archiveProjectAction} className="mt-8">
          <input type="hidden" name="projectId" value={project.id} />
          <Button type="submit" variant="danger">Archive project</Button>
        </form>
      ) : null}
    </>
  );
}
