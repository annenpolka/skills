---
name: preact-zero-mock
description: Create a brand-new zero-build web mock using Preact, HTM, import maps, plain CSS, and local fixtures. Use this whenever the user wants a lightweight prototype, browser-openable demo, requirement-validation UI, UX flow mock, or reproducible bug repro without npm install, bundlers, real APIs, or backend setup. Especially use it for small 1-3 screen mocks with fake data, local state, and minimal structure. Do not use it for modifying an existing production app, real authentication, databases, backend services, deployment workflows, native mobile apps, or large multi-feature builds.
---

# preact-zero-mock

## Purpose

Use this skill when the goal is to produce a small, demoable web mock that runs directly in the browser without a build step.

This skill optimizes for:
- zero-build setup
- fastest path to a clickable mock
- small file count
- editable local fixtures
- obvious structure and explicit non-goals

This skill does not optimize for:
- production readiness
- backend integration
- authentication
- database work
- deployment
- large-scale maintainability
- advanced design systems

## Use this skill when

Use this skill when the user wants:
- a quick prototype
- a throwaway but readable mock
- a UI to validate flow or copy
- a bug reproduction app
- a demoable frontend without npm install
- a browser-openable mock with fake data

Typical requests:
- "すぐ見せられる軽いモックを作って"
- "npm install なしで動く試作が欲しい"
- "2画面くらいの UI だけほしい"
- "API はないのでダミーデータで見せたい"
- "ブラウザだけで開ける repro を作りたい"

## Do not use this skill when

Do not use this skill for:
- modifying an existing production app
- integrating a real backend
- setting up authentication
- connecting a database
- creating deployment pipelines
- building a native mobile app
- creating a large app with many domains and flows
- introducing heavy state management or app-wide architecture

If the task is production-oriented, use a different skill.

## Default technical decisions

Unless the user explicitly asks otherwise, use these defaults:
- framework: Preact
- templating: HTM
- module loading: browser-native ES Modules
- dependency resolution: import maps
- styling: plain CSS
- data source: local fixtures in JavaScript
- routing: no router by default
- navigation: conditional rendering or hash-based navigation only if needed
- state: local component state
- shared state: avoid by default
- async behavior: simulated with local Promise wrappers only if needed

## Core principles

Follow these principles throughout the task:
- Zero-build is a feature, not a compromise.
- Prefer one clear demo story over broad coverage.
- Keep files small and obvious.
- Mock only the user-facing boundary.
- Prefer local state over app-wide architecture.
- Use browser-native features before adding tools.
- Make assumptions and omissions visible.

## Constraints

Keep the mock small.

Follow these rules:
- Aim for 1 to 3 primary screens.
- Prefer 1 main flow over many branches.
- Prefer local fixtures over network mocking.
- Do not introduce Vite, Webpack, Parcel, or any build tool.
- Do not introduce Tailwind by default.
- Do not introduce MSW, Express, or a fake backend server.
- Do not introduce Redux, Zustand, React Query, or similar tools.
- Do not add more dependencies unless the user clearly benefits.
- Do not over-design CSS architecture.

## Output requirements

When using this skill, produce:
1. a browser-openable mock
2. one main demo flow
3. fixtures grouped in one place
4. a short README with assumptions, how to run, and non-goals

## Workflow

### 1. Compress the request into one demo story

Before writing code, reduce the request into:
- target user
- one primary action
- one successful outcome
- optional secondary screen

Choose the narrowest viable slice.

### 2. Choose the smallest app shape

Use these heuristics:
- 1 screen only: render a single app view
- 2 or 3 screens: use local state or hash navigation
- fake latency needed: wrap fixture reads in Promise + timeout
- static demo only: use fixtures directly

### 3. Keep the file structure tiny

Prefer a structure like this:

- `index.html`
- `app.js`
- `fixtures.js`
- `styles.css`
- `README.md`

Only add folders when the mock actually needs them.

### 4. Build visible flow first

Implement in this order:
1. page shell
2. primary screen
3. main interaction
4. success state
5. optional secondary screen
6. minimal empty or error state only if useful

### 5. Keep data obvious

Use fixture names that explain themselves.

Examples:
- `fixtures.js`
- `mockItems`
- `pendingApprovals`
- `reviewQueue`

Data should be easy to edit during a live demo.

### 6. Write the README last

README must include:
- what this mock demonstrates
- how to run it
- assumptions
- what is intentionally not implemented

## Implementation guidance

### App structure

Keep it simple.

- `index.html`: import map, root element, script entry
- `app.js`: UI logic and rendering
- `fixtures.js`: fake data
- `styles.css`: minimal styling
- `README.md`: assumptions and usage

### Preact usage

Use `preact`, `preact/hooks`, and `htm`.

Prefer:
- small function components
- local `useState`
- local `useMemo` only when it helps readability
- direct rendering with `render()`

Avoid:
- elaborate composition layers
- unnecessary hook abstractions
- framework-like internal architecture

### Navigation

By default, avoid a router.

Use one of these:
- conditional rendering with local state
- simple hash-based navigation if separate screens matter

### Data and async behavior

Use local fixtures first.

If the story benefits from loading states:
- simulate async with a Promise and timeout
- keep the fake delay short and obvious
- never introduce a backend server for this skill

### Styling

Use plain CSS.

Prefer:
- simple layout primitives
- readable spacing
- a small set of component classes
- variables only if they improve clarity

Avoid:
- utility frameworks by default
- token systems
- theming layers
- CSS-in-JS

## Definition of done

This skill is complete only when all of the following are true:
- the user can open the mock through a local static server and see it working
- the main demo flow is visible and clickable
- the fixtures are easy to edit
- the structure is still small and understandable
- README documents assumptions and non-goals
- no build step is required

## Anti-patterns

Avoid these mistakes:
- introducing a bundler into a zero-build skill
- creating a fake backend when fixtures are enough
- adding routing when conditional rendering is enough
- building production architecture for a throwaway mock
- extracting too many components too early
- adding dependencies for prestige rather than need
- polishing edge cases before the main story works

## Completion checklist

Before finishing, verify:
- Is there exactly one main story?
- Can the user understand the mock in under a minute?
- Can someone edit the fixtures quickly?
- Is there still no build step?
- Did you avoid backend, auth, and database creep?
- Is the structure smaller than a typical bundled app?

If not, simplify further.
