#!/bin/bash
# Run this ON your EC2 instance (54.87.104.206) - one-time setup

set -e
echo "Setting up EC2 for Students Info deployment..."

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project structure
mkdir -p ~/studentsinfo/backend

# Create .env template
cat > ~/studentsinfo/backend/.env << 'EOF'
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
EOF

echo "Setup complete!"
echo ""
echo "1. Logout and login (or run: newgrp docker)"
echo "2. Edit ~/studentsinfo/backend/.env with your Supabase credentials"
echo "3. Copy docker-compose.prod.yml to ~/studentsinfo/"
echo "4. Push code to GitHub - deployment will run automatically"
