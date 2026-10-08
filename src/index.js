// Serves the static site, plus /api/matches: Team Czechia's matches pulled from the official
// results site (results.first.global), so the schedule shows live times, fields and scores.

const RESULTS_URL = "https://results.first.global/";
const TEAM = "CZE";
const CACHE_SECONDS = 30;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/matches") return matches(request, ctx);
    return env.ASSETS.fetch(request);
  },
};

async function matches(request, ctx) {
  const cache = caches.default;
  const key = new Request(new URL("/api/matches", request.url));
  const cached = await cache.match(key);
  if (cached) return cached;

  let body;
  try {
    const res = await fetch(RESULTS_URL, { headers: { "user-agent": "Mozilla/5.0 (Team Czechia site)" } });
    if (!res.ok) throw new Error(`results site returned ${res.status}`);
    body = { matches: ourMatches(await res.text()), updated: new Date().toISOString() };
  } catch (err) {
    return json({ matches: [], error: String(err) }, 502, 0);
  }

  const response = json(body, 200, CACHE_SECONDS);
  ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}

// Pulls the match list out of the page's Next.js data and keeps only our matches.
// Stations 11–13 are the red alliance, 21–23 blue.
function ourMatches(html) {
  const raw = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!raw) throw new Error("match data not found on results site");
  const all = JSON.parse(raw[1]).props.pageProps.data.matches;

  return all
    .filter(m => m.participants.some(p => p.country === TEAM))
    .map(m => {
      const color = s => (s < 20 ? "red" : "blue");
      const us = m.participants.find(p => p.country === TEAM);
      const alliance = color(us.station);
      const codes = side => m.participants.filter(p => color(p.station) === side).map(p => p.country);
      return {
        match: Number(m.name.replace(/\D+/g, "")) || m.id,
        name: m.name,
        field: m.field,
        kst: m.scheduledTime,
        alliance,
        with: codes(alliance).filter(c => c !== TEAM),
        vs: codes(alliance === "red" ? "blue" : "red"),
        score: m.played ? (alliance === "red" ? m.redScore : m.blueScore) : null,
      };
    })
    .sort((a, b) => Date.parse(a.kst) - Date.parse(b.kst));
}

function json(data, status, maxAge) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}
