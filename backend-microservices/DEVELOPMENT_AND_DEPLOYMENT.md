# 🚀 Backend Microservices: Development & Deployment Guide

This document outlines how to test your 13-service architecture locally to mirror production as closely as possible, and how to deploy it to the cloud with a focus on **cost optimization**.

---

## 🛠 1. Local Development (The "Production Mirror")

To ensure what you test locally works in production, you must replicate the infrastructure (Postgres, Redis, RabbitMQ) and the networking environment.

### A. Infrastructure (Docker)
Start all backing services using Docker Compose. This ensures you aren't using "mock" databases.

```bash
cd backend-microservices
docker-compose up -d
```
*   **Postgres**: Accessible at `localhost:5432`
*   **Redis**: Accessible at `localhost:6379`
*   **RabbitMQ**: Management UI at `localhost:15672` (guest/guest)

### B. Environment Variables
Each service needs its own `.env` file. However, for a "Production Mirror", create a global configuration pattern. Use `packages/shared` to manage common config.

1. Copy `.env.example` to each service folder:
   ```bash
   cp .env.example services/auth-service/.env
   # Repeat for all 13 services
   ```

### C. Running All Services (NX)
Since this is an NX monorepo, running services manually is tedious. Use `nx run-many` to start the cluster:

```bash
# Start all services in development mode
npx nx run-many -t start:dev --all
```

*Note: Running 13 NestJS services simultaneously requires significant RAM (16GB+ recommended). If your machine struggles, only run the services you are actively testing.*

---

## 🧪 2. Testing Strategy

### A. Cross-Service Communication (gRPC)
Your services communicate via gRPC. To test this:
1. Ensure the `.proto` files are in the shared `proto/` directory.
2. If `event-service` needs to talk to `user-service`, both must be running.
3. Use a tool like **Postman** (which supports gRPC) or **grpcurl** to test individual gRPC endpoints without a frontend.

### B. Health Checks
Production environments (Render/Kubernetes) use health checks to verify uptime.
*   Test locally: `curl http://localhost:3000/health` (assuming Gateway is on 3000).
*   Ensure all services return `200 OK`.

---

## ☁️ 3. Deployment (Lowest Cost)

Deploying 13 microservices can be expensive. Here is the strategy for the **lowest cost**.

### Option 1: Render (Easiest, but can get pricey)
Your `render.yaml` is already configured. 
*   **Cost**: Render "Starter" plan is ~$7/service. 13 services = **$91/month**.
*   **Optimization**: 
    *   Use the **Free Tier** for non-critical services (they will sleep after 15 mins).
    *   Use **Render Blueprints** to manage everything as code.

### Option 2: DigitalOcean / Hetzner VPS (Cheapest)
For absolute lowest cost, buy one $10–$20/month VPS and run everything using **Docker Compose**.
*   **Cost**: Fixed **$10–$15/month**.
*   **How**:
    1. Build Docker images for each service.
    2. Push to Docker Hub or GHCR.
    3. Run `docker-compose up -d` on the VPS.
    4. Use **Nginx Proxy Manager** or **Traefik** as a reverse proxy for the Gateway.

### Option 3: Railway.app (Scalable & Fair)
Railway charges based on actual usage (CPU/RAM).
*   **Cost**: Variable, usually **$5–$20/month** for small-to-medium traffic.
*   **Pro**: Excellent DX, automatically detects your NX monorepo.

---

## 💾 4. Database Strategy

Do not host your own DB in production if you want "zero maintenance".
1. **Database**: Use **Supabase** (Postgres). Their free tier allows 500MB, which is plenty for starting.
2. **Redis**: Use **Upstash** (Serverless Redis). They have a very generous free tier.
3. **Secrets**: Use Render/Railway's Secret Management. Never commit `.env` files.

---

## 📝 Summary Checklist for "Production-Ready"
- [ ] **Migrations**: Always run migrations (`npm run migration:run`) before starting services.
- [ ] **Logging**: Use the `PinoLogger` implemented in `packages/shared`. In production, these logs should go to a log aggregator (Render does this automatically).
- [ ] **Rate Limiting**: Ensure the `ThrottlerModule` is active on the Gateway to prevent DDoS.
- [ ] **SSL**: Ensure `DB_SSL: true` is set when connecting to Supabase.

---
