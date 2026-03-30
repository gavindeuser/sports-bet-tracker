export type BetFilters = {
  startDate?: string;
  endDate?: string;
  sport?: string;
  result?: string;
  betType?: string;
  timing?: "live" | "pregame";
  wager?: "parlay" | "straight";
  sort?: "asc" | "desc";
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseBetFilters(
  searchParams: Record<string, string | string[] | undefined>,
): BetFilters {
  const timing = getSingleValue(searchParams.timing);
  const wager = getSingleValue(searchParams.wager);
  const sort = getSingleValue(searchParams.sort);

  return {
    startDate: getSingleValue(searchParams.startDate) || undefined,
    endDate: getSingleValue(searchParams.endDate) || undefined,
    sport: getSingleValue(searchParams.sport) || undefined,
    result: getSingleValue(searchParams.result) || undefined,
    betType: getSingleValue(searchParams.betType) || undefined,
    timing: timing === "live" || timing === "pregame" ? timing : undefined,
    wager: wager === "parlay" || wager === "straight" ? wager : undefined,
    sort: sort === "asc" ? "asc" : "desc",
  };
}

export function buildSearchParams(filters: BetFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}
