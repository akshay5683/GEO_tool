import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { COUNTRIES, LANGUAGES, type CountryCode, type LanguageCode } from "@/lib/markets";
import type { ProjectView } from "@/server/projects/service";

export function ProjectList({ projects }: { projects: ProjectView[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group">
          <Card className="h-full transition-colors group-hover:border-brand">
            <p className="font-medium">{project.name}</p>
            <p className="mt-1 font-mono text-sm text-muted">{project.domain}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{COUNTRIES[project.country as CountryCode]?.name ?? project.country}</Badge>
              {project.languages.map((lang) => (
                <Badge key={lang} tone="brand">{LANGUAGES[lang as LanguageCode] ?? lang}</Badge>
              ))}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
