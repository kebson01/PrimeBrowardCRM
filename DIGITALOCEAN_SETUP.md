# DigitalOcean Deployment - Step by Step Guide

## Follow These Steps Exactly

### Step 1: Go to DigitalOcean Apps
Open this link: https://cloud.digitalocean.com/apps

### Step 2: Create New App
Click the **"Create App"** button (blue button, usually top right)

### Step 3: Connect to GitHub
1. If not already connected, click **"Connect to GitHub"**
2. Authorize DigitalOcean to access your repositories
3. Select repository: **kebson01/PrimeBrowardCRM**
4. Branch: **main**
5. Check the box for **"Autodeploy"** (deploys automatically on push)
6. Click **"Next"**

### Step 4: Edit App Spec (CRITICAL!)
⚠️ **DO NOT click "Next" on the "Configure Your App" page yet!**

Instead:
1. Look for a link/button that says one of these:
   - **"Edit Your App Spec"**
   - **"Edit App Spec"**
   - **"Use App Spec"**
   - Or a small **</> icon** (code/YAML icon)
   
   This is usually located:
   - Bottom left of the page, OR
   - Top right near the "Next" button, OR
   - In a dropdown menu

2. Click it to open the **YAML editor**

### Step 5: Replace the YAML
1. In the YAML editor, **select all** the existing text (Ctrl+A)
2. **Delete it**
3. **Copy** the entire YAML spec from the file: `.do/app.yaml` in your project
   - OR copy the YAML spec below ⬇️

### Step 6: YAML Spec to Use
```yaml
name: primebroward-crm
region: nyc

services:
  - name: api
    github:
      repo: kebson01/PrimeBrowardCRM
      branch: main
      deploy_on_push: true
    dockerfile_path: Dockerfile.api
    http_port: 8000
    instance_count: 1
    instance_size_slug: basic-xs
    envs:
      - key: PORT
        value: "8000"
      - key: API_HOST
        value: "0.0.0.0"
      - key: API_PORT
        value: "8000"
      - key: DATABASE_PATH
        value: "/app/data/primebroward.db"
      - key: DATA_DIR
        value: "/app/data"
      - key: PYTHONUNBUFFERED
        value: "1"
      - key: CORS_ORIGINS
        value: "*"
    health_check:
      http_path: /api/health
      initial_delay_seconds: 60
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 5

  - name: frontend
    github:
      repo: kebson01/PrimeBrowardCRM
      branch: main
      deploy_on_push: true
    dockerfile_path: Dockerfile.frontend
    http_port: 80
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: "production"
```

### Step 7: Save the YAML
Click **"Save"** or **"Apply"** in the YAML editor

### Step 8: Verify Configuration
After saving, you should see:
- ✅ **2 services** listed: `api` and `frontend`
- ✅ Service type should mention **"Docker"** or **"Dockerfile"**
- ❌ If you see **"Node.js"** or **"Python"** without "Docker", something went wrong - go back to Step 4

### Step 9: Finalize and Deploy
1. Click **"Next"**
2. Review the configuration:
   - **App Name**: primebroward-crm
   - **Region**: NYC
   - **API Service**: basic-xs ($12/month)
   - **Frontend Service**: basic-xxs ($5/month)
   - **Total cost**: ~$17/month
3. Click **"Create Resources"**

### Step 10: Monitor Deployment
1. You'll be taken to the app dashboard
2. Click on the **"Deployments"** tab
3. Click on the active deployment (in progress)
4. Watch the **build logs**

**Look for these success indicators:**
- ✅ `Building service from Dockerfile` (means it's using Docker - GOOD!)
- ✅ `Successfully built...` 
- ✅ `[*] Starting PrimeBroward CRM API...`
- ✅ `[OK] API ready at...`

**If you see these, something is WRONG:**
- ❌ `Detected Node.js app`
- ❌ `Installing dependencies from package.json`
- ❌ `npm install`

### Deployment Time
- Initial build: 3-5 minutes
- If it takes longer than 10 minutes, check the logs for errors

### After Successful Deployment
1. Go to the **"Components"** tab
2. Copy the public URLs for:
   - **API service**: e.g., `https://primebroward-crm-api-xxxxx.ondigitalocean.app`
   - **Frontend service**: e.g., `https://primebroward-crm-frontend-xxxxx.ondigitalocean.app`
3. Open the frontend URL in your browser
4. You should see the PrimeBroward CRM login/dashboard!

### Troubleshooting
If it still fails:
1. Check the **Runtime Logs** in the deployment details
2. Screenshot any errors and share them
3. We can try alternative approaches

### Cost Optimization (Optional)
Once everything is working, you can:
- Downgrade API from `basic-xs` to `basic-xxs` ($5/month) if performance is acceptable
- Total would be ~$10/month instead of $17/month

## Need Help?
If you get stuck at any step, take a screenshot and share it!

