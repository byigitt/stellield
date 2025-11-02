# Docs App · Fumadocs Site

This Next.js/Fumadocs project powers Stellield's documentation portal, ideal for publishing API guides, runbooks, and tutorials.

## Highlights
- Fumadocs MDX content pipeline with `source.config.ts`
- Animated landing pages under `app/(home)`
- Built-in search (`app/api/search`) and components from `fumadocs-ui`

## Develop Locally
```bash
pnpm install          # once from repo root
pnpm dev:docs         # http://localhost:3002
```

Update documentation by adding MDX files in `content/` and wiring navigation in `src/`. The site respects the root `.env` when deployed via Docker (`docker/docs.Dockerfile`).
