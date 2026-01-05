# Critical Deployment Fix

## Problem
DigitalOcean couldn't determine the start command and health checks were failing.

## Solution Applied

1. **Added explicit `run_command`** in `.do/app.yaml` for both services
2. **Fixed API URL detection** for frontend to work in production
3. **Added runtime config** that detects API URL from domain

## Files Changed

- `.do/app.yaml` - Added `run_command` for both services
- `src/api/apiClient.js` - Added runtime API URL detection
- `public/config.js` - Created runtime configuration file
- `index.html` - Added config.js script tag

## Next Steps

1. **Commit and push**:
   ```bash
   git add .
   git commit -m "Fix DigitalOcean deployment - add explicit run commands"
   git push origin main
   ```

2. **Redeploy in DigitalOcean**:
   - The app will auto-redeploy
   - Or manually trigger from dashboard

3. **After deployment, update API URL**:
   - Note your API service URL (e.g., `https://primebroward-crm-api-xxxxx.ondigitalocean.app`)
   - The frontend should auto-detect it, but if not:
   - Go to Frontend service → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-api-url.ondigitalocean.app/api`
   - Redeploy frontend

## Manual Deployment Alternative

If the YAML file still doesn't work, deploy manually:

1. **Create API Service**:
   - Source: GitHub repo
   - Dockerfile: `Dockerfile.api`
   - Port: `8000`
   - Run Command: `python -m uvicorn server.app.main:app --host 0.0.0.0 --port 8000 --workers 1`
   - Environment Variables:
     - `API_HOST=0.0.0.0`
     - `API_PORT=8000`
     - `DATA_DIR=/app/data`
     - `DATABASE_PATH=/app/data/primebroward.db`

2. **Create Frontend Service**:
   - Source: GitHub repo
   - Dockerfile: `Dockerfile.frontend`
   - Port: `80`
   - Run Command: `nginx -g "daemon off;"`
   - Environment Variables:
     - `NODE_ENV=production`
     - `VITE_API_URL=https://your-api-url.ondigitalocean.app/api` (set after API deploys)

## Troubleshooting

If health checks still fail:
- Check logs in DigitalOcean dashboard
- Verify ports match (8000 for API, 80 for frontend)
- Ensure run_command is correct
- Check that Dockerfiles build successfully

