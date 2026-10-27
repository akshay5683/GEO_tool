import { ProjectList } from "@/components/project-list";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { requirePageContext } from "@/server/auth/session";
import { listProjects } from "@/server/projects/service";

export default async function ProjectsPage() {
  const ctx = await requirePageContext();
  const projects = await listProjects(ctx);
  return (
    <>
      <PageHeader
        title="Projects"
        description="Each project tracks one domain in one market."
        actions={<ButtonLink href="/dashboard/projects/new">New project</ButtonLink>}
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add a domain and target market to start."
          action={<ButtonLink href="/dashboard/projects/new">New project</ButtonLink>}
        />
      ) : (
        <ProjectList projects={projects} />
      )}
    </>
  );
}
