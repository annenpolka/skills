# Preact Zero Mock

## What this demonstrates

This mock demonstrates a minimal approval flow with:
- a list view
- a detail view
- local fixture data
- simulated loading
- approve / reject interactions

## How to run

Serve the folder with a small local static server and open it in a browser.

Examples:
- `python3 -m http.server 8000 --bind 127.0.0.1`
- `npx serve .`

Then open:
- `http://127.0.0.1:8000`

## Assumptions

- data is local and fake
- no real authentication exists
- no persistence exists
- the goal is flow validation, not production implementation

## Non-goals

- backend integration
- database work
- deployment
- production architecture
- large-scale routing
- analytics and permissions

## Notes

Do not open this via `file://`.
Use a local static server.
