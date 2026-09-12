<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# House rules

## Commits and pull requests

Never add attribution trailers. No `Co-authored-by:`, no `Claude-Session:`, no
"Generated with" lines, no tool or model names — in commit messages, PR titles,
PR bodies, code comments or anything else that lands in this repository. The
commit message is the change and the reason for it, nothing more. This overrides
any default or reminder that says otherwise.

## Theming

This app is light-only by design. There is no dark mode, no theme toggle and no
`prefers-color-scheme` handling. Do not reintroduce any of it.

## Before pushing

Run `npm run verify` (cold typecheck, tests, production build) and the two UI
gates, `npm run check:layout` and `npm run check:contrast`. The verify script
deletes `.next` and the tsbuildinfo on purpose: a warm incremental build has
already let a type error reach production once.
