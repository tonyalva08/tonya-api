# Tonya API — Claude Code Instructions

## Project Overview
Tonya is an ROI profile generator for design decisions. This monorepo has two workspaces:
- `api/` — Express + TypeScript backend (deployed on Railway)
- `web/` — React + Vite frontend

Claude Code should focus on `api/` for all backend changes unless explicitly told otherwise.

## Repo Structure
```
tonya-api/
├── api/                    # ← Railway deploys THIS folder
│   ├── src/
│   │   ├── app.ts          # Express app setup
│   │   ├── index.ts        # Entry point (port 3001)
│   │   ├── routes/         # API route handlers
│   │   ├── lib/            # Services: scraper, research, roi
│   │   ├── middleware/     # Auth, error handling
│   │   └── test/           # Vitest tests
│   ├── .env.example        # Required env vars (never commit .env)
│   └── package.json
├── web/                    # React frontend (separate deployment)
├── .claude/
│   └── launch.json         # Dev server launch config
└── CLAUDE.md               # This file
```

## Local Development

### Start both servers
```bash
# API (port 3001)
cd api && npm run dev

# Web (port 5173)
cd web && npm run dev
```

### Run tests
```bash
cd api && npm test
```

## Deployment: Railway

**The `api/` folder is the deployable unit.** Railway is configured with:
- Root Directory: `/api`
- Branch: `main` (auto-deploys on every push)
- Port: `3001`
- Live URL: `https://tonya-api-production.up.railway.app`

**Deploying an update is just a git push:**
```bash
git add .
git commit -m "describe your change"
git push origin main
```
Railway will automatically detect the push and redeploy. No manual steps needed.

## Environment Variables

Set in Railway dashboard → Variables tab (never commit real values).

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Powers ROI profile generation via Claude |
| `CRUNCHBASE_API_KEY` | Optional | Company funding/data enrichment |
| `NEWS_API_KEY` | Optional | News signal enrichment |

Local dev: copy `api/.env.example` to `api/.env` and fill in values.

## Key API Endpoint

```
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com",
    "sector": "B2B SaaS",
      "designAction": "ux_redesign",
        "mode": "trial" | "full"
        }
        ```

        Health check: `GET /health` → `{ "status": "ok" }`

        ## Valid designAction Values
        - `rebrand` — Brand Redesign / Rebrand
        - `programmatic_ads` — Programmatic Geotargeted Ad Campaign
        - `irl_campaign` — IRL / Out-of-Home Campaign
        - `superbowl_ad` — Super Bowl or High-Impact Media Placement
        - `product_design` — New Product Design
        - `ux_redesign` — UX/UI App Redesign
        - `long_form_video` — Long-Form Episode / Documentary Content
        - `short_form_social` — Short-Form Social Content

        ## Git Workflow for Claude Code

        1. Make changes inside `api/src/`
        2. Test locally: `cd api && npm run dev`
        3. Run tests: `cd api && npm test`
        4. Commit and push:
           ```bash
              git add .
                 git commit -m "feat: describe the change"
                    git push origin main
                       ```
                       5. Railway auto-deploys within ~2 minutes
                       6. Verify at: `https://tonya-api-production.up.railway.app/health`

                       ## Important Rules
                       - Never commit `.env` files — they are gitignored
                       - Always work in a feature branch for large changes; push directly to `main` for small fixes
                       - The `web/` folder has its own `package.json` — do not run `npm install` from the root for web changes
                       - Railway only watches `api/` — changes to `web/` do NOT trigger a Railway redeploy
