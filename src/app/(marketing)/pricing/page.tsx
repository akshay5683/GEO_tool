import type { Metadata } from "next";
import { ButtonLink, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Free check",
    summary: "A single sampled audit for one domain and market, to see how AI answers treat your brand.",
  },
  {
    name: "Pro",
    summary: "Multiple projects, scheduled rescans, historical trends and competitor tracking.",
  },
  {
    name: "Agency",
    summary: "Many client projects, team roles, higher scan budgets and exportable reports.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every scan calls paid AI and search APIs, so plans are based on scan credits. Prices and exact limits are
        still being finalized and will be published here before paid plans open.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm font-medium text-muted">Price to be announced</p>
            <p className="mt-4 flex-1 text-sm text-muted">{plan.summary}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10">
        <ButtonLink href="/register">Create a free account</ButtonLink>
      </div>
    </div>
  );
}
