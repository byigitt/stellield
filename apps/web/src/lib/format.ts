const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const THOUSAND = 1_000;

export function formatCompactUsd(
	value?: number | null,
	suffix = "",
): string {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "-";
	}

	if (value >= BILLION) {
		return `$${(value / BILLION).toFixed(2)}B${suffix}`;
	}

	if (value >= MILLION) {
		return `$${(value / MILLION).toFixed(2)}M${suffix}`;
	}

	if (value >= THOUSAND) {
		return `$${(value / THOUSAND).toFixed(2)}K${suffix}`;
	}

	return `$${value.toFixed(0)}${suffix}`;
}

export function formatPercentDelta(
	value?: number | null,
	fractionDigits = 2,
): string | null {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return null;
	}

	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(fractionDigits)}%`;
}

export function formatPercent(
	value?: number | null,
	fractionDigits = 2,
): string {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "-";
	}
	return `${value.toFixed(fractionDigits)}%`;
}
