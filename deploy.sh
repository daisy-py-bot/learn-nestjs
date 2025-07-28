#!/bin/bash

# Deployment script for Digital Ocean

set -e

echo "Starting deployment..."

# Build the Docker image
echo "Building Docker image..."
docker build -t uncommon-backend .

# Tag the image
echo "Tagging image..."
docker tag uncommon-backend:latest uncommon-backend:$(date +%Y%m%d-%H%M%S)

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo "Waiting for services to be healthy..."
sleep 30

# Check health
echo "Checking service health..."
curl -f http://localhost:3001/health || exit 1

echo "✅ Deployment completed successfully!" 