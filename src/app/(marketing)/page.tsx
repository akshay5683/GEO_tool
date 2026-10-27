import { Button, Card, Input, Select } from "@/components/ui";
import { COUNTRIES, COUNTRY_CODES } from "@/lib/markets";

const steps = [
  {
    title: "Enter a domain",
    body: "Pick the website and the market you care about, for example backlinksfusion.com in Germany.",
  },
  {
    title: "Automatic discovery",
    body: "We safely crawl a bounded set of public pages to identify the brand, services, topics and likely competitors.",
  },
  {
    title: "Real-data collection",
    body: "Neutral, market-specific questions are sent to supported AI and search APIs. Every answer and citation is stored.",
  },
  {
    title: "Sampled visibility report",
    body: "See mention and citation rates, competitors and source URLs, each traceable to the underlying answers.",
  },
];

const features = [
  ["No manual prompt writing", "Prompts are generated from your site and market. Advanced users can still edit or add their own."],
  ["Source-level evidence", "Every metric links back to the stored answer, provider, model and timestamp it came from."],
  ["Competitor share of voice", "Detected competitors are deduplicated and compared under the same prompt and provider cohort."],
  ["Honest failure handling", "Failed or unavailable provider results are shown as unavailable, never counted as zero visibility."],
  ["Historical snapshots", "Scheduled rescans build a timeline, with warnings when prompt sets or providers change."],
  ["Built for teams", "Organizations, roles and strict data isolation between customers."],
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28">
        <p className="text-sm font-medium text-brand">AI search visibility monitoring</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Find out whether AI answers recommend your brand — with the sources to prove it.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Enter a domain. We discover what the business does, ask AI search providers the questions its customers ask,
          and report how often the brand is mentioned and cited.
        </p>
        <Card className="mt-10 max-w-3xl">
          <form action="/dashboard/projects/new" method="get" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="hero-domain" className="sr-only">Domain</label>
            <Input id="hero-domain" name="domain" placeholder="yourdomain.com" required className="sm:flex-1" />
            <label htmlFor="hero-country" className="sr-only">Country</label>
            <Select id="hero-country" name="country" defaultValue="DE" className="sm:w-48">
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>{COUNTRIES[code].name}</option>
              ))}
            </Select>
            <Button type="submit">Start audit</Button>
          </form>
          <p className="mt-3 text-xs text-muted">
            Requires a free account. Results are sampled answers at a point in time, not a universal measurement.
          </p>
        </Card>
      </section>

      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong">
                  {index + 1}
                </span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, body]) => (
            <Card key={title}>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">What we measure — and what we don&apos;t</h2>
          <div className="mt-6 grid gap-6 text-sm text-muted sm:grid-cols-2">
            <p>
              We query official provider APIs, such as OpenAI with web search and Gemini with Google Search grounding, and
              analyze the answers they return. These are sampled, web-grounded answers for your market and language.
            </p>
            <p>
              They are not a capture of what every consumer sees in ChatGPT or Gemini, and we never scrape private
              conversations. Our composite score is our own documented formula, not an industry standard.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
