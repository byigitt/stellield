# Stage 04 – AI Portfolio Recommender (Apps)

1. Assemble feature builder combining snapshots, risk metrics, and bridge estimates into model-ready matrices.
2. Train baseline gradient-boosted regressor (e.g., LightGBM via `lightgbm-js` or hosted service) predicting Expected APY uplift versus Net APY.
3. Version models under `apps/server/models/` with metadata persisted to DB `ModelVersion` table.
4. Implement inference microservice inside server app exposing recommendation API with confidence + SHAP summaries.
5. Add evaluation jobs to backtest predictions against historical testnet data weekly.
