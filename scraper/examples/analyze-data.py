#!/usr/bin/env python3
"""
Example: Analyzing scraped data with Python/Pandas
Load and explore the CSV datasets for ML training
"""

import pandas as pd
import glob
import os
from pathlib import Path

# Path to output directory
OUTPUT_DIR = Path(__file__).parent.parent / "output"

def load_latest_file(pattern):
    """Load the most recent CSV file matching the pattern"""
    files = glob.glob(str(OUTPUT_DIR / pattern))
    if not files:
        print(f"⚠️  No files found for pattern: {pattern}")
        return None
    
    latest = max(files, key=os.path.getctime)
    print(f"📄 Loading: {os.path.basename(latest)}")
    return pd.read_csv(latest)

def analyze_defillama_yields():
    """Analyze DeFiLlama yield opportunities"""
    print("\n" + "="*60)
    print("📊 DeFiLlama Yield Analysis")
    print("="*60)
    
    df = load_latest_file("defillama_yields_*.csv")
    if df is None:
        return
    
    print(f"\n✓ Total pools: {len(df)}")
    print(f"✓ Chains: {df['chain'].nunique()}")
    print(f"✓ Projects: {df['project'].nunique()}")
    
    print("\n📈 APY Statistics:")
    print(df['apy'].describe())
    
    print("\n💰 TVL Statistics (USD):")
    print(df['tvl_usd'].describe())
    
    print("\n🔝 Top 10 Opportunities by APY:")
    top_apy = df.nlargest(10, 'apy')[['project', 'symbol', 'chain', 'apy', 'tvl_usd']]
    print(top_apy.to_string(index=False))
    
    print("\n💎 High TVL (>$1M) with Good APY (>5%):")
    high_tvl = df[(df['tvl_usd'] > 1000000) & (df['apy'] > 5)]
    print(f"Found {len(high_tvl)} opportunities")
    if len(high_tvl) > 0:
        print(high_tvl[['project', 'symbol', 'apy', 'tvl_usd']].head(10).to_string(index=False))

def analyze_stellar_pools():
    """Analyze Stellar liquidity pools"""
    print("\n" + "="*60)
    print("🌟 Stellar Liquidity Pools Analysis")
    print("="*60)
    
    df = load_latest_file("stellar_liquidity_pools_*.csv")
    if df is None:
        return
    
    print(f"\n✓ Total pools: {len(df)}")
    
    print("\n📊 Fee Structure:")
    print(df['fee_bp'].value_counts().head())
    
    print("\n🏊 Top Pools by Total Shares:")
    df['total_shares_numeric'] = pd.to_numeric(df['total_shares'], errors='coerce')
    top_pools = df.nlargest(10, 'total_shares_numeric')[
        ['reserve_0_asset', 'reserve_1_asset', 'total_shares', 'fee_bp']
    ]
    print(top_pools.to_string(index=False))

def analyze_prices():
    """Analyze token prices"""
    print("\n" + "="*60)
    print("💵 Token Prices Analysis")
    print("="*60)
    
    df = load_latest_file("coingecko_prices_*.csv")
    if df is None:
        return
    
    print(f"\n✓ Total assets: {len(df)}")
    
    print("\n💰 Current Prices:")
    prices = df[['asset_id', 'usd_price']].sort_values('usd_price', ascending=False)
    print(prices.to_string(index=False))

def create_ml_dataset():
    """Combine multiple sources for ML training"""
    print("\n" + "="*60)
    print("🤖 Creating ML Dataset")
    print("="*60)
    
    yields_df = load_latest_file("defillama_yields_*.csv")
    prices_df = load_latest_file("coingecko_prices_*.csv")
    
    if yields_df is None:
        print("⚠️  Cannot create ML dataset without yields data")
        return
    
    # Feature engineering
    print("\n🔧 Feature Engineering...")
    
    # Clean and prepare features
    ml_df = yields_df.copy()
    
    # Handle missing values
    ml_df['apy_base'] = ml_df['apy_base'].fillna(ml_df['apy'])
    ml_df['apy_reward'] = ml_df['apy_reward'].fillna(0)
    
    # Create binary features
    ml_df['is_stablecoin'] = ml_df['stablecoin'].fillna(False).astype(int)
    ml_df['has_il_risk'] = ml_df['il_risk'].notna().astype(int)
    
    # Risk categories
    def categorize_risk(row):
        if pd.isna(row['il_risk']) or row['il_risk'] == 'no':
            return 'low'
        elif row['il_risk'] == 'yes':
            return 'high'
        else:
            return 'medium'
    
    ml_df['risk_category'] = ml_df.apply(categorize_risk, axis=1)
    
    # Select features for ML
    features = [
        'apy', 'apy_base', 'apy_reward', 'tvl_usd',
        'is_stablecoin', 'has_il_risk'
    ]
    
    ml_features = ml_df[features].dropna()
    
    print(f"✓ ML Dataset shape: {ml_features.shape}")
    print(f"✓ Features: {features}")
    
    print("\n📊 Feature Correlations:")
    correlations = ml_features.corr()['apy'].sort_values(ascending=False)
    print(correlations)
    
    # Save ML-ready dataset
    output_file = OUTPUT_DIR / "ml_ready_dataset.csv"
    ml_features.to_csv(output_file, index=False)
    print(f"\n✅ Saved ML-ready dataset to: {output_file}")
    
    return ml_features

def main():
    """Main analysis function"""
    print("🚀 Stellar Hackathon Data Analysis")
    print("Analyzing scraped DeFi datasets...")
    
    # Run analyses
    analyze_defillama_yields()
    analyze_stellar_pools()
    analyze_prices()
    
    # Create ML dataset
    ml_data = create_ml_dataset()
    
    print("\n" + "="*60)
    print("✅ Analysis Complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Train ML models using ml_ready_dataset.csv")
    print("2. Build predictive models for APY optimization")
    print("3. Create risk classification models")
    print("4. Implement portfolio optimization algorithms")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
