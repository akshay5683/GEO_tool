import { PageHeader } from "@/components/ui";
import { COUNTRY_CODES, type CountryCode } from "@/lib/markets";
import { requirePageContext } from "@/server/auth/session";
import { ProjectForm } from "./project-form";

export default async function NewProjectPage({ searchParams }: PageProps<"/dashboard/projects/new">) {
  await requirePageContext();
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain.slice(0, 253) : "";
  const country = COUNTRY_CODES.includes(params.country as CountryCode) ? (params.country as CountryCode) : "DE";

  return (
    <>
      <PageHeader title="New project" description="Choose the domain and the market to measure." />
      <ProjectForm defaultDomain={domain} defaultCountry={country} />
    </>
  );
}
