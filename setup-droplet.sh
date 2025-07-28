#!/bin/bash

# Digital Ocean Droplet Setup Script
# Run this on your droplet after SSH connection

set -e

echo "🚀 Setting up Digital Ocean Droplet for Uncommon Backend..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "📋 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/uncommon-backend
cd /opt/uncommon-backend

# Install Git
echo "📚 Installing Git..."
apt install git -y

# Clone your repository (replace with your actual repo URL)
echo "📥 Cloning repository..."
git clone https://github.com/your-username/learn-nestjs.git .

# Create production environment file
echo "⚙️  Creating environment file..."
cat > .env << EOF
# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=_uncommon

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (SendGrid recommended)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.your_sendgrid_api_key_here
FROM_EMAIL=no-reply@yourdomain.com

# Application Configuration
NODE_ENV=production
PORT=3001
EOF

echo "🔐 Please edit the .env file with your actual values:"
echo "   nano .env"

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking application health..."
curl -f http://localhost:3001/health || echo "Health check failed, check logs with: docker-compose logs"

echo "✅ Setup complete!"
echo "🌐 Your application should be available at: http://YOUR_DROPLET_IP:3001"
echo "📊 Check status with: docker-compose -f docker-compose.prod.yml ps"
echo "📝 View logs with: docker-compose -f docker-compose.prod.yml logs -f" 