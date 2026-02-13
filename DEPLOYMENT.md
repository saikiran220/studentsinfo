# End-to-End Deployment Guide

## Quick Deploy Checklist

1. **GitHub secrets** (Settings → Environments → production):
   - `EC2_SSH_KEY` = **base64 of .pem** (recommended – avoids multiline corruption):
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\Admin\Downloads\sai-kiran.pem"))
     ```
     Copy the full output (one long line). Paste into secret.
   - `EC2_HOST` = `100.53.133.29` (IP only)
   - `EC2_USER` = `ec2-user`
   - `DOCKER_PASSWORD` = Docker Hub token

2. **EC2**: Create `~/studentsinfo/backend/.env` with `SUPABASE_URL` and `SUPABASE_KEY`

3. **EC2 Security Group**: Allow SSH (22), 8000, 3000 from `0.0.0.0/0`

4. **Push**: `git push origin main`

---

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

1. Go to **GitHub repo** → **Settings** → **Environments** → **production** (create it if needed)
2. Add **Environment secrets** under production:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_PASSWORD` | your-docker-hub-token | Docker Hub Access Token |
| `EC2_HOST` | 54.87.104.206 | EC2 public IP |
| `EC2_USER` | ec2-user | SSH username |
| `EC2_SSH_KEY` | (paste raw PEM) | Open .pem in Notepad, copy everything including BEGIN/END lines. No base64. |

**Or** add them as **Repository secrets** (Settings → Secrets and variables → Actions).

**Docker Hub token:** Account Settings → Security → New Access Token  

**EC2 SSH key (recommended – base64 avoids multiline corruption):**
```powershell
# In PowerShell, from project folder:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\Admin\Downloads\sai-kiran.pem"))
```
Copy the output (single line) and paste into `EC2_SSH_KEY`.

**Alternative (raw PEM):** Paste the full `.pem` content including `-----BEGIN...` and `-----END...`. If SSH still fails, use base64 instead.

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

| Type | Port | Source | Notes |
|------|------|--------|-------|
| Custom TCP | 8000 | 0.0.0.0/0 | Backend API |
| Custom TCP | 3000 | 0.0.0.0/0 | Frontend |
| SSH | 22 | 0.0.0.0/0 | **Required** for GitHub Actions deploy |

> **Important:** SSH (22) must allow `0.0.0.0/0` so GitHub Actions can connect. Use your EC2 security group or key-based auth for security.

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

**Deploy job fails with "Permission denied (publickey)":**
- **Verify key fingerprint**: Locally run `ssh-keygen -lf sai-kiran.pem`. The workflow logs show "Key fingerprint: ..." – it must match. If different, the secret has wrong/truncated key.
- **Use base64** – Avoid multiline corruption. PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\sai-kiran.pem"))`. Copy the entire output (2300+ chars), no truncation.
- **Key pair must match EC2** – AWS Console → EC2 → Instance → "Key pair name" must be sai-kiran.
- **Security group** – Port 22 from `0.0.0.0/0`
- Secrets in **production** environment
- On EC2: `~/studentsinfo/backend/.env` with `SUPABASE_URL` and `SUPABASE_KEY`

**Can't access from browser:**
- Check EC2 security group allows ports 8000 and 3000
- On EC2: `docker ps` to verify containers are running
- On EC2: `curl http://localhost:8000` to test locally

**Docker Hub push fails:**
- Verify DOCKER_USERNAME and DOCKER_PASSWORD
- Use Docker Hub Access Token, not account password
