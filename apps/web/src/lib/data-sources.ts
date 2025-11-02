const DEFILLAMA_YIELD_URL = "https://yields.llama.fi/pools";
const DEFILLAMA_BRIDGE_URL = "https://bridges.llama.fi/bridge";
const DEFILLAMA_CHAIN_TVL_URL = "https://api.llama.fi/v2/historicalChainTvl";
const DEFILLAMA_DEX_OVERVIEW_URL = "https://api.llama.fi/overview/dexs";
const AGGRELEND_APY_URL =
	"https://app.aggrelend.com/api/get-apy-list?token=SOL&includeMeta=true";
const MARINADE_BASE_URL = "https://api.marinade.finance";
const HORIZON_BASE_URL = "https://horizon.stellar.org";
const COINGECKO_SIMPLE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price";

export interface DefiLlamaPool {
	chain: string;
	project: string;
	symbol: string;
	tvlUsd: number | null;
	apy: number | null;
	apyBase?: number | null;
	apyReward?: number | null;
	apyMean30d?: number | null;
	apyPct7D?: number | null;
	pool?: string;
	poolMeta?: string | null;
	exposure?: string | null;
	ilRisk?: string | null;
	rewardTokens?: string[] | null;
	predictions?: {
		predictedClass?: string | null;
		predictedProbability?: number | null;
		binnedConfidence?: number | null;
	} | null;
	underlyingTokens?: string[] | null;
	stablecoin?: boolean | null;
}

export interface BridgeStats {
	id: number;
	name: string;
	displayName: string;
	lastDailyVolume: number;
	weeklyVolume: number;
	monthlyVolume: number;
	lastHourlyVolume?: number;
	currentDayVolume?: number;
	prevDayTxs?: {
		deposits: number;
		withdrawals: number;
	};
	weeklyTxs?: {
		deposits: number;
		withdrawals: number;
	};
	monthlyTxs?: {
		deposits: number;
		withdrawals: number;
	};
	chainBreakdown?: Record<
		string,
		{
			lastDailyVolume?: number;
			weeklyVolume?: number;
			monthlyVolume?: number;
			prevDayTxs?: {
				deposits: number;
				withdrawals: number;
			};
			weeklyTxs?: {
				deposits: number;
				withdrawals: number;
			};
			monthlyTxs?: {
				deposits: number;
				withdrawals: number;
			};
		}
	>;
}

export interface AggreLendEntry {
	apy: string;
	market: string;
}

export interface AggreLendResponse {
	timestamp: string;
	coins: Record<
		string,
		{
			apy: AggreLendEntry[];
			bestApy?: string;
			bestMarket?: string;
			lastUpdated?: string;
		}
	>;
}

export interface MarinadeApyResponse {
	value: number;
	end_time: string;
	end_price?: number;
	start_time?: string;
	start_price?: number;
}

export interface MarinadeTvlResponse {
	total_usd: number;
	total_sol: number;
}

export interface HorizonLiquidityPool {
	id: string;
	fee_bp: number;
	type: string;
	total_trustlines: string;
	total_shares: string;
	reserves: Array<{
		asset: string;
		amount: string;
	}>;
	last_modified_time: string;
}

export interface HorizonLiquidityResponse {
	_embedded: {
		records: HorizonLiquidityPool[];
	};
}

export interface DexOverviewResponse {
	chain: string;
	total24h: number;
	total7d: number;
	total30d: number;
	change_1d: number | null;
	change_7d: number | null;
	change_1m?: number | null;
}

export interface CoinGeckoPriceResponse {
	[id: string]: {
		usd?: number;
	};
}

export interface ChainTvlDatum {
	date: number;
	tvl: number;
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
	const response = await fetch(input, {
		...init,
		headers: {
			accept: "application/json",
			...(init?.headers ?? {}),
		},
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status} ${response.statusText}`);
	}

	return response;
}

export async function fetchDefiLlamaPools(chain: string) {
	const url = `${DEFILLAMA_YIELD_URL}?chain=${encodeURIComponent(chain)}`;
	const response = await safeFetch(url);
	const json = (await response.json()) as { data?: DefiLlamaPool[] };
	const desiredChain = chain.toLowerCase();
	return (json.data ?? []).filter((pool) => {
		const poolChain = pool.chain?.toLowerCase() ?? "";
		const hasMetrics = pool.tvlUsd !== null && pool.apy !== null;
		return hasMetrics && poolChain === desiredChain;
	});
}

export async function fetchBridgeStats(bridgeId: number) {
	const url = `${DEFILLAMA_BRIDGE_URL}/${bridgeId}`;
	const response = await safeFetch(url);
	return (await response.json()) as BridgeStats;
}

export async function fetchAggreLendData() {
	const response = await safeFetch(AGGRELEND_APY_URL);
	return (await response.json()) as AggreLendResponse;
}

export async function fetchMarinadeApy() {
	const response = await safeFetch(`${MARINADE_BASE_URL}/msol/apy/7d`);
	return (await response.json()) as MarinadeApyResponse;
}

export async function fetchMarinadeTvl() {
	const response = await safeFetch(`${MARINADE_BASE_URL}/tlv`);
	return (await response.json()) as MarinadeTvlResponse;
}

export async function fetchHorizonLiquidityPools(limit = 20) {
	const response = await safeFetch(
		`${HORIZON_BASE_URL}/liquidity_pools?limit=${limit}`,
	);
	return (await response.json()) as HorizonLiquidityResponse;
}

export async function fetchChainTvlHistory(chain: string) {
	const response = await safeFetch(
		`${DEFILLAMA_CHAIN_TVL_URL}/${encodeURIComponent(chain)}`,
	);
	return (await response.json()) as ChainTvlDatum[];
}

export async function fetchAssetPriceUsd(assetId: string) {
	const params = new URLSearchParams({
		ids: assetId,
		vs_currencies: "usd",
	});
	const response = await safeFetch(
		`${COINGECKO_SIMPLE_PRICE_URL}?${params.toString()}`,
	);
	const json = (await response.json()) as CoinGeckoPriceResponse;
	const price = json[assetId]?.usd;

	if (typeof price !== "number") {
		throw new Error(`Missing USD price for asset: ${assetId}`);
	}

	return price;
}

export async function fetchDexOverview(chain: string) {
	const url = `${DEFILLAMA_DEX_OVERVIEW_URL}/${encodeURIComponent(
		chain,
	)}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`;
	const response = await safeFetch(url);
	return (await response.json()) as DexOverviewResponse;
}
