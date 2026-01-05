# DigitalOcean Deployment Guide

This guide will help you deploy PrimeBroward CRM to DigitalOcean App Platform.

## Prerequisites

1. **DigitalOcean Account** - Sign up at [digitalocean.com](https://www.digitalocean.com)
2. **GitHub Repository** - Your code should be pushed to GitHub (already done ✅)
3. **DigitalOcean CLI (optional)** - For command-line deployment

## Deployment Steps

### Option 1: Using DigitalOcean Web Interface (Recommended)

1. **Log in to DigitalOcean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Sign in or create an account

2. **Create a New App**
   - Click "Create" → "Apps"
   - Select "GitHub" as your source
   - Authorize DigitalOcean to access your GitHub account
   - Select repository: `kebson01/PrimeBrowardCRM`
   - Select branch: `main`

3. **Configure Backend Service (API)**
   - DigitalOcean will detect the `Dockerfile.api`
   - Service name: `api`
   - HTTP Port: `8000`
   - Environment Variables:
     ```
     API_HOST=0.0.0.0
     API_PORT=8000
     CORS_ORIGINS=https://your-frontend-url.ondigitalocean.app
     DATABASE_PATH=/app/data/primebroward.db
     DATA_DIR=/app/data
     ```
   - Health Check Path: `/api/health`
   - Instance Size: `Basic` → `Basic XXS` ($5/month)

4. **Configure Frontend Service**
   - DigitalOcean will detect the `Dockerfile.frontend`
   - Service name: `frontend`
   - HTTP Port: `80`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-api-url.ondigitalocean.app
     NODE_ENV=production
     ```
   - Instance Size: `Basic` → `Basic XXS` ($5/month)

5. **Review and Deploy**
   - Review your configuration
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

6. **Update CORS Settings**
   - After deployment, note your frontend URL
   - Go to API service → Settings → Environment Variables
   - Update `CORS_ORIGINS` with your actual frontend URL
   - Redeploy the API service

### Option 2: Using DigitalOcean CLI

```bash
# Install doctl
# Windows: choco install doctl
# Mac: brew install doctl
# Linux: See https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Deploy from app.yaml
doctl apps create --spec .do/app.yaml
```

## Post-Deployment Configuration

### 1. Import Your CSV Data

After deployment, you'll need to import your BCPA data:

**Option A: Via Web Interface**
1. Go to your deployed app
2. Navigate to Import/Export section
3. Upload your CSV file

**Option B: Via API**
```bash
curl -X POST "https://your-api-url.ondigitalocean.app/api/import-export/import" \
  -F "file=@/path/to/your/data.csv"
```

### 2. Database Persistence

⚠️ **Important**: By default, DigitalOcean App Platform uses ephemeral storage. Your database will be lost on redeploy.

**Solution: Use DigitalOcean Managed Database**

1. Create a PostgreSQL database in DigitalOcean
2. Update your backend to use PostgreSQL instead of SQLite
3. Update connection string in environment variables

**OR: Use DigitalOcean Spaces (Object Storage)**
- Store database file in Spaces
- Mount it as a volume in your app

### 3. Custom Domain (Optional)

1. Go to your app → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS_ORIGINS to include your custom domain

## Environment Variables Reference

### Backend (API) Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_HOST` | API host address | `0.0.0.0` |
| `API_PORT` | API port | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `DATABASE_PATH` | Path to SQLite database | `/app/data/primebroward.db` |
| `DATA_DIR` | Data directory path | `/app/data` |

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://127.0.0.1:8000/api` |
| `NODE_ENV` | Node environment | `production` |

## Cost Estimation

- **Backend Service**: $5/month (Basic XXS)
- **Frontend Service**: $5/month (Basic XXS)
- **Total**: ~$10/month

Optional:
- **Managed Database**: $15/month (Basic)
- **Custom Domain**: Free (you pay for domain registration)

## Troubleshooting

### API Not Connecting

1. Check API health: `https://your-api-url.ondigitalocean.app/api/health`
2. Verify CORS_ORIGINS includes your frontend URL
3. Check API logs in DigitalOcean dashboard

### Frontend Not Loading

1. Check build logs in DigitalOcean dashboard
2. Verify `VITE_API_URL` is set correctly
3. Check browser console for errors

### Database Issues

1. SQLite files are ephemeral - use managed database for production
2. Check file permissions in `/app/data`
3. Verify DATA_DIR environment variable

## Monitoring

- **Logs**: Available in DigitalOcean dashboard → App → Runtime Logs
- **Metrics**: CPU, Memory, Request count in dashboard
- **Alerts**: Set up alerts for high error rates or resource usage

## Updates and Redeployment

1. Push changes to GitHub `main` branch
2. DigitalOcean will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger redeploy from dashboard

## Support

- DigitalOcean Docs: [docs.digitalocean.com](https://docs.digitalocean.com)
- App Platform Guide: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform)

