# Bitsplorer - Vercel Deployment Guide

This guide will help you deploy your Bitsplorer application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for CLI deployment)

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Authorize Vercel to access your repository

### Step 2: Configure Project Settings

When configuring your project, use these settings:

**Framework Preset:** Next.js

**Root Directory:** `packages/nextjs`

- Click "Edit" next to Root Directory
- Select `packages/nextjs` from the dropdown

**Build Settings:**

- Build Command: `cd ../.. && pnpm build:nextjs`
- Output Directory: `.next` (default)
- Install Command: `pnpm install`

**Node Version:** 20.x (recommended)

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at a Vercel URL (e.g., `bitsplorer.vercel.app`)

### Step 4: Configure Custom Domain (Optional)

1. Go to your project dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Project Root

From the root directory (`/Users/williambryce/dev/bitsplorer`):

```bash
# First deployment (will ask for configuration)
vercel

# Production deployment
vercel --prod
```

When prompted:

- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) or Yes (if already created)
- **What's your project's name?** bitsplorer (or your preferred name)
- **In which directory is your code located?** `packages/nextjs`

## Monorepo Configuration

The project includes a `vercel.json` file that handles the monorepo setup:

```json
{
  "buildCommand": "cd ../.. && pnpm build:nextjs",
  "devCommand": "cd ../.. && pnpm dev:nextjs",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

This ensures that:

- The build runs from the root directory where pnpm scripts are defined
- All workspace dependencies are properly installed
- The Next.js framework is correctly detected

## Environment Variables

This application doesn't require any environment variables as it uses public RPC endpoints via viem. However, if you want to use custom RPC endpoints in the future:

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add any required variables

## Supported Chains

Your deployed app will support these Ethereum chains out of the box:

- Ethereum Mainnet
- Sepolia Testnet (default)
- Holesky Testnet
- Base
- Optimism
- Arbitrum One

Users can switch between chains using the dropdown selector, and the selected chain is stored in the URL parameters for easy sharing.

## Post-Deployment

After deployment, your app will be accessible at:

- **Preview URL:** `https://your-project-name.vercel.app`
- **Custom Domain:** (if configured)

### Testing Different Chains

You can test different chains by adding the `chain` parameter to the URL:

- Mainnet: `https://your-app.vercel.app/?chain=mainnet`
- Base: `https://your-app.vercel.app/?chain=base`
- Optimism: `https://your-app.vercel.app/?chain=optimism`
- Arbitrum: `https://your-app.vercel.app/?chain=arbitrum`

## Troubleshooting

### Build Fails

If the build fails:

1. Check that the root directory is set to `packages/nextjs`
2. Verify the build command includes `cd ../..` to run from the monorepo root
3. Ensure pnpm is being used (not npm or yarn)

### Module Not Found Errors

Make sure `installCommand` is set to `pnpm install` so all workspace dependencies are installed.

### Deployment Not Updating

If your deployment isn't reflecting changes:

1. Check that your latest changes are pushed to the Git repository
2. Trigger a new deployment from the Vercel Dashboard
3. Clear the build cache if needed (Project Settings → General → Clear Build Cache)

## Continuous Deployment

Vercel automatically sets up continuous deployment:

- **Production:** Deploys when you push to your main/master branch
- **Preview:** Creates preview deployments for pull requests and other branches

## Performance Monitoring

After deployment, use Vercel Analytics to monitor:

- Page load times
- Web Vitals (LCP, FID, CLS)
- Real-time visitor data

Enable it in: Project Settings → Analytics

## Support

For issues with deployment:

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Support](https://vercel.com/support)
