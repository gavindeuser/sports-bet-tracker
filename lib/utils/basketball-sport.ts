const PROFESSIONAL_BASKETBALL_MARKERS = new Set([
  "hawks",
  "celtics",
  "nets",
  "hornets",
  "bulls",
  "cavaliers",
  "mavericks",
  "nuggets",
  "pistons",
  "warriors",
  "rockets",
  "pacers",
  "clippers",
  "lakers",
  "grizzlies",
  "heat",
  "bucks",
  "timberwolves",
  "pelicans",
  "knicks",
  "thunder",
  "magic",
  "76ers",
  "suns",
  "blazers",
  "kings",
  "spurs",
  "raptors",
  "jazz",
  "wizards",
  "lynx",
  "mercury",
  "liberty",
  "aces",
  "fever",
  "storm",
  "sky",
  "dream",
  "wings",
  "mystics",
  "sparks",
  "sun",
  "valkyries",
]);

const NHL_TEAM_MARKERS = new Set([
  "ducks",
  "bruins",
  "sabres",
  "flames",
  "hurricanes",
  "blackhawks",
  "avalanche",
  "blue jackets",
  "stars",
  "red wings",
  "oilers",
  "panthers",
  "kings",
  "wild",
  "canadiens",
  "predators",
  "devils",
  "islanders",
  "rangers",
  "senators",
  "flyers",
  "penguins",
  "kraken",
  "sharks",
  "blues",
  "lightning",
  "maple leafs",
  "utah hockey club",
  "canucks",
  "golden knights",
  "capitals",
  "jets",
]);

const HOCKEY_NATIONAL_TEAM_MARKERS = new Set([
  "finland",
  "usa",
]);

const GOLF_MARKERS = new Set([
  "scheffler",
  "mcilroy",
  "schauffele",
  "dechambeau",
  "rahm",
  "morikawa",
  "hovland",
  "thomas",
  "spieth",
  "koepka",
  "cantlay",
  "homa",
  "aberg",
  "im",
  "matsuyama",
  "burns",
  "fowler",
  "fleetwood",
  "lowry",
  "fitzpatrick",
  "day",
  "young",
  "clark",
  "finau",
  "harman",
  "scott",
  "kim",
]);

const SOCCER_TEAM_MARKERS = new Set([
  "arsenal",
  "aston villa",
  "atl madrid",
  "atletico madrid",
  "barcelona",
  "bayern",
  "bayern munich",
  "chelsea",
  "crystal palace",
  "dortmund",
  "everton",
  "inter",
  "inter milan",
  "juventus",
  "liverpool",
  "man city",
  "man united",
  "newcastle",
  "nottingham forest",
  "psg",
  "real madrid",
  "roma",
  "spurs",
  "tottenham",
]);

const MOTORSPORTS_MARKERS = new Set([
  "norris",
  "verstappen",
  "leclerc",
  "hamilton",
  "russell",
  "piastri",
  "sainz",
  "alonso",
  "gasly",
  "ocon",
  "stroll",
  "tsunoda",
  "albon",
  "hulkenberg",
  "bottas",
  "perez",
]);

const COLLEGE_BASKETBALL_KEYWORDS = [
  "university",
  "college",
  "state",
  "st.",
  "san ",
  "uc ",
  "ucla",
  "usc",
  "byu",
  "tcu",
  "vcu",
];

function normalizeSegment(selection: string) {
  return selection.trim().replace(/\s+/g, " ");
}

function getPrimarySelectionSegment(selection: string) {
  return normalizeSegment(selection.split("/")[0] ?? selection);
}

function segmentWords(segment: string) {
  return segment
    .toLowerCase()
    .split(/[\s,()-]+/)
    .filter(Boolean);
}

function isProfessionalBasketballSelection(segment: string) {
  const normalized = segment.toLowerCase();
  if (PROFESSIONAL_BASKETBALL_MARKERS.has(normalized)) {
    return true;
  }

  const words = segmentWords(segment);
  return words.some((word) => PROFESSIONAL_BASKETBALL_MARKERS.has(word));
}

function isCollegeBasketballSelection(segment: string) {
  const normalized = segment.toLowerCase();

  if (COLLEGE_BASKETBALL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return true;
  }

  if (isProfessionalBasketballSelection(segment)) {
    return false;
  }

  // Product rule: plain school/city names should be treated as college basketball.
  return true;
}

export function classifyBasketballSport(sport: string, selection: string) {
  if (sport !== "Basketball") {
    return sport;
  }

  const primarySegment = getPrimarySelectionSegment(selection);
  return isCollegeBasketballSelection(primarySegment) ? "NCAAB" : "NBA";
}

function isHockeySelection(segment: string) {
  const normalized = segment.toLowerCase();
  if (NHL_TEAM_MARKERS.has(normalized)) {
    return true;
  }

  if (Array.from(NHL_TEAM_MARKERS).some((marker) => normalized.includes(marker))) {
    return true;
  }

  return Array.from(HOCKEY_NATIONAL_TEAM_MARKERS).some(
    (marker) => normalized === marker || normalized.startsWith(`${marker} `),
  );
}

function isGolfSelection(segment: string) {
  const words = segmentWords(segment);
  return words.some((word) => GOLF_MARKERS.has(word));
}

function isSoccerSelection(segment: string) {
  const normalized = segment.toLowerCase();
  if (SOCCER_TEAM_MARKERS.has(normalized)) {
    return true;
  }

  return Array.from(SOCCER_TEAM_MARKERS).some((marker) => normalized.includes(marker));
}

function isMotorsportsSelection(segment: string) {
  const words = segmentWords(segment);
  return words.some((word) => MOTORSPORTS_MARKERS.has(word));
}

export function classifySport(sport: string, selection: string) {
  if (sport === "Basketball") {
    return classifyBasketballSport(sport, selection);
  }

  if (sport === "Other") {
    const primarySegment = getPrimarySelectionSegment(selection);
    if (isHockeySelection(primarySegment)) {
      return "Hockey";
    }

    if (isGolfSelection(primarySegment)) {
      return "Golf";
    }

    if (isSoccerSelection(primarySegment)) {
      return "Soccer";
    }

    if (isMotorsportsSelection(primarySegment)) {
      return "Motorsports";
    }
  }

  return sport;
}
