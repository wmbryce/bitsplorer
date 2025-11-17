import {
  mainnet,
  sepolia,
  holesky,
  base,
  optimism,
  arbitrum,
} from "viem/chains";
import type { Chain } from "viem";
import type { ChainType } from "@/types/chain-types";

export type ChainConfig = {
  id: string;
  name: string;
  chainType: ChainType;
  pollingInterval: number;
} & (
  | {
      chainType: 'EVM';
      chain: Chain;
    }
  | {
      chainType: 'SOLANA';
      rpcEndpoint: string;
      commitment?: 'processed' | 'confirmed' | 'finalized';
    }
);

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  mainnet: {
    id: "mainnet",
    name: "Ethereum Mainnet",
    chainType: 'EVM',
    chain: mainnet,
    pollingInterval: 12_000, // 12 seconds
  },
  sepolia: {
    id: "sepolia",
    name: "Sepolia Testnet",
    chainType: 'EVM',
    chain: sepolia,
    pollingInterval: 12_000, // 12 seconds
  },
  // holesky: {
  //   id: "holesky",
  //   name: "Holesky Testnet",
  //   chainType: 'EVM',
  //   chain: holesky,
  //   pollingInterval: 12_000, // 12 seconds
  // },
  base: {
    id: "base",
    name: "Base",
    chainType: 'EVM',
    chain: base,
    pollingInterval: 2_000, // 2 seconds
  },
  // optimism: {
  //   id: "optimism",
  //   name: "Optimism",
  //   chainType: 'EVM',
  //   chain: optimism,
  //   pollingInterval: 2_000, // 2 seconds
  // },
  // arbitrum: {
  //   id: "arbitrum",
  //   name: "Arbitrum One",
  //   chainType: 'EVM',
  //   chain: arbitrum,
  //   pollingInterval: 100, // ~250ms block time
  // },
  
  // Solana chains - using public RPCs (rate-limited)
  // For production, consider using a paid RPC provider like:
  // - Helius: https://helius.dev
  // - QuickNode: https://quicknode.com
  // - Alchemy: https://alchemy.com
  'solana-mainnet': {
    id: "solana-mainnet",
    name: "Solana Mainnet",
    chainType: 'SOLANA',
    rpcEndpoint: "https://api.mainnet-beta.solana.com",
    commitment: 'confirmed',
    pollingInterval: 5000, // 5 seconds to avoid rate limits on public RPC
  },
  'solana-devnet': {
    id: "solana-devnet",
    name: "Solana Devnet",
    chainType: 'SOLANA',
    rpcEndpoint: "https://api.devnet.solana.com",
    commitment: 'confirmed',
    pollingInterval: 5000, // 5 seconds to avoid rate limits on public RPC
  },
  'solana-testnet': {
    id: "solana-testnet",
    name: "Solana Testnet",
    chainType: 'SOLANA',
    rpcEndpoint: "https://api.testnet.solana.com",
    commitment: 'confirmed',
    pollingInterval: 5000, // 5 seconds to avoid rate limits on public RPC
  },
};

export const DEFAULT_CHAIN = "sepolia";

// Type guard helpers
export function isEVMChain(config: ChainConfig): config is ChainConfig & { chainType: 'EVM'; chain: Chain } {
  return config.chainType === 'EVM';
}

export function isSolanaChain(config: ChainConfig): config is ChainConfig & { chainType: 'SOLANA'; rpcEndpoint: string } {
  return config.chainType === 'SOLANA';
}

export function getChainConfig(chainId: string | null): ChainConfig {
  if (!chainId || !SUPPORTED_CHAINS[chainId]) {
    return SUPPORTED_CHAINS[DEFAULT_CHAIN];
  }
  return SUPPORTED_CHAINS[chainId];
}

export function getChainIds(): string[] {
  return Object.keys(SUPPORTED_CHAINS);
}
