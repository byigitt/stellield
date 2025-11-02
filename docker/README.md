# Docker Configuration

This directory contains Dockerfiles for all services in the Stellar Hackathon monorepo.

## 📁 Files

- **`web.Dockerfile`** - Next.js frontend application (port 3001)
- **`server.Dockerfile`** - Elysia API server with tRPC (port 3000)
- **`docs.Dockerfile`** - Fumadocs documentation site (port 3002)
- **`agent.Dockerfile`** - Python FastAPI AI agent (port 8000)
- **`.dockerignore`** - Optimizes build context by excluding unnecessary files

## 🚀 Quick Start

### Local Development

```bash
# From repository root
docker-compose up --build
```

### Build Individual Services

```bash
# Web
docker build -f docker/web.Dockerfile -t stellar-web .

# Server
docker build -f docker/server.Dockerfile -t stellar-server .

# Docs
docker build -f docker/docs.Dockerfile -t stellar-docs .

# Agent
docker build -f docker/agent.Dockerfile -t stellar-agent .
```

### Run Individual Services

```bash
# Web (requires server to be running)
docker run -p 3001:3001 --env-file .env stellar-web

# Server (requires postgres and agent)
docker run -p 3000:3000 --env-file .env stellar-server

# Docs
docker run -p 3002:3002 stellar-docs

# Agent
docker run -p 8000:8000 --env-file .env stellar-agent
```

## 🏗️ Build Stages

All Dockerfiles use multi-stage builds for optimal image size:

### Node.js Services (web, server, docs)

1. **Builder stage**: 
   - Installs pnpm
   - Copies workspace configuration
   - Installs all dependencies
   - Builds the application with Turbo

2. **Runner stage**:
   - Minimal Node.js runtime
   - Only production dependencies
   - Non-root user for security
   - Health checks enabled

### Python Service (agent)

1. **Builder stage**:
   - Installs build dependencies (gcc, g++)
   - Installs Python packages

2. **Runner stage**:
   - Slim Python runtime
   - Only runtime dependencies
   - Non-root user
   - Health checks enabled

## 📊 Image Sizes (Approximate)

- **web**: ~180 MB (Next.js standalone)
- **server**: ~150 MB (Node.js + built packages)
- **docs**: ~180 MB (Next.js standalone)
- **agent**: ~250 MB (Python with AI libraries)
- **postgres**: ~80 MB (Alpine Linux)

## 🔧 Optimization Features

### Layer Caching
Dependencies are installed before copying source code, maximizing Docker layer cache efficiency.

### Standalone Output
Next.js apps use standalone output mode, which:
- Includes only necessary files
- Reduces image size by ~60%
- Faster cold starts

### Multi-stage Builds
Build dependencies are discarded in final images:
- TypeScript compiler not in production
- Python build tools not in runtime
- Development dependencies excluded

### .dockerignore
Excludes from build context:
- `node_modules` (rebuilt inside container)
- `.venv` (Python virtual env)
- Build artifacts
- Git history
- IDE files

## 🏥 Health Checks

Each service includes health checks:

```dockerfile
# Web & Docs
HEALTHCHECK CMD node -e "require('http').get('http://localhost:PORT/', ...)"

# Server
HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/', ...)"

# Agent
HEALTHCHECK CMD curl -f http://localhost:8000/health

# Postgres
HEALTHCHECK CMD pg_isready -U postgres
```

## 🔐 Security

### Non-root Users
All services run as non-root users:
- Node services: `nodejs:nodejs` (UID 1001)
- Agent: `agent:agent`
- Postgres: default postgres user

### Signal Handling
Server uses `dumb-init` for proper signal forwarding and zombie process reaping.

### Minimal Base Images
- Alpine Linux for Node.js services (smaller attack surface)
- Python slim for agent (security updates only)

## 🐛 Troubleshooting

### Build fails with "ENOENT" errors

**Problem**: Missing files or incorrect paths

**Solution**:
```bash
# Ensure you're building from repository root
cd /path/to/stellar-hackathon
docker build -f docker/web.Dockerfile .
```

### "pnpm: command not found"

**Problem**: pnpm installation failed

**Solution**: 
- Check Dockerfile has `corepack enable`
- Ensure Node version is 20+

### Agent build fails

**Problem**: Python dependency compilation errors

**Solution**:
```bash
# Ensure build tools are installed in builder stage
RUN apt-get update && apt-get install -y gcc g++
```

### Health check always failing

**Problem**: Service not listening on expected port

**Solution**:
```bash
# Check service logs
docker logs <container-id>

# Verify port is exposed
docker port <container-id>

# Test health endpoint manually
docker exec <container-id> curl localhost:8000/health
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- [Dokploy Documentation](https://docs.dokploy.com)

---

For full deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)
