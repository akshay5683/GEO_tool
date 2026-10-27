import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted">The page does not exist, or you do not have access to it.</p>
      <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
    </div>
  );
}
