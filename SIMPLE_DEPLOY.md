# Simplest Deployment Method

The YAML deployment keeps failing. Let's deploy manually through the DigitalOcean UI.

## Step 1: Deploy API Service First

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Select repo: `kebson01/PrimeBrowardCRM`
5. Branch: `main`

### API Configuration:
- **Service Name**: `primebroward-crm-api`
- **Source Directory**: `/`
- **Dockerfile Path**: `Dockerfile.api`
- **HTTP Port**: `8000`
- **Instance Size**: Professional XS ($12/month)
- **Environment Variables**:
  - `PORT=8000`
  - `PYTHONUNBUFFERED=1`
- **Health Check Path**: `/api/health`

Click "Next" → "Create Resources"

Wait 5-10 minutes for API to deploy.

## Step 2: Get API URL

After API deploys successfully:
1. Click on the API service
2. Copy the public URL (e.g., `https://primebroward-crm-api-xxxxx.ondigitalocean.app`)

## Step 3: Deploy Frontend Service

1. Go back to Apps
2. Open your app
3. Click "Create" → "Component" → "Web Service"
4. Choose GitHub source again

### Frontend Configuration:
- **Service Name**: `primebroward-crm-frontend`
- **Source Directory**: `/`
- **Dockerfile Path**: `Dockerfile.frontend`
- **HTTP Port**: `80`
- **Instance Size**: Basic XXS ($5/month)
- **Environment Variables**:
  - `NODE_ENV=production`
  - `VITE_API_URL=https://your-api-url.ondigitalocean.app/api` (use the URL from Step 2)
- **Routes**: `/ (Catchall)`

Click "Save" → Deploy

## Step 4: Update CORS

After frontend deploys:
1. Note the frontend URL
2. Go to API service → Settings → Environment Variables
3. Add: `CORS_ORIGINS=https://your-frontend-url.ondigitalocean.app`
4. Click "Save"
5. Redeploy API service

## Done!

Visit your frontend URL to access the app.

## Cost
- API: $12/month (Professional XS)
- Frontend: $5/month (Basic XXS)
- **Total: $17/month**

## Troubleshooting

If API still fails to start:
- Check Runtime Logs in DigitalOcean dashboard
- Look for Python errors or import failures
- Ensure all dependencies are in requirements.txt

If Frontend can't connect to API:
- Verify VITE_API_URL is set correctly
- Check browser console for errors
- Verify CORS_ORIGINS includes frontend URL

