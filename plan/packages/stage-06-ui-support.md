# Stage 06 – UI Support Contracts (Packages)

1. Define lightweight DTO mappers in `packages/api/src/mappers` to shape responses for dashboard cards (includes APY deltas, badges, bridge summaries).
2. Ensure all responses include `updatedAt` timestamps so UI can display freshness indicators.
3. Provide mock data generators for Storybook or unit tests (`packages/api/src/mocks`) aligning with real schemas.
4. Synchronize enum definitions (risk tiers, asset categories) via shared exports to avoid drift between front/back ends.
5. Add snapshot tests verifying mapper outputs remain stable across schema changes.
