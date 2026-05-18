# MeriGauMata Deployment Guide

This guide covers deploying the microservices architecture to **Render**, **AWS**, and **VPS** (DigitalOcean/Linode/Ubuntu).

---

## Prerequisites

### Common Requirements
- Node.js 20+
- PostgreSQL database (Supabase or self-hosted)
- Domain name with SSL
- Git repository

### Required Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secure_password
DB_NAME=merigaumata
DB_SSL=false

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Services
NODE_ENV=production
PORT=3000

# External Services (optional)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## Option 1: Deploy to Render

### Step 1: Prepare Services

Each service needs a `render.yaml` or manual configuration. Create in each service:

**`services/auth-service/render.yaml`:**
```yaml
services:
  - type: web
    name: auth-service
    env: node
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DB_SCHEMA
        value: auth
```

### Step 2: Create Render Account

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository

### Step 3: Deploy Each Service

For each service (repeat for all 13):

1. **Create Web Service**
   - Repository: Select your repo
   - Branch: `main`
   - Root Directory: `services/auth-service` (adjust per service)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

2. **Environment Variables**
   - Add all required env vars
   - Add database connection string

3. **Deploy**
   - Click "Create Web Service"

### Service Order (Deploy First)

```
1. auth-service (port 3001)
2. user-service (port 3005)
3. product-service (port 3002)
4. cart-service (port 3003)
5. order-service (port 3004)
6. payment-service (port 3006)
7. content-service (port 3007)
8. storage-service (port 3008)
9. event-service (port 3009)
10. communication-service (port 3010)
11. analytics-service (port 3011)
12. cron-service (port 3012)
13. gateway-service (port 3000)
```

### Step 4: Configure Database (Supabase)

1. Create Supabase project
2. Run migrations for each schema:
   ```bash
   # For each service, update TypeORM config to use Supabase connection
   # Then run migration:
   npm run migration:run
   ```

3. Create schemas in Supabase:
   ```sql
   CREATE SCHEMA auth;
   CREATE SCHEMA product;
   CREATE SCHEMA cart;
   CREATE SCHEMA orders;
   CREATE SCHEMA users;
   CREATE SCHEMA payments;
   CREATE SCHEMA content;
   CREATE SCHEMA storage;
   CREATE SCHEMA events;
   CREATE SCHEMA analytics;
   CREATE SCHEMA communication;
   CREATE SCHEMA cron;
   ```

### Step 5: Configure Gateway

The gateway-service routes to other services. Update its environment:

```env
AUTH_SERVICE_URL=https://auth-service-xxx.onrender.com
PRODUCT_SERVICE_URL=https://product-service-xxx.onrender.com
CART_SERVICE_URL=https://cart-service-xxx.onrender.com
# ... etc
```

### Step 6: Set Up Custom Domain

1. In Render dashboard, go to your gateway service
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

---

## Option 2: Deploy to AWS

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         AWS Cloud                             │
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   ALB 1    │    │   ALB 2    │    │   ALB N    │       │
│  │ (Service 1)│    │(Service 2) │    │(Service N) │       │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                  │                  │              │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐       │
│  │ ECS Task   │    │ ECS Task   │    │ ECS Task   │       │
│  │ (Container)│    │(Container)│    │(Container)│       │
│  └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              RDS PostgreSQL (Aurora)                  │    │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐               │    │
│  │  │auth││prod││cart││order││user ││... │              │    │
│  │  └────┘└────┘└────┘└────┘└────┘└────┘               │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ElastiCache (Redis) - Optional           │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Step 1: Set Up ECS Cluster

```bash
# Install AWS CLI
aws configure

# Create ECS cluster
aws ecs create-cluster \
  --cluster-name merigaumata-prod \
  --capacity-providers FARGATE
```

### Step 2: Create Task Definitions

**`ecs-task-definition.json`:**
```json
{
  "family": "auth-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "auth-service",
      "image": "your-account/auth-service:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3001" },
        { "name": "DB_SCHEMA", "value": "auth" }
      ],
      "secrets": [
        { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..." }
      ]
    }
  ]
}
```

### Step 3: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

### Step 4: Create Services

```bash
# Create ECS service for auth-service
aws ecs create-service \
  --cluster merigaumata-prod \
  --service-name auth-service \
  --task-definition auth-service:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --load-balancers "[{targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=auth-service,containerPort=3001}]"
```

### Step 5: Set Up RDS PostgreSQL

```bash
# Create DB instance
aws rds create-db-instance \
  --db-instance-identifier merigaumata-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your_password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxx
```

### Step 6: Database Setup

```sql
-- Connect to RDS and create schemas
CREATE SCHEMA auth;
CREATE SCHEMA product;
CREATE SCHEMA cart;
CREATE SCHEMA orders;
CREATE SCHEMA users;
CREATE SCHEMA payments;
CREATE SCHEMA content;
CREATE SCHEMA storage;
CREATE SCHEMA events;
CREATE SCHEMA analytics;
CREATE SCHEMA communication;
CREATE SCHEMA cron;
```

### Step 7: Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name merigaumata-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-group sg-xxx

# Create target groups for each service
aws elbv2 create-target-group \
  --name auth-service-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxx
```

### Step 8: CI/CD with CodePipeline

```yaml
# buildspec.yml
version: 0.2
phases:
  install:
    commands:
      - npm install
  build:
    commands:
      - npm run build:shared
      - npm run build:all
  post_build:
    commands:
      - docker build -t $IMAGE_URL:$TAG services/auth-service
      - aws ecs update-service --cluster merigaumata-prod --service auth-service --force-new-deployment
```

### Step 9: Set Up Route 53 (DNS)

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name merigaumata.com \
  --caller-reference "2024-01-01"

# Create alias record for ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXX \
  --change-batch file://dns-record.json
```

---

## Option 3: Deploy to VPS (Ubuntu/DigitalOcean)

### Step 1: Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2 for process management
npm install -g pm2

# Install Redis (optional, for caching)
apt install -y redis-server
```

### Step 2: Database Setup

```bash
# Configure PostgreSQL
sudo -u postgres psql

-- Create database
CREATE DATABASE merigaumata;

-- Create schemas
CREATE SCHEMA auth;
CREATE SCHEMA product;
CREATE SCHEMA cart;
CREATE SCHEMA orders;
CREATE SCHEMA users;
CREATE SCHEMA payments;
CREATE SCHEMA content;
CREATE SCHEMA storage;
CREATE SCHEMA events;
CREATE SCHEMA analytics;
CREATE SCHEMA communication;
CREATE SCHEMA cron;

-- Create user for app
CREATE USER appuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE merigaumata TO appuser;
GRANT ALL ON SCHEMA auth TO appuser;
GRANT ALL ON SCHEMA product TO appuser;
-- ... repeat for all schemas
```

### Step 3: Clone and Build

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-org/merigaumata-backend.git
cd merigaumata-backend

# Install dependencies
npm install

# Build all services
npm run build:all

# Create environment file for each service
cp .env.example .env
# Edit with actual values
```

### Step 4: Configure Each Service

Create PM2 ecosystem file:

**`ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: 'services/auth-service/dist/main.js',
      cwd: '.',
      instances: 2,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_SCHEMA: 'auth'
      }
    },
    {
      name: 'product-service',
      script: 'services/product-service/dist/main.js',
      cwd: '.',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DB_HOST: 'localhost',
        DB_SCHEMA: 'product'
      }
    },
    // ... add all services
  ]
};
```

### Step 5: Start Services

```bash
# Start all services
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Step 6: Configure Nginx

**`/etc/nginx/sites-available/merigaumata`:**
```nginx
upstream auth_service {
    server 127.0.0.1:3001;
}

upstream product_service {
    server 127.0.0.1:3002;
}

upstream gateway_service {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.merigaumata.com;

    # Gateway routes
    location /auth/ {
        proxy_pass http://auth_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /products/ {
        proxy_pass http://product_service;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Add all other service routes
}

# HTTPS redirect
server {
    listen 443 ssl http2;
    server_name api.merigaumata.com;
    
    ssl_certificate /etc/letsencrypt/live/merigaumata.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/merigaumata.com/privkey.pem;
    
    # Include same location blocks as above
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/merigaumata /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 7: Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d api.merigaumata.com

# Auto-renewal
certbot renew --dry-run
```

### Step 8: Set Up Firewall

```bash
# Configure UFW
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Step 9: Monitoring & Logs

```bash
# View logs
pm2 logs

# Monitor status
pm2 monit

# Restart services
pm2 restart all

# Update and reload
git pull
npm run build:all
pm2 restart all
```

---

## Database Migration Steps

### For All Deployment Options

```bash
# Navigate to service
cd services/auth-service

# Generate migration from entity changes
npm run migration:generate -- -n AuthUpdate

# Run pending migrations
npm run migration:run

# Note: Each service has its own migration config
# Run for each: auth, product, cart, order, user, payment, content, storage, event, analytics, communication, cron
```

---

## Health Check Endpoints

All services expose:
- `GET /health` - Basic health
- `GET /health/ready` - Readiness (checks DB)
- `GET /health/live` - Liveness

Configure load balancer to use these for health checks.

---

## Scaling Guide

### Horizontal Scaling (More Instances)
```bash
# With PM2
pm2 scale auth-service 4

# With ECS
aws ecs update-service --cluster prod --service auth-service --desired-count 4
```

### Vertical Scaling (Bigger Instances)
- Update instance type in cloud console
- Update PM2 memory settings

---

## Rollback Procedure

### PM2 (VPS)
```bash
# List versions
pm2 list

# Rollback
pm2 rollback auth-service 2
```

### ECS
```bash
# Previous revision
aws ecs update-service --cluster prod --service auth-service --task-definition auth-service:previous
```

---

## Troubleshooting

### Common Issues

1. **Service won't start**
   - Check logs: `pm2 logs service-name`
   - Verify environment variables
   - Check database connectivity

2. **Connection refused**
   - Verify service is running: `pm2 list`
   - Check port not blocked by firewall

3. **Database connection error**
   - Verify PostgreSQL running
   - Check connection string
   - Verify schema exists

4. **502 Bad Gateway**
   - Check Nginx config
   - Verify upstream service running
   - Check logs

---

## Quick Reference Commands

### VPS
```bash
# Deploy updates
git pull && npm run build:all && pm2 restart all

# View all logs
pm2 logs --lines 100

# Monitor resources
pm2 monit

# Database backup
pg_dump merigaumata > backup.sql
```

### Render
```bash
# Manual deploy from dashboard or
curl -X POST https://api.render.com/v1/services/{service-id}/deploys
```

### AWS
```bash
# View service logs
aws ecs logs --cluster prod --service-name auth-service

# Scale service
aws ecs update-service --cluster prod --service auth-service --desired-count 3
```

---

## Next Steps

1. **Set up monitoring** (Datadog/New Relic/Prometheus)
2. **Configure backup** for database
3. **Set up log aggregation** (CloudWatch/ELK)
4. **Configure alerts** for errors/downtime
5. **SSL certificate renewal** (auto for Let's Encrypt)

---

For architecture details, see [Microservices Architecture](./microservices-architecture.md).