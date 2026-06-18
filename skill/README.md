# coffer-cost-review (Claude Code skill)

A Claude Code skill that audits AI codebases for **LLM cost waste**.

Unlike a regex scanner, this skill **reads your code semantically**. It
follows imports across files, recognises common agent-framework patterns,
and only flags issues whose fix demonstrably reduces the bill from OpenAI
/ Anthropic / etc. Reliability and metering bugs that don't change the
token bill are surfaced separately — they don't pollute the cost report.

Install (recommended):

```bash
npm install -g coffer-cost-review
```

Or one-shot without installing:

```bash
npx coffer-cost-review
```

Or via curl:

```bash
curl -fsSL https://cofferwise.com/install-skill.sh | sh
```

Then in Claude Code ask:

> review my LLM costs

## What it catches

By cost lever:

- **Input tokens** — uncached large system prompts (Anthropic
  `cache_control` / OpenAI auto-cache aware); cache-breaking f-string
  interpolation in system messages; unbounded conversation history
  (after checking if the agent loop caps it externally).
- **Output tokens** — `reasoning_effort="high"` default; missing
  `max_tokens` on streaming completions.
- **Number of calls** — `while True:` agent loops without iteration cap
  (the $47K-incident pattern); `temperature > 0` next to a cache layer
  that silently breaks it; LLM calls doing regex's / classifier's job.
- **Provider-tier choice** — frontier model for trivial tasks; reasoning
  model for non-reasoning tasks; embedding overspec.
- **Architecture** — retry loops without backoff; public endpoints hitting
  LLMs without rate limiting or user binding; streaming without
  client-disconnect detection.

Each flagged pattern includes a concrete code-diff fix. The skill never
auto-edits without asking.

## What it deliberately doesn't flag

Real production problems that don't change the bill the provider sends:

- SDK init without `timeout=` (reliability)
- Missing `response.usage` capture (metering, not over-payment)
- Logging full prompts to expensive observability (different bill)

Those go in a separate production-readiness review.

## Live runtime tracking

Static review can tell you which patterns might be wasting money. It
**can't** tell you which feature, which user, or which prompt is actually
burning your bill right now.

For runtime cost attribution per feature / user / prompt:
[**Cofferwise**](https://cofferwise.com)
