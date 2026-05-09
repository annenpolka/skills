# Autoresearch Loop Patterns

## Good Targets

- Performance: latency, throughput, memory, bundle size.
- Test speed: wall-clock seconds with the same tests still passing.
- Type/lint cleanup: count findings, zero target.
- Coverage: percentage higher with test suite passing.
- Complexity: count of functions over a threshold, guarded by tests.
- UI: accepted checklist gaps, axe violations, screenshot assertions.
- Security: confirmed findings fixed, with tests or repros.

## Bad Targets Until Converted

- "Make it cleaner."
- "Improve UX."
- "Make it production ready."
- "Find something interesting."

Convert these into a checklist, score, or bounded discovery phase before
launching the loop.

## Recipe: Test Speed

```text
Goal: reduce test runtime
Metric: seconds, lower is better
Verify: command prints AUTORESEARCH_METRIC_VALUE=<seconds>
Guard: same test command must pass
Scope: test config, test helpers, fixtures
Read-only: test assertions, coverage thresholds, benchmark parser
Forbidden: skipping tests, deleting assertions, narrowing test discovery
```

## Recipe: TypeScript Any Removal

```text
Goal: reduce explicit any count
Metric: any_count, lower is better
Verify: rg "\bany\b" src --glob "*.ts" | wc -l
Guard: npm run typecheck && npm test
Scope: src/**/*.ts src/**/*.tsx
Read-only: tsconfig strictness unless explicitly part of the task
```

## Recipe: Performance

```text
Goal: reduce p95 latency
Metric: p95_ms, lower is better
Verify: ./bench.sh prints METRIC p95_ms=<number>
Guard: unit tests and integration smoke tests
Scope: hot path, cache, serialization
Threshold: at least 2x benchmark noise or 3%, whichever is larger
```

## Recipe: UI Polish

Use a quality-gap loop, not pure taste.

```text
Goal: reduce accepted UI checklist gaps
Metric: unchecked_gap_count, lower is better
Verify: Playwright screenshot/checklist script
Guard: lint, tests, responsive screenshots
Scope: target page and components only
Read-only: checklist evaluator and reference screenshots
```

## Recipe: Open-Ended Research

Do not start with an unbounded loop. First run a planning pass:

1. enumerate measurable candidates;
2. choose one metric;
3. create or identify `Verify`;
4. run baseline;
5. then launch the measured loop.
