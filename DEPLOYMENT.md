# End-to-End Deployment Guide

## Workflow Overview

```
Git Push → GitHub Actions → Build Docker Images → Push to Docker Hub → Deploy to EC2
```

| Step | Where | What Happens |
|------|-------|--------------|
| 1 | Your machine | Push code to GitHub |
| 2 | GitHub Actions | Run tests, build Docker images |
| 3 | Docker Hub | Images pushed to `saikiranbolakonda/studentsinfo-*` |
| 4 | EC2 | SSH in, pull images, run containers |

---

## Prerequisites

- GitHub repository
- Docker Hub account (saikiranbolakonda)
- EC2 instance (54.87.104.206)
- Supabase project

---

## Step 1: Add GitHub Secrets

1. Go to **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_USERNAME` | saikiranbolakonda | Docker Hub username |
| `DOCKER_PASSWORD` | your-docker-hub-token | Docker Hub Access Token |
| `EC2_HOST` | 54.87.104.206 | EC2 public IP |
| `EC2_USER` | ec2-user | SSH username |
| `EC2_SSH_KEY` | (paste full private key) | SSH private key content |

**Docker Hub token:** Account Settings → Security → New Access Token  
**EC2 SSH key:** Copy entire contents of your `.pem` file

---

## Step 2: One-Time EC2 Setup

SSH into EC2 and run:

```bash
ssh -i your-key.pem ec2-user@54.87.104.206

# Copy and run setup script
chmod +x ec2-setup.sh
./ec2-setup.sh

# Logout and login (for docker group)
exit
ssh -i your-key.pem ec2-user@54.87.104.206
```

Edit `.env` with your Supabase credentials:

```bash
nano ~/studentsinfo/backend/.env
```

Add:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

Copy `docker-compose.prod.yml` to EC2 (from your local machine):

```bash
scp -i your-key.pem docker-compose.prod.yml ec2-user@54.87.104.206:~/studentsinfo/
```

---

## Step 3: Configure EC2 Security Group

Allow inbound traffic:

| Type | Port | Source |
|------|------|--------|
| Custom TCP | 8000 | 0.0.0.0/0 |
| Custom TCP | 3000 | 0.0.0.0/0 |
| SSH | 22 | Your IP |

AWS Console → EC2 → Instance → Security → Edit inbound rules

---

## Step 4: Run the Workflow

1. Push code to `main` or `master` branch:

```bash
git add .
git commit -m "Deploy"
git push origin main
```

2. Go to **GitHub** → **Actions** tab
3. Watch the pipeline: Test → Build → Push → Deploy

---

## Manual Deployment (if needed)

If you need to deploy manually on EC2:

```bash
ssh -i your-key.pem ec2-user@54.87.104.206

cd ~/studentsinfo

# Using docker-compose
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Or using docker run
docker pull saikiranbolakonda/studentsinfo-backend:latest
docker pull saikiranbolakonda/studentsinfo-frontend:latest

docker run -d --name studentsinfo-backend -p 8000:8000 \
  --env-file ~/studentsinfo/backend/.env \
  --restart unless-stopped \
  saikiranbolakonda/studentsinfo-backend:latest

docker run -d --name studentsinfo-frontend -p 3000:80 \
  --restart unless-stopped \
  saikiranbolakonda/studentsinfo-frontend:latest
```

---

## Local Docker (Development)

```bash
# Build and run locally
docker-compose up --build

# Access:
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
```

---

## Access Your Application

- **Backend API:** http://54.87.104.206:8000  
- **API Docs:** http://54.87.104.206:8000/docs  
- **Frontend:** http://54.87.104.206:3000  

---

## Troubleshooting

**Deploy job fails:**
- Verify all 5 GitHub secrets are set correctly
- Ensure EC2 SSH key has correct permissions
- Check EC2 security group allows SSH (port 22) from GitHub Actions IPs

**Can't access from browser:**
- Check EC2 security group allows ports 8000 and 3000
- On EC2: `docker ps` to verify containers are running
- On EC2: `curl http://localhost:8000` to test locally
test
**Docker Hub push fails:**
- Verify DOCKER_USERNAME and DOCKER_PASSWORD
- Use Docker Hub Access Token, not account password
