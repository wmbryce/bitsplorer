import { createPublicClient, http } from "viem";
import type { ChainConfig } from "@/utils/chains";

/**
 * Server-only. Never import from a "use client" module: the env vars read here
 * may embed provider API keys and must not reach the browser bundle. This is
 * also why the mapping lives here rather than in utils/chains.ts, which the
 * client imports.
 */
const RPC_ENV_VARS: Record<string, string> = {
  mainnet: "RPC_URL_MAINNET",
  sepolia: "RPC_URL_SEPOLIA",
  base: "RPC_URL_BASE",
};

/**
 * Returns undefined when no dedicated endpoint is configured, which makes viem
 * fall back to the chain's public default. Those defaults are unauthenticated
 * and rate-limit aggressively, so production should always set these.
 */
export function getRpcUrl(chainConfig: ChainConfig): string | undefined {
  const envVar = RPC_ENV_VARS[chainConfig.id];
  return (envVar ? process.env[envVar]?.trim() : undefined) || undefined;
}

export function createChainClient(chainConfig: ChainConfig) {
  return createPublicClient({
    chain: chainConfig.chain,
    transport: http(getRpcUrl(chainConfig)),
  });
}
