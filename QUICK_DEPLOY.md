# Quick Deploy to DigitalOcean

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy via DigitalOcean Web Interface

1. **Go to DigitalOcean**: https://cloud.digitalocean.com/apps

2. **Click "Create App"**

3. **Connect GitHub**:
   - Select "GitHub" as source
   - Authorize DigitalOcean
   - Choose repo: `kebson01/PrimeBrowardCRM`
   - Branch: `main`

4. **Configure Services**:

   **Backend (API)**:
   - Service Type: Web Service
   - Dockerfile: `Dockerfile.api`
   - Port: `8000`
   - Environment Variables:
     ```
     API_HOST=0.0.0.0
     API_PORT=8000
     DATABASE_PATH=/app/data/primebroward.db
     DATA_DIR=/app/data
     ```
   - Health Check: `/api/health`
   - Plan: Basic ($5/month)

   **Frontend**:
   - Service Type: Web Service  
   - Dockerfile: `Dockerfile.frontend`
   - Port: `80`
   - Environment Variables:
     ```
     VITE_API_URL=https://[YOUR-API-URL].ondigitalocean.app
     NODE_ENV=production
     ```
   - Plan: Basic ($5/month)

5. **Deploy!**
   - Click "Create Resources"
   - Wait 5-10 minutes

6. **Update CORS** (After deployment):
   - Note your frontend URL
   - Go to API service → Settings → Environment Variables
   - Add: `CORS_ORIGINS` = `https://[YOUR-FRONTEND-URL].ondigitalocean.app`
   - Redeploy API

### Step 3: Import Your Data

Once deployed, visit your app and use the Import/Export feature to upload your CSV file.

## 📝 Important Notes

- **Database**: SQLite files are temporary. For production, consider using DigitalOcean Managed Database ($15/month)
- **CORS**: Must update after deployment with actual URLs
- **Cost**: ~$10/month for both services

## 🔧 Troubleshooting

**API not working?**
- Check: `https://your-api-url.ondigitalocean.app/api/health`
- Verify CORS_ORIGINS includes frontend URL

**Frontend not loading?**
- Check VITE_API_URL is correct
- Look at build logs in DigitalOcean dashboard

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions.

