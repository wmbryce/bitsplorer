# Bitsplorer

A whimsical blockchain analytics tool

## 📦 Monorepo Structure

This project uses pnpm workspaces to manage multiple packages:

- **`@bitsplorer/nextjs`** - Next.js frontend application
- **`@bitsplorer/hardhat`** - Hardhat smart contract development environment

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm (v10+)

### Installation

```bash
# Install all dependencies for all packages
pnpm install
```

## 📜 Available Scripts

### Next.js (Frontend)

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Hardhat (Smart Contracts)

```bash
# Compile smart contracts
pnpm hardhat:compile

# Run tests
pnpm hardhat:test

# Start local Hardhat node
pnpm hardhat:node
```

### Workspace Management

```bash
# Clean all node_modules
pnpm clean

# Reinstall all dependencies
pnpm install:all
```

## 🏗️ Working with Packages

### Run commands in specific packages:

```bash
# Run command in nextjs package
pnpm --filter @bitsplorer/nextjs <command>

# Run command in hardhat package
pnpm --filter @bitsplorer/hardhat <command>
```

### Add dependencies:

```bash
# Add to nextjs package
pnpm --filter @bitsplorer/nextjs add <package-name>

# Add to hardhat package
pnpm --filter @bitsplorer/hardhat add -D <package-name>
```

## 📁 Project Structure

```
bitsplorer/
├── packages/
│   ├── nextjs/          # Next.js frontend app
│   │   ├── app/         # Next.js app directory
│   │   ├── public/      # Static assets
│   │   └── package.json
│   └── hardhat/         # Hardhat development
│       ├── contracts/   # Solidity contracts
│       ├── test/        # Contract tests
│       ├── scripts/     # Deployment scripts
│       └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
