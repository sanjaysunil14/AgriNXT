# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache openssl
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Build stage (for Prisma generation)
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 app

# Copy necessary files
COPY --from=builder --chown=app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=app:nodejs /app/prisma ./prisma
COPY --chown=app:nodejs . .

USER app

EXPOSE 5000

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
