# Deployment Guide - Render + Supabase

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Auth Service  │
│   (Next.js)     │     │   (Render)      │
└─────────────────┘     └────────┬────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │  (Single DB)    │
                        │  - auth schema  │
                        │  - users schema │
                        │  - catalog      │
                        │  - orders       │
                        └─────────────────┘
```

## Prerequisites

1. **Supabase Project**: Create a project at https://supabase.com
2. **Render Account**: Sign up at https://render.com

## Setup Steps

### 1. Database Setup (Supabase)

Run migration to create `auth` schema:

```bash
# From Supabase Dashboard > SQL Editor
# Copy contents of: services/auth-service/migrations/001_create_auth_schema.sql
```

Or use psql:
```bash
psql "postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" -f services/auth-service/migrations/001_create_auth_schema.sql
```

### 2. Generate JWT Keys

```bash
# Generate private key
openssl genrsa -out jwt-private.pem 2048

# Extract public key
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem

# Encode to single line (for environment variable)
cat jwt-public.pem | tr '\n' '$' | sed 's/\$/\\n/g'
```

### 3. Deploy to Render

**Option A: Blueprints (Recommended)**
```bash
# Install Render CLI
brew install render-cli

# Create blueprint
render blueprint create -f render.yaml
```

**Option B: Manual Deploy**
1. Push code to GitHub
2. Create new Web Service on Render
3. Configure environment variables (see below)

### 4. Environment Variables

Set these in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DB_HOST` | From Supabase settings |
| `DB_PORT` | `5432` |
| `DB_NAME` | `postgres` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | From Supabase settings |
| `DB_SSL` | `true` |
| `CORS_ORIGIN` | Your frontend URL |
| `JWT_PRIVATE_KEY` | (Your generated key) |
| `JWT_PUBLIC_KEY` | (Your generated public key) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

## Adding More Services

For each new service (Product, Order, etc.):

1. Create service folder under `services/`
2. Add migration with unique schema (e.g., `catalog`, `orders`)
3. Add entry to `render.yaml`
4. Each service connects to same Supabase DB with different schema

## Local Development

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Run auth service
cd services/auth-service
npm install
cp .env.example .env  # Update with local values
npm run start:dev
```