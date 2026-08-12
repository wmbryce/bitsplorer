# Deploying Bitsplorer to Vercel

Everything below has been verified against a cold clone and a real production
build. Follow it top to bottom; nothing here needs re-deriving.

---

## 0. Do this first: get an RPC key

**This is the only step you cannot skip, and the only one outside Vercel.**

Bitsplorer never had an RPC endpoint configured. Both places that talk to a
chain called viem's `http()` with no URL, which silently falls back to the
public default endpoint baked into each viem chain definition. Those defaults
are unauthenticated, shared by everyone, and — measured on 2026-08-11 — mostly
already broken:

| Chain | viem default endpoint | Status when measured |
| --- | --- | --- |
| Ethereum Mainnet | `https://eth.merkle.io` | **HTTP 429** (Cloudflare 1015) after ~5 requests from one IP |
| Sepolia | `https://sepolia.drpc.org` | **HTTP 400** — `"chain is not available on free plan, please upgrade to paid plan"` |
| Base | `https://mainnet.base.org` | Working, but unauthenticated and rate-limited |

This is not a "might throttle under load" caveat. Sepolia is the app's default
chain and its public endpoint is dead unconditionally — with no env vars set, a
first-time visitor gets `Failed to fetch blocks` and an empty page. Mainnet
rate-limited during this task's own testing, from a single machine, within a
handful of requests.

The app is chattier than it looks: the SSE route polls `eth_blockNumber` on
`pollingInterval`, fetches the 5 most recent blocks on every connect, and
fetches each new block in full. That is roughly **10 requests/minute per
connected viewer** on Mainnet and Sepolia, and **~60/minute per viewer** on Base
(2s polling). Ten concurrent viewers on Base is ~600 requests/minute.

**Get a free API key from one of these**, all of which have free tiers well
above that:

- [Alchemy](https://dashboard.alchemy.com/) — one app per network, gives you
  `https://eth-mainnet.g.alchemy.com/v2/<KEY>` etc. Recommended: covers all
  three chains from one account.
- [Infura](https://developer.metamask.io/) — `https://mainnet.infura.io/v3/<KEY>`
- [QuickNode](https://www.quicknode.com/), [dRPC](https://drpc.org/) — also fine.

If you want to launch without signing up for anything, these free unauthenticated
endpoints were verified working during this task and can go straight into the env
vars below. They are a stopgap, not a plan — they carry no SLA and will throttle:

- Mainnet — `https://ethereum-rpc.publicnode.com`
- Sepolia — `https://ethereum-sepolia-rpc.publicnode.com`
- Base — `https://base-rpc.publicnode.com`

---

## 1. Import the project

- **Repo:** `wmbryce/bitsplorer`
- **Branch:** `fm/bitsplorer-deploy` (merge to `master` first if you'd rather
  deploy production from `master`)

Vercel Dashboard → **Add New… → Project** → import `wmbryce/bitsplorer`.

## 2. Dashboard settings

Set these on the import screen (or later under **Settings → Build and Deployment**):

| Setting | Value | Why |
| --- | --- | --- |
| **Root Directory** | `packages/nextjs` | **The one that matters.** See below. |
| Framework Preset | `Next.js` | Auto-detected once Root Directory is right. |
| Build Command | leave default (`next build`) | Set in `packages/nextjs/vercel.json`. |
| Install Command | leave default | Set in `packages/nextjs/vercel.json` (filtered install). |
| Node.js Version | `22.x` | Pinned by `engines.node`; the dropdown is overridden anyway. |
| Include files outside root directory | **on** (default) | Required — pnpm must reach the workspace root. |
| Fluid Compute (**Settings → Functions**) | **on** (default) | Confirm it. With Fluid off, the Hobby per-function ceiling is 60s and Vercel **fails the build** on the `maxDuration = 300` export rather than clamping it. |

### Why Root Directory is `packages/nextjs`

Vercel reads `vercel.json` **from the Root Directory, not from the repository
root.** The `vercel.json` that used to sit at the repo root contained
`"buildCommand": "cd ../.. && pnpm build:nextjs"` — the `cd ../..` only makes
sense if the working directory is `packages/nextjs`, but at that Root Directory
setting Vercel would never have read the file in the first place. It was
self-cancelling: correct at neither setting.

That file has been **deleted** and replaced with `packages/nextjs/vercel.json`,
which Vercel will actually read:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "pnpm install --filter @bitsplorer/nextjs... --frozen-lockfile",
  "buildCommand": "next build"
}
```

The filtered install pulls only the Next.js package and its workspace
dependencies — 647 packages instead of 764 — and skips `packages/hardhat`
entirely. That matters because hardhat depends on
`forge-std` via `github:foundry-rs/forge-std#v1.9.4`, and there is no reason to
make a frontend deploy depend on fetching a git repo from GitHub.

The root `.vercelignore` was deleted for the same reason the root `vercel.json`
was: it is read from the Root Directory, so at `packages/nextjs` it was dead
config. The filtered install replaces what it was trying to do.

## 3. Environment variables

Add under **Settings → Environment Variables**, applied to **Production,
Preview, and Development**:

| Variable | What it's for | Where to get it |
| --- | --- | --- |
| `RPC_URL_MAINNET` | JSON-RPC endpoint for Ethereum Mainnet | Alchemy/Infura dashboard (step 0) |
| `RPC_URL_SEPOLIA` | JSON-RPC endpoint for Sepolia | same |
| `RPC_URL_BASE` | JSON-RPC endpoint for Base | same |

All three are technically optional — unset means "fall back to viem's public
default" — but per the table in step 0, two of those three defaults are already
failing. **Set all three.**

They are deliberately **not** prefixed `NEXT_PUBLIC_`. Both call sites are
server-side (the SSE route and the block detail page are both server code), so a
keyed URL never reaches the browser. Verified: `RPC_URL_` appears nowhere in the
client bundle. Do not rename these with a `NEXT_PUBLIC_` prefix — that would
publish your API key to every visitor.

`packages/nextjs/.env.example` documents the same three for local development;
copy it to `.env.local`.

## 4. Deploy

Click **Deploy**. Nothing else is required.

---

## What was broken, and what changed

### The build did not compile at all

`master` did not build. Commit `6cba60c` ("fix: nextjs version") rewrote
`IncomingBlocks.tsx` to use a multi-chain API — `import { isEVMBlock, isSolanaBlock }`,
a `Block` type, a `slot` field — that was never added to `types/index.tsx`. The
build fails with `Export isSolanaBlock doesn't exist in target module`.

That file has been reverted to the EVM-only shape the rest of the app (including
`Block.tsx`, which it renders) still uses. This is the only functional code
change; no Solana support was removed, because none ever existed.

### Streaming under a production build

`app/api/blocks/route.ts` holds an SSE connection open for as long as the viewer
has the tab open, which interacts with Vercel in two ways:

- **`export const maxDuration = 300`** — Vercel terminates a streaming function
  at its ceiling. 300s is both the default and the maximum on every plan with
  fluid compute (on by default). When it fires, the browser's `EventSource`
  reconnects on its own and the block list survives, because the hook ignores
  the replayed `initial` event after first load. Expect a reconnect roughly
  every 5 minutes; it is not visible to the user.
- **A 15s heartbeat** (`: keepalive`) — Vercel only sends keep-alive frames over
  HTTP/2. HTTP/1.1 clients and intermediate proxies will drop a connection that
  goes idle, which is exactly what happens when the upstream RPC stalls or
  rate-limits between blocks. This was observed during testing: on a
  rate-limited Mainnet endpoint the stream sent nothing but heartbeats for 60s.

Stream teardown was also tightened so the polling watcher is always stopped and
the controller closed exactly once, including when the client aborts before the
watcher is established.

### Other changes

- `engines.node: "22.x"` in both `package.json` files, plus `.nvmrc`. Vercel's
  current default is 24.x; 22.x is what this was verified on.
- Removed per-render and per-block `console.log` calls from `Block.tsx`,
  `useBlockStream.ts`, and the SSE route. They ran on every block for every
  viewer and would have filled the browser console and Vercel's function logs.
  All `console.error` calls were kept.

Nothing in the design changed.

---

## Verification performed

Cold clone of this branch, `pnpm@10.5.2`, Node `v22.15.0` (matching what Vercel
will run):

- `pnpm install --frozen-lockfile` — clean, lockfile up to date
- `pnpm install --filter @bitsplorer/nextjs... --frozen-lockfile` — clean, 647
  packages, `packages/hardhat` untouched
- `pnpm build` — clean
- `pnpm lint` — 0 errors (7 pre-existing unused-variable warnings, untouched)
- `pnpm start` + browser — `/`, `/api/blocks`, and `/block/[n]` all verified
  against the production build with live Sepolia blocks arriving; browser
  console had zero errors

There is no test suite for the Next.js package — `packages/nextjs/package.json`
has no `test` script. The only tests in the repo are hardhat's
(`packages/hardhat/test/Counter.ts`), which cover the sample `Counter.sol`
contract, are unrelated to the frontend, and are excluded from the deploy.

Screenshots in `docs/deploy/`, taken 40 seconds apart against the production
build — block height advances `#11470603` → `#11470607`:

- `prod-blocks-t0.png`
- `prod-blocks-t40s.png`
- `prod-block-detail.png`

---

## Two things worth your decision (not blockers)

1. **The landing page defaults to Sepolia Testnet.** `DEFAULT_CHAIN` in
   `utils/chains.ts` is `"sepolia"`, so an unqualified visit to the site shows
   testnet blocks. Left unchanged — it's your call, not a deploy problem. If the
   point is to find out whether people care, Mainnet or Base shows real
   activity; it's a one-line change.
2. **The chain `<select>` has no accessible label.** Chrome flags "No label
   associated with a form field" — the `<label>` isn't tied to the `<select>`
   via `htmlFor`/`id`. Cosmetic, pre-existing, not touched.
