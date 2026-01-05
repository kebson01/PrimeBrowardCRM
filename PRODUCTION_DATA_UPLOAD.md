# How to Upload Your Local Database to DigitalOcean

Since importing the 652 MB CSV directly to DigitalOcean doesn't work due to size/memory limits, here's how to upload your locally-populated database:

## Steps:

### 1. Import Data Locally (Already Done!)
You've already imported the CSV locally at:
```
C:\Users\Saint\Documents\GitHub\PrimeBrowardCRM\server\data\primebroward.db
```

### 2. Upload Database to DigitalOcean

You have several options:

#### Option A: Use DigitalOcean Spaces (Recommended)

1. **Create a Space** (object storage):
   - Go to: https://cloud.digitalocean.com/spaces
   - Click "Create Space"
   - Choose NYC region (same as your app)
   - Name: `primebroward-data`
   - Cost: ~$0.02/month for 1GB

2. **Upload your database file**:
   - Upload `server/data/primebroward.db` to the Space
   - Make it temporarily public (or use a CDN URL)

3. **Download in your app**:
   - Add a startup script to download the DB file on first run
   - Or manually download via SSH/terminal

#### Option B: Include Database in Docker Image

1. **Copy database to project**:
   ```powershell
   # Make sure your DB is in server/data/
   ls server/data/primebroward.db
   ```

2. **Update Dockerfile.api** to include data:
   ```dockerfile
   # Copy database file (if exists)
   COPY server/data/*.db /app/data/ 2>/dev/null || :
   ```

3. **Commit and deploy**:
   ```powershell
   git add server/data/primebroward.db
   git commit -m "Add pre-populated database"
   git push origin main
   ```

**⚠️ Warning**: This will make your Docker image very large (~650 MB). Git might reject files this large.

#### Option C: Use Git LFS (Git Large File Storage)

If you want the database in Git but it's too large:

1. **Install Git LFS**:
   ```powershell
   git lfs install
   ```

2. **Track the database file**:
   ```powershell
   git lfs track "server/data/*.db"
   git add .gitattributes
   ```

3. **Add and commit**:
   ```powershell
   git add server/data/primebroward.db
   git commit -m "Add database via Git LFS"
   git push origin main
   ```

#### Option D: Direct Upload via SSH/Console (Most Direct)

1. **Get shell access to your app**:
   ```powershell
   doctl apps logs 9783a3cb-331d-4719-ab64-52c70c0e99c6 --component api
   ```

2. **Use doctl to execute commands** (if available)
   
   Or use DigitalOcean's console to access the container

3. **Upload file using SCP/SFTP** to the running container

---

## My Recommendation:

**For Now**: Use **Option A (DigitalOcean Spaces)** or **Option B (Docker Image)**

### Quick Guide for Option B:

1. Check if your database was created locally:
   ```powershell
   ls -lh server/data/primebroward.db
   ```

2. Check the size:
   ```powershell
   (Get-Item server/data/primebroward.db).Length / 1MB
   ```

3. If it's reasonable (<100 MB), try adding to Docker:
   - Update `Dockerfile.api` to copy the data folder
   - Commit and push
   - DigitalOcean will rebuild with the database included

4. If it's too large (>100 MB):
   - Use DigitalOcean Spaces
   - Upload the DB file there
   - Modify the app to download it on first startup

---

## Alternative: Increase Upload Limits (Advanced)

You could configure Nginx to allow larger uploads, but this still won't solve:
- Memory constraints (1GB RAM not enough for 652MB + processing)
- Upload time (would still take 10-30 minutes)

**Not recommended for your use case.**

---

## Need Help?

Let me know which option you'd like to try, and I'll help you implement it!

