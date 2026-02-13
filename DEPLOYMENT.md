# Deployment Guide - Connecting Docker and Git

This guide will help you set up your CI/CD pipeline and deploy your application.

## 📋 Prerequisites

- GitHub account
- Docker installed locally (for testing)
- Git installed

## 🚀 Step-by-Step Setup

### Step 1: Initialize Git Repository (if not already done)

```bash
cd d:\react-native\studentsinfo
git init
git add .
git commit -m "Initial commit with Docker and CI/CD setup"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `studentsinfo`
4. Choose **Public** or **Private**
5. **Don't** initialize with README (you already have files)
6. Click **"Create repository"**

### Step 3: Connect Local Repository to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/studentsinfo.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Configure GitHub Container Registry (GHCR)

Your workflow is already configured to use GitHub Container Registry. No additional setup needed!

**Images will be published to:**
- `ghcr.io/YOUR_USERNAME/studentsinfo-backend:latest`
- `ghcr.io/YOUR_USERNAME/studentsinfo-frontend:latest`

### Step 5: Set Up GitHub Secrets (if needed for deployment)

If you need to deploy to a server, add secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets if deploying:

   - `DEPLOY_HOST` - Your server IP/domain
   - `DEPLOY_USER` - SSH username
   - `DEPLOY_SSH_KEY` - Private SSH key for server access
   - `SUPABASE_URL` - (if not in .env)
   - `SUPABASE_KEY` - (if not in .env)

### Step 6: Test the CI/CD Pipeline

1. Make a small change to any file
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push
   ```
3. Go to your GitHub repository
4. Click **Actions** tab
5. Watch your workflow run!

### Step 7: View Built Docker Images

1. Go to your GitHub profile
2. Click **Packages** (or go to `https://github.com/YOUR_USERNAME?tab=packages`)
3. You'll see:
   - `studentsinfo-backend`
   - `studentsinfo-frontend`

## 🐳 Local Docker Testing

### Option 1: Using Docker Compose (Recommended)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    env_file:
      - ./backend/.env

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
```

**Run locally:**
```bash
docker-compose up --build
```

### Option 2: Run Individual Containers

**Backend:**
```bash
cd backend
docker build -t studentsinfo-backend .
docker run -p 8000:8000 --env-file .env studentsinfo-backend
```

**Frontend:**
```bash
cd frontend
docker build -t studentsinfo-frontend .
docker run -p 3000:80 studentsinfo-frontend
```

## 🌐 Deployment Options

### Option A: Deploy to VPS/Server (SSH)

Add this to your workflow's deploy job:

```yaml
- name: Deploy to Server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.DEPLOY_SSH_KEY }}
    script: |
      docker pull ghcr.io/${{ github.actor }}/studentsinfo-backend:latest
      docker pull ghcr.io/${{ github.actor }}/studentsinfo-frontend:latest
      docker-compose up -d
```

### Option B: Deploy to Cloud Platforms

#### AWS (ECS/Fargate)
- Use AWS ECR instead of GHCR
- Update workflow to push to ECR
- Deploy using ECS tasks

#### Google Cloud Platform (Cloud Run)
- Use Google Container Registry
- Deploy using `gcloud run deploy`

#### Azure (Container Instances)
- Use Azure Container Registry
- Deploy using Azure CLI

### Option C: Use Docker Hub Instead

If you prefer Docker Hub:

1. **Update workflow:**
   ```yaml
   env:
     REGISTRY: docker.io
     BACKEND_IMAGE: YOUR_DOCKERHUB_USERNAME/studentsinfo-backend
     FRONTEND_IMAGE: YOUR_DOCKERHUB_USERNAME/studentsinfo-frontend
   ```

2. **Add Docker Hub secret:**
   - Go to GitHub Secrets
   - Add `DOCKER_USERNAME` and `DOCKER_PASSWORD`

3. **Update login step:**
   ```yaml
   - name: Log in to Docker Hub
     uses: docker/login-action@v3
     with:
       username: ${{ secrets.DOCKER_USERNAME }}
       password: ${{ secrets.DOCKER_PASSWORD }}
   ```

## 📝 Pull Images from GHCR

To pull images from GitHub Container Registry:

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull images
docker pull ghcr.io/YOUR_USERNAME/studentsinfo-backend:latest
docker pull ghcr.io/YOUR_USERNAME/studentsinfo-frontend:latest
```

## ✅ Checklist

- [ ] Git repository initialized
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] CI/CD workflow runs successfully
- [ ] Docker images built and pushed to GHCR
- [ ] Local Docker testing works
- [ ] Deployment configured (if needed)

## 🔧 Troubleshooting

### Workflow fails with permission errors
- Check that `permissions: packages: write` is set in workflow
- Verify GitHub token has package write access

### Docker build fails locally
- Check Docker is running: `docker ps`
- Verify Dockerfile syntax
- Check build context paths

### Images not appearing in GHCR
- Wait a few minutes for sync
- Check workflow logs for errors
- Verify image names don't have invalid characters

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Documentation](https://docs.docker.com/)
