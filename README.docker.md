# Docker Deployment Guide

This guide will help you deploy the Farmer-Buyer Procurement Management System using Docker.

## Prerequisites

- **Docker** installed ([Download Docker](https://www.docker.com/get-started))
- **Docker Compose** installed (comes with Docker Desktop)

## Quick Start

### 1. Verify Environment Variables

The `.env` file has been pre-configured with your settings. Review it to ensure all values are correct:

```bash
# View the environment variables
cat .env
```

**Important**: Make sure these values are set correctly:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Your Twilio credentials
- `GEMINI_API_KEY` - Your Google Gemini API key
- `DEV_TEST_NUMBER` - Your WhatsApp test number for development

### 2. Build and Start the Application

```bash
# Build and start all services
docker-compose up --build -d
```

This command will:
- Pull the PostgreSQL image
- Build the backend Docker image
- Build the frontend Docker image
- Start all services in detached mode

### 3. Check Service Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## Database Management

### Run Migrations Manually

```bash
docker-compose exec backend npx prisma migrate deploy
```

### Seed the Database

```bash
docker-compose exec backend npm run seed
```

### Access Prisma Studio

```bash
docker-compose exec backend npx prisma studio
```

Then open: http://localhost:5555

### Backup Database

```bash
docker-compose exec postgres pg_dump -U farmuser farmer_buyer_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U farmuser farmer_buyer_db
```

## Common Commands

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove All Data (including database)

```bash
docker-compose down -v
```

### Restart a Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### Rebuild a Specific Service

```bash
docker-compose up --build -d backend
docker-compose up --build -d frontend
```

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands Inside Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access PostgreSQL shell
docker-compose exec postgres psql -U farmuser -d farmer_buyer_db
```

## Production Deployment

### Update Frontend API URL

Before building for production, ensure your frontend is pointing to the correct backend URL.

1. Create/update `frontend/.env.production`:

```env
VITE_API_URL=http://your-backend-url:3000
```

2. Update `frontend/src/config.js` or wherever your API URL is configured.

### Security Checklist

- ✅ Change `JWT_SECRET` to a strong random value
- ✅ Change `POSTGRES_PASSWORD` to a strong password
- ✅ Configure proper firewall rules
- ✅ Use HTTPS/SSL certificates (add nginx reverse proxy)
- ✅ Set proper CORS origins in backend
- ✅ Keep all API keys secure and never commit `.env` to git

### Deploy to Cloud

For cloud deployment (AWS, DigitalOcean, etc.):

1. Install Docker on your server
2. Copy project files to the server
3. Configure `.env` with production values
4. Run: `docker-compose up -d`
5. Set up a reverse proxy (Nginx) for HTTPS

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait a few seconds and check again
# - Migration errors: Run migrations manually
# - Environment variables: Check .env file
```

### Frontend Not Loading

```bash
# Check logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build -d frontend
```

### Port Already in Use

If you see "port already in use" errors:

1. Stop conflicting services
2. Or change ports in `.env`:
   - `FRONTEND_PORT=8080`
   - `BACKEND_PORT=3001`
   - `POSTGRES_PORT=5433`

## Development Mode

For development with hot-reload:

```bash
# Run backend in dev mode
cd backend
npm install
npm run dev

# Run frontend in dev mode
cd frontend
npm install
npm run dev
```

Keep only the PostgreSQL container running:

```bash
docker-compose up postgres -d
```

## Monitoring

### Check Resource Usage

```bash
docker stats
```

### Check Disk Space

```bash
# View Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all required API keys are configured
4. Check database connectivity

## Architecture

```
┌─────────────────┐
│    Frontend     │ (Port 80)
│   Nginx + React │
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│     Backend     │ (Port 3000)
│  Node.js + API  │
└────────┬────────┘
         │
         │ PostgreSQL Protocol
         │
┌────────▼────────┐
│   PostgreSQL    │ (Port 5432)
│    Database     │
└─────────────────┘
```

All services communicate through a Docker network called `app-network`.
