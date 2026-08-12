# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Build and toolchain

- pnpm workspace, two packages. `packages/nextjs` is the app; `packages/hardhat`
  is unrelated sample-contract scaffolding and is excluded from deploys.
- Node `22.x` (`engines.node`, `.nvmrc`), pnpm `10.5.2` (`packageManager`).
  Run root scripts (`pnpm build`, `pnpm lint`, `pnpm start`) — they filter to the
  nextjs package.
- `packages/nextjs` has **no test script**. Repo tests are hardhat-only.
- Lint is warning-clean-ish by convention, not enforced: 7 pre-existing
  unused-variable warnings, 0 errors. Don't treat warnings as a regression signal
  without checking the baseline.

## Chain access — the sharp edge

Every chain call goes through `packages/nextjs/utils/rpc.ts`. Use
`createChainClient(chainConfig)`; never call viem's `http()` with no URL.

An unkeyed `http()` falls back to viem's public default endpoint for the chain,
and those defaults are mostly dead or rate-limited (Sepolia's rejects free tiers
outright). Endpoints come from `RPC_URL_MAINNET` / `RPC_URL_SEPOLIA` /
`RPC_URL_BASE`, read **server-side only** — they may embed API keys, so they must
never gain a `NEXT_PUBLIC_` prefix or be imported from a `"use client"` module.
That is why the env-var mapping lives in `utils/rpc.ts` and not in
`utils/chains.ts`, which client components import.

## Real-time streaming

`app/api/blocks/route.ts` is a long-lived SSE stream (viem `watchBlocks`,
polling). Consumed by `hooks/useBlockStream.ts`. Two constraints are load-bearing
and easy to break:

- `maxDuration` caps the stream; the browser `EventSource` reconnects and the
  hook deliberately ignores the replayed `initial` event after first load.
- The `: keepalive` heartbeat prevents proxies dropping the connection while the
  upstream RPC is stalled or throttled.

## Deployment

`DEPLOY.md` is the runbook — Vercel Root Directory must be `packages/nextjs`,
because Vercel reads `vercel.json` from the Root Directory, not the repo root.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
