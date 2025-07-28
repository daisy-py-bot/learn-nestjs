# Deployment Guide - Digital Ocean

## Prerequisites

1. **Digital Ocean Account** - Sign up at [digitalocean.com](https://digitalocean.com)
2. **Docker** - Install Docker on your local machine
3. **Domain** (Optional) - For custom domain setup

## Option 1: Digital Ocean App Platform (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Update `.do/app.yaml` with your repository details
3. Set up environment variables in Digital Ocean dashboard

### Step 2: Deploy on Digital Ocean
1. Go to Digital Ocean App Platform
2. Click "Create App"
3. Connect your GitHub repository
4. Digital Ocean will automatically detect the app spec
5. Configure environment variables
6. Deploy!

## Option 2: Digital Ocean Droplet (Manual)

### Step 1: Create Droplet
1. Create a new Ubuntu droplet
2. Choose Docker image or install Docker manually
3. Set up SSH access

### Step 2: Deploy Application
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone your repository
git clone https://github.com/your-username/learn-nestjs.git
cd learn-nestjs

# Create production environment file
cp .env.production.example .env
# Edit .env with your production values

# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

Create a `.env` file with these variables:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=_uncommon

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email (SendGrid recommended)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.your_sendgrid_api_key_here
FROM_EMAIL=no-reply@yourdomain.com

# App
NODE_ENV=production
PORT=3000
```

## Health Checks

Your application includes health checks:
- Endpoint: `GET /health`
- Docker health check configured
- Monitors application status

## Monitoring

- **Logs**: `docker-compose logs -f`
- **Health**: `curl http://your-domain/health`
- **Database**: `docker-compose exec db psql -U postgres`

## SSL/HTTPS

For production, set up SSL:
1. Use Digital Ocean's built-in SSL
2. Or configure with Let's Encrypt
3. Update your domain DNS settings

## Backup Strategy

1. **Database**: Regular PostgreSQL backups
2. **Code**: Git repository
3. **Environment**: Document all variables

## Troubleshooting

### Common Issues:
1. **Port conflicts**: Ensure port 3000 is available
2. **Database connection**: Check DB_HOST and credentials
3. **Email sending**: Verify SendGrid API key
4. **Memory issues**: Monitor container resources

### Commands:
```bash
# View logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Check health
curl http://localhost:3000/health

# Access database
docker-compose exec db psql -U postgres -d _uncommon
``` 