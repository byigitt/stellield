# Docker · Service Images

Curated Dockerfiles and Compose configuration for the Stellield monorepo.

## Contents
- `web.Dockerfile` — Next.js dashboard standalone image
- `server.Dockerfile` — Elysia+tRPC API runtime
- `docs.Dockerfile` — Fumadocs static site
- `agent.Dockerfile` — FastAPI Gemini agent
- `docker-compose.yml` — Full-stack deployment with Postgres

## Usage
```bash
docker-compose up --build
```
Provision Postgres, agent, server, web, docs with health checks. Override environment values via `.env`.

### Build Individually
```bash
docker build -f docker/web.Dockerfile -t stellield-web .
```
Repeat for `server`, `docs`, and `agent` images.
