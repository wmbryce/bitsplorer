import {
  mainnet,
  sepolia,
  holesky,
  base,
  optimism,
  arbitrum,
} from "viem/chains";
import type { Chain } from "viem";

export type ChainConfig = {
  id: string;
  name: string;
  chain: Chain;
  pollingInterval: number;
};

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  mainnet: {
    id: "mainnet",
    name: "Ethereum Mainnet",
    chain: mainnet,
    pollingInterval: 12_000, // 12 seconds
  },
  sepolia: {
    id: "sepolia",
    name: "Sepolia Testnet",
    chain: sepolia,
    pollingInterval: 12_000, // 12 seconds
  },
  // holesky: {
  //   id: "holesky",
  //   name: "Holesky Testnet",
  //   chain: holesky,
  //   pollingInterval: 12_000, // 12 seconds
  // },
  base: {
    id: "base",
    name: "Base",
    chain: base,
    pollingInterval: 2_000, // 2 seconds
  },
  // optimism: {
  //   id: "optimism",
  //   name: "Optimism",
  //   chain: optimism,
  //   pollingInterval: 2_000, // 2 seconds
  // },
  // arbitrum: {
  //   id: "arbitrum",
  //   name: "Arbitrum One",
  //   chain: arbitrum,
  //   pollingInterval: 100, // ~250ms block time
  // },
};

export const DEFAULT_CHAIN = "sepolia";

export function getChainConfig(chainId: string | null): ChainConfig {
  if (!chainId || !SUPPORTED_CHAINS[chainId]) {
    return SUPPORTED_CHAINS[DEFAULT_CHAIN];
  }
  return SUPPORTED_CHAINS[chainId];
}

export function getChainIds(): string[] {
  return Object.keys(SUPPORTED_CHAINS);
}
