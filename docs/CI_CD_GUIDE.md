# CI/CD Deployment Guide

This document provides comprehensive instructions for setting up CI/CD pipelines for the Auto-Gen-Test-Exam project.

## Overview

The project uses **GitHub Actions** for CI/CD with the following deployment targets:

| Component          | Platform | Tier     | Region    |
| ------------------ | -------- | -------- | --------- |
| Backend (FastAPI)  | Render   | Free     | Singapore |
| Frontend (Next.js) | Vercel   | Hobby    | Singapore |
| Database           | SQLite   | Embedded | -         |

## Prerequisites

Before you begin, ensure you have:

### Accounts Required

- [ ] **GitHub account** with repository access
- [ ] **Vercel account** - [Sign up free](https://vercel.com/signup)
- [ ] **Render account** - [Sign up free](https://render.com/register)
- [ ] **Google AI Studio** account for Gemini API - [Get API Key](https://aistudio.google.com/apikey)

### Tools Required

```bash
# Node.js 20+ with pnpm
node --version  # v20.x.x
pnpm --version  # 9.x.x

# Python 3.11+
python --version  # 3.11.x

# Docker (optional, for local testing)
docker --version

# Vercel CLI
pnpm add -g vercel

# GitHub CLI (optional, for monitoring)
gh --version
```

## Quick Start Deploy

### Deploy Frontend to Vercel (5 minutes)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Login to Vercel
vercel login

# 3. Link and deploy
vercel link
vercel --prod

# 4. Set environment variables in Vercel Dashboard:
#    - NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
#    - NEXT_PUBLIC_WS_URL  = wss://your-backend.onrender.com
```

### Deploy Backend to Render (10 minutes)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `auto-gen-test-exam-api`
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Region:** Singapore
   - **Instance Type:** Free
5. Add **Environment Variables:**
   ```
   DATABASE_URL=sqlite+aiosqlite:///./data/app.db
   JWT_SECRET=<click Generate>
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=<your-gemini-api-key>
   CORS_ORIGINS=["https://your-app.vercel.app"]
   DEBUG=false
   ```
6. Add **Disk:**
   - Mount Path: `/app/data`
   - Size: 1 GB
7. Click **Create Web Service**

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable                      | Required | Default | Description                           |
| ----------------------------- | -------- | ------- | ------------------------------------- |
| `DATABASE_URL`                | Yes      | -       | SQLite connection string              |
| `JWT_SECRET`                  | Yes      | -       | Secret key for JWT tokens             |
| `JWT_ALGORITHM`               | No       | `HS256` | JWT algorithm                         |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No       | `1440`  | Token expiry (24h)                    |
| `GEMINI_API_KEY`              | Yes      | -       | Google Gemini API key                 |
| `CORS_ORIGINS`                | Yes      | -       | Allowed frontend origins (JSON array) |
| `DEBUG`                       | No       | `false` | Enable debug mode                     |

### Frontend (`frontend/.env.local`)

| Variable              | Required | Description                                           |
| --------------------- | -------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL (e.g., `https://api.example.com/api`) |
| `NEXT_PUBLIC_WS_URL`  | Yes      | WebSocket URL (e.g., `wss://api.example.com`)         |

## Architecture

![CI/CD Architecture](./cicd_architecture.png)

### Flow Overview

| Trigger           | Pipeline | Action                         |
| ----------------- | -------- | ------------------------------ |
| Push to `develop` | CI → CD  | Deploy to **Staging**          |
| Push to `main`    | CI → CD  | Deploy to **Production**       |
| Pull Request      | CI Only  | Validate code quality          |
| Manual Dispatch   | CD       | Deploy to selected environment |

## Setup Instructions

### 1. GitHub Repository Secrets

Navigate to `Settings → Secrets and variables → Actions` and add:

#### Required Secrets

| Secret Name                  | Description                  | How to Get                                                    |
| ---------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `VERCEL_TOKEN`               | Vercel API token             | [Vercel Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`              | Vercel organization ID       | `vercel link` then check `.vercel/project.json`               |
| `VERCEL_PROJECT_ID`          | Vercel project ID            | Same as above                                                 |
| `RENDER_DEPLOY_HOOK_STAGING` | Render deploy webhook        | Render Dashboard → Service → Settings → Deploy Hooks          |
| `RENDER_DEPLOY_HOOK_PROD`    | Render deploy webhook (prod) | Same as above for production service                          |

#### Optional Secrets

| Secret Name           | Description                              |
| --------------------- | ---------------------------------------- |
| `BACKEND_URL_STAGING` | Staging backend URL for health checks    |
| `BACKEND_URL_PROD`    | Production backend URL for health checks |

### 2. Vercel Setup

1. **Install Vercel CLI**

   ```bash
   pnpm add -g vercel
   ```

2. **Link Project**

   ```bash
   cd frontend
   vercel link
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL` - Backend API URL
   - `NEXT_PUBLIC_WS_URL` - WebSocket URL

### 3. Render Setup

1. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` directory as root
   - Use Docker runtime

2. **Configure Environment Variables**:

   ```
   DATABASE_URL=sqlite+aiosqlite:///./data/app.db
   JWT_SECRET=<auto-generated>
   GEMINI_API_KEY=<your-key>
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```

3. **Add Persistent Disk** (for SQLite):
   - Mount Path: `/app/data`
   - Size: 1 GB

4. **Create Deploy Hook**:
   - Go to Settings → Deploy Hooks
   - Create hook and save URL as GitHub secret

### 4. GitHub Environments (Optional)

Create environments for better deployment control:

1. Go to `Settings → Environments`
2. Create `staging` and `production` environments
3. Add protection rules for production:
   - Required reviewers
   - Wait timer
   - Deployment branches

## Pipeline Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and PR:

1. **Backend**
   - Lint with Ruff
   - Type check with MyPy
   - Run pytest

2. **Frontend**
   - ESLint
   - TypeScript check
   - Build verification

3. **Security**
   - Trivy vulnerability scan

### CD Pipeline (`.github/workflows/cd.yml`)

Runs on push to `main` or `develop`:

1. Detect changed components
2. Build Docker image (if backend changed)
3. Deploy to Render
4. Deploy to Vercel
5. Health check

## Local Development with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild
docker compose up -d --build
```

## Monitoring & Debugging

### Check Deployment Status

```bash
# Check workflow runs
gh run list

# View specific run
gh run view <run-id>

# Tail logs
gh run watch
```

### Render Logs

```bash
# Install Render CLI
brew install render-oss/render/render-cli

# Login
render login

# Tail logs
render logs <service-name>
```

### Vercel Logs

```bash
# View deployment logs
vercel logs <deployment-url>

# Live function logs
vercel logs --follow
```

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback

1. Go to Render Dashboard → Events
2. Find previous deploy
3. Click "Rollback"

## Cost Estimation (Free Tier)

| Service        | Free Tier Limits                             |
| -------------- | -------------------------------------------- |
| Vercel Hobby   | 100GB bandwidth, 100 deployments             |
| Render Free    | 750 hours/month, sleeps after 15min inactive |
| GitHub Actions | 2000 minutes/month (public repos unlimited)  |

## Best Practices

1. **Branch Protection**
   - Require PR reviews for `main`
   - Require status checks to pass

2. **Semantic Versioning**
   - Use conventional commits
   - Tag releases properly

3. **Security**
   - Never commit secrets
   - Rotate secrets regularly
   - Use environment-specific configs

4. **Performance**
   - Use caching in CI
   - Optimize Docker layers
   - Enable Turbopack for Next.js

## Troubleshooting

### Common Issues

#### Backend won't start on Render

**Symptom:** Service keeps restarting, health check fails

**Solutions:**

1. Check logs: `Render Dashboard → Logs`
2. Verify all required environment variables are set
3. Ensure disk is mounted at `/app/data`
4. Check `CORS_ORIGINS` format: must be valid JSON array

#### Frontend can't connect to backend

**Symptom:** API calls fail with CORS or network errors

**Solutions:**

1. Verify `NEXT_PUBLIC_API_URL` includes `/api` suffix
2. Check backend `CORS_ORIGINS` includes frontend URL
3. For WebSocket, use `wss://` (not `ws://`) in production

#### GitHub Actions failing

**Symptom:** CI/CD workflow fails

**Solutions:**

1. Check all secrets are configured in GitHub Settings
2. Verify branch names match workflow triggers
3. For Vercel deploy issues, check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

#### Render cold start too slow

**Symptom:** First request after inactivity takes 30+ seconds

**Solutions:**

1. Consider upgrading to paid tier ($7/month)
2. Set up external monitoring (UptimeRobot, Cronitor) to ping every 10 minutes
3. This is normal for free tier - document for users

### Debug Commands

```bash
# Check Docker build locally
cd backend && docker build -t test-backend .

# Run container locally
docker run -p 8000:8000 --env-file .env test-backend

# Test health endpoint
curl http://localhost:8000/api/health

# View GitHub Actions logs
gh run view --log
```

## Database Backup & Restore

### Manual Backup

Since SQLite is file-based, backup involves downloading the database file.

#### Via Render Shell

```bash
# 1. Open Render Dashboard → Your Service → Shell
# 2. Create backup
cp /app/data/app.db /app/data/backup-$(date +%Y%m%d).db

# 3. Download via Render's file browser or use curl
```

#### Automated Backup (Recommended)

Add this workflow to backup database weekly:

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: "0 2 * * 0" # Every Sunday 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger backup endpoint
        run: |
          # Implement a backup endpoint in your API
          # Or use Render's backup feature (paid tier)
          echo "Backup triggered"
```

### Restore Database

1. Stop the service (Render Dashboard → Suspend)
2. Upload backup file to `/app/data/app.db`
3. Resume service

### Production Recommendations

For production workloads, consider:

- **PostgreSQL on Render** - Free tier with 1GB storage
- **Supabase** - Free tier with 500MB PostgreSQL
- **PlanetScale** - Free tier with 5GB MySQL

These provide automatic backups, better concurrency, and no cold start issues.
