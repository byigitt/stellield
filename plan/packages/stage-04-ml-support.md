# Stage 04 – ML Support Utilities (Packages)

1. Add `packages/api/src/services/features.ts` to assemble feature vectors (risk scores, APY history, bridge costs).
2. Define TypeScript types for model inputs/outputs shared between training scripts and inference service.
3. Store model metadata via Prisma `ModelVersion` (fields: name, version, artifactPath, trainedAt, metrics JSON).
4. Provide serialization helpers to load/save model artifacts (e.g., JSON, ONNX) from `apps/server/models`.
5. Write unit tests ensuring feature assembly handles missing data gracefully.
