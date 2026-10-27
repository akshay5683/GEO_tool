import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

const metrics = [
  ["Brand mention rate", "Successful eligible responses that mention the target brand ÷ all successful eligible responses in the same cohort × 100."],
  ["Citation rate", "Successful eligible responses that cite the target domain ÷ all successful eligible responses in the same cohort × 100."],
  ["Mention prominence", "The brand's position when an answer explicitly ranks or lists alternatives. Marked unknown when no reliable ranking exists. First textual mention is not treated as a ranking."],
  ["Competitor share of voice", "The target brand's share of all detected tracked-brand mentions across a consistent prompt and provider cohort. Several brands can appear in one answer."],
  ["Platform coverage", "Successful usable executions ÷ planned executions, reported per provider."],
  ["Composite visibility score", "A documented 0–100 composite of mention rate, prominence, citation rate and coverage. Components are normalized to 0–100 before weighting, and the formula version is stored with every result."],
];

export default function DocsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p className="mt-4 text-muted">
        A scan is a snapshot of sampled answers from supported provider APIs at a particular time. It is not an
        absolute or universal measurement of AI visibility.
      </p>

      <h2 className="mt-12 text-xl font-semibold">Data sources</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
        <li>OpenAI Responses API with the web search tool — sampled OpenAI-generated, web-grounded answers. Not an exact capture of what ChatGPT shows every user.</li>
        <li>Gemini API with Google Search grounding — grounded answers with source annotations. One prompt can trigger several billable search queries.</li>
        <li>Google AI Overviews via a SERP data provider — reported only when the response actually contains AI Overview data. Missing data is unavailable, not zero.</li>
      </ul>

      <h2 className="mt-12 text-xl font-semibold">Metrics</h2>
      <dl className="mt-4 space-y-6">
        {metrics.map(([term, definition]) => (
          <div key={term}>
            <dt className="font-medium">{term}</dt>
            <dd className="mt-1 text-muted">{definition}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-xl font-semibold">Comparability</h2>
      <p className="mt-4 text-muted">
        Scores are only comparable between scans with the same prompt set, providers and market. Reports warn when
        any of these differ. Raw component metrics are always shown beside the composite score.
      </p>

      <h2 className="mt-12 text-xl font-semibold">Prompt neutrality</h2>
      <p className="mt-4 text-muted">
        Generated questions never instruct a model to mention or favor the target brand. Branded questions are kept
        in a separate category from unbranded discovery questions.
      </p>
    </article>
  );
}
