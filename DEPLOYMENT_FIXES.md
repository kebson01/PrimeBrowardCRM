# Deployment Fixes Applied

## Issues Fixed

1. **Resource Limits**: Changed API instance from `basic-xxs` to `basic-xs` for more memory/CPU
2. **Startup Time**: Increased health check initial delay to 60 seconds
3. **Error Handling**: Added try-catch blocks in startup code
4. **Directory Creation**: Ensured data directories are created at startup
5. **CORS Configuration**: Fixed to handle empty origins list
6. **Health Checks**: Made health checks more tolerant (5 failures before marking unhealthy)

## Changes Made

### Dockerfile.api
- Added health check
- Added environment variables for better logging
- Set proper permissions on data directories
- Added `--workers 1` to uvicorn for stability

### server/app/main.py
- Added error handling in lifespan function
- Ensured directories are created before use
- Better error messages and logging

### .do/app.yaml
- Increased API instance size to `basic-xs` ($12/month instead of $5)
- Increased health check delays
- Made health checks more tolerant

## Next Steps

1. **Commit and push the fixes**:
   ```bash
   git add .
   git commit -m "Fix deployment issues - increase resources and improve error handling"
   git push origin main
   ```

2. **Redeploy in DigitalOcean**:
   - The app should auto-redeploy when you push
   - Or manually trigger a redeploy from the dashboard

3. **Monitor the logs**:
   - Go to DigitalOcean dashboard → Your App → Runtime Logs
   - Watch for any startup errors

## If It Still Fails

Check the logs for specific errors. Common issues:

1. **Database connection errors**: The SQLite file might need to be initialized
2. **Import errors**: Check if all Python dependencies are installed
3. **Port conflicts**: Ensure port 8000 is available
4. **Memory issues**: Consider upgrading to `basic-s` ($24/month)

## Alternative: Deploy Services Separately

If the combined deployment still fails, try deploying services separately:

1. Deploy API first
2. Wait for it to be healthy
3. Note the API URL
4. Deploy frontend with the API URL in VITE_API_URL

