# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/reviews-service ./apps/reviews-service
COPY libs ./libs

# Build the application
RUN pnpm build reviews-service

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3005

# Start the application
CMD ["node", "dist/apps/reviews-service/main.js"]
