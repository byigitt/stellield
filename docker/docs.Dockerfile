# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy docs package.json
COPY apps/docs/package.json ./apps/docs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy docs source code
COPY apps/docs ./apps/docs

# Build the documentation site
RUN pnpm --filter docs build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built files and dependencies
COPY --from=builder --chown=nodejs:nodejs /app/apps/docs/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/docs/.next/static ./apps/docs/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/docs/public ./apps/docs/public

USER nodejs

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the Next.js server
CMD ["node", "apps/docs/server.js"]
