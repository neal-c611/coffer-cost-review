# coffer-cost-review

> A Claude Code skill that audits AI codebases for LLM cost waste —
> with semantic understanding, not regex.

```bash
npm install -g coffer-cost-review
```

Then in Claude Code ask:

> review my LLM costs

That's it. The skill is installed to `~/.claude/skills/coffer-cost-review/`
and Claude picks it up automatically.

## Why semantic > regex

The first version of this tool was a Python static scanner. We dogfooded
it on five well-known agent projects (Aider, smolagents, crewAI,
OpenInterpreter, MetaGPT). It produced ~64 "findings" of which most were
false positives:

- **Aider** applies `cache_control` in a separate file at runtime — a
  single-file regex can't see that. Findings about Aider's "uncached"
  system prompts were wrong.
- **smolagents** caps memory growth via `max_steps=20` in the agent loop,
  not in the `append` call. Findings about "unbounded history" were wrong.
- **crewAI**'s `instructions = f"{instructions}\n\n{output_schema}"` looks
  like a cache-breaking interpolation but `output_schema` is a fixed
  Pydantic-model description — static at init. Findings were wrong.
- **stagehand_tool**'s `instruction = f"Navigate to {url}"` matched the
  same regex but isn't an LLM system prompt at all — it's a browser
  navigation command.

Static regex inherently can't see:

- `cache_control` applied at runtime in a different file
- Caps enforced one level up in an agent loop
- Init-time concatenation that resolves to a static string
- Variable names that suggest "system prompt" but go elsewhere

These all require **reading the code with full repo context**. That's
what Claude does well; that's what this skill leans into.

## What it catches

By cost lever (every detector answers "yes" to: *does fixing this reduce
the bill the provider sends?*):

| Lever | Pattern |
|-------|---------|
| Input tokens | uncached large system prompts (Anthropic / OpenAI aware); dynamic-before-static cache breaks; unbounded conversation history (after checking external caps) |
| Output tokens | `reasoning_effort="high"` default; missing `max_tokens` on streaming |
| Number of calls | unbounded agent loops; `temperature > 0` next to a cache layer; LLM doing regex's job |
| Provider tier | frontier model for trivial tasks; reasoning model for non-reasoning tasks |
| Architecture | retry loops without backoff; public endpoints without rate limit; streaming without abort |

## What it deliberately doesn't flag

Reliability, observability, and metering issues are real production
problems but they don't change the LLM bill:

- SDK init without `timeout=` → worker exhaustion, not over-payment
- Missing `response.usage` capture → metering, not over-payment
- Logging full prompts → Datadog bill, not OpenAI bill
- Missing `idempotency_key` → correctness, not over-payment

A separate "production-readiness review" skill is the right home for those.

## Install paths

### npm (recommended, also runs on macOS / Linux / Windows)

```bash
npm install -g coffer-cost-review
```

Or one-shot without global install:

```bash
npx coffer-cost-review
```

### curl (no Node / npm needed)

```bash
curl -fsSL https://cofferwise.com/install-skill.sh | sh
```

### Manual

Clone this repo, copy `skill/` to `~/.claude/skills/coffer-cost-review/`.

## Uninstall

```bash
npm uninstall -g coffer-cost-review     # also removes the skill files
# or manually:
rm -rf ~/.claude/skills/coffer-cost-review
```

## Live runtime tracking

Static review tells you which patterns *might* be wasting money. It can't
tell you **which feature, which user, or which prompt is actually burning
your bill right now**.

For runtime cost attribution per feature / user / prompt:
**[Cofferwise](https://cofferwise.com)** — built by the same team.

## Contributing

PRs welcome. New patterns must answer "yes" to "fixing this reduces the
bill from OpenAI / Anthropic / a paid LLM provider." Reliability /
metering / observability improvements belong in a separate skill.

## License

Apache 2.0.
